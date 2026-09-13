import OSS from 'ali-oss'
import type { VercelRequest, VercelResponse } from '@vercel/node'

type UploadPayload = {
  image?: unknown
  imageThumbnail?: unknown
}

type AppGlobal = typeof globalThis & { kiwiOssClient?: OSS }

const appGlobal = globalThis as AppGlobal
const MAX_IMAGE_DATA_BYTES = 2_800_000
const MAX_TOTAL_IMAGE_DATA_BYTES = 3_200_000

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } }

function sendError(response: VercelResponse, status: number, message: string) {
  return response.status(status).json({ error: message })
}

function getOssClient() {
  if (appGlobal.kiwiOssClient) return appGlobal.kiwiOssClient

  const required = ['OSS_REGION', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_BUCKET']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) throw new Error('缺少 OSS 环境变量：' + missing.join('、'))

  appGlobal.kiwiOssClient = new OSS({
    region: process.env.OSS_REGION as string,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID as string,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET as string,
    bucket: process.env.OSS_BUCKET as string,
    secure: true,
  })
  return appGlobal.kiwiOssClient
}

function parseDataUrl(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('data:image/')) return null
  const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i)
  if (!match) return null
  return { contentType: match[1], buffer: Buffer.from(match[2], 'base64') }
}

function publicUrl(key: string) {
  const baseUrl = process.env.OSS_PUBLIC_BASE_URL?.replace(/\/$/, '')
  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  if (baseUrl) return baseUrl + '/' + encodedKey
  return 'https://' + process.env.OSS_BUCKET + '.' + process.env.OSS_REGION + '.aliyuncs.com/' + encodedKey
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'OPTIONS') return response.status(204).end()
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS')
    return sendError(response, 405, '不支持的请求方法。')
  }

  const configuredToken = process.env.NOTES_ADMIN_TOKEN
  const providedHeader = request.headers['x-notes-token']
  const providedToken = Array.isArray(providedHeader) ? providedHeader[0] : providedHeader
  if (!configuredToken || providedToken !== configuredToken) return sendError(response, 401, '管理员密码不正确。')

  try {
    const payload = (typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {}) as UploadPayload
    const display = parseDataUrl(payload.image)
    const thumbnail = parseDataUrl(payload.imageThumbnail)
    if (!display) return sendError(response, 400, '展示图片格式无效。')
    if (display.buffer.length > MAX_IMAGE_DATA_BYTES || (thumbnail && thumbnail.buffer.length > MAX_IMAGE_DATA_BYTES)) {
      return sendError(response, 400, '压缩后的图片仍然过大。')
    }
    if (display.buffer.length + (thumbnail?.buffer.length || 0) > MAX_TOTAL_IMAGE_DATA_BYTES) {
      return sendError(response, 400, '压缩后的图片总大小超过限制。')
    }

    const client = getOssClient()
    const prefix = 'notes/' + new Date().toISOString().slice(0, 10)
    const id = crypto.randomUUID()
    const imageKey = prefix + '/' + id + '-display.jpg'
    const thumbnailKey = thumbnail ? prefix + '/' + id + '-thumbnail.jpg' : null
    await client.put(imageKey, display.buffer, { mime: display.contentType })
    try {
      if (thumbnail && thumbnailKey) await client.put(thumbnailKey, thumbnail.buffer, { mime: thumbnail.contentType })
    } catch (error) {
      await client.delete(imageKey).catch(() => undefined)
      throw error
    }

    return response.status(201).json({
      image: publicUrl(imageKey),
      imageKey,
      imageThumbnail: thumbnailKey ? publicUrl(thumbnailKey) : undefined,
      imageThumbnailKey: thumbnailKey,
    })
  } catch (error) {
    console.error('[api/upload]', error)
    return sendError(response, 500, '图片上传失败，请检查阿里云 OSS 配置。')
  }
}
