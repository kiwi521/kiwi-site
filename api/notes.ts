import type { VercelRequest, VercelResponse } from '@vercel/node'
import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise'

type NoteRow = RowDataPacket & {
  id: number
  title: string
  body: string
  image: string | null
  image_thumbnail: string | null
  created_at: Date | string
}

type NotePayload = {
  title?: unknown
  body?: unknown
  image?: unknown
  imageThumbnail?: unknown
}

type AppGlobal = typeof globalThis & {
  kiwiMysqlPool?: Pool
}

const appGlobal = globalThis as AppGlobal
const MAX_IMAGE_DATA_BYTES = 4_000_000

function getPool() {
  if (appGlobal.kiwiMysqlPool) return appGlobal.kiwiMysqlPool

  const connectionUrl = process.env.MYSQL_URL
  const baseConfig = {
    connectionLimit: 4,
    waitForConnections: true,
    queueLimit: 0,
    ssl: process.env.MYSQL_SSL === 'false' ? undefined : { rejectUnauthorized: false },
  }

  if (connectionUrl) {
    const parsedUrl = new URL(connectionUrl)
    appGlobal.kiwiMysqlPool = mysql.createPool({
      ...baseConfig,
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 3306),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.slice(1),
    })
  } else {
    const required = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE']
    const missing = required.filter((key) => !process.env[key])
    if (missing.length > 0) throw new Error(`缺少数据库环境变量：${missing.join('、')}`)

    appGlobal.kiwiMysqlPool = mysql.createPool({
      ...baseConfig,
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })
  }

  return appGlobal.kiwiMysqlPool
}

function toNote(row: NoteRow) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    image: row.image || undefined,
    imageThumbnail: row.image_thumbnail || undefined,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

function sendError(response: VercelResponse, status: number, message: string) {
  return response.status(status).json({ error: message })
}

function hasAdminAccess(request: VercelRequest, response: VercelResponse) {
  const configuredToken = process.env.NOTES_ADMIN_TOKEN
  const providedHeader = request.headers['x-notes-token']
  const providedToken = Array.isArray(providedHeader) ? providedHeader[0] : providedHeader

  if (!configuredToken) {
    sendError(response, 503, '发布功能尚未配置管理员密码。')
    return false
  }

  if (!providedToken || providedToken !== configuredToken) {
    sendError(response, 401, '管理员密码不正确。')
    return false
  }

  return true
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') return response.status(204).end()
  if (!['GET', 'POST', 'DELETE'].includes(request.method || '')) {
    response.setHeader('Allow', 'GET, POST, DELETE')
    return sendError(response, 405, '不支持的请求方法。')
  }

  if ((request.method === 'POST' || request.method === 'DELETE') && !hasAdminAccess(request, response)) {
    return
  }

  try {
    const pool = getPool()

    if (request.method === 'GET') {
      const [rows] = await pool.query<NoteRow[]>(
        'SELECT id, title, body, image, image_thumbnail, created_at FROM photo_notes ORDER BY created_at DESC LIMIT 50',
      )
      return response.status(200).json({ notes: rows.map(toNote) })
    }

    if (request.method === 'POST') {
      const payload = (typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {}) as NotePayload
      const title = typeof payload.title === 'string' ? payload.title.trim() : ''
      const body = typeof payload.body === 'string' ? payload.body.trim() : ''
      const image = typeof payload.image === 'string' && payload.image.length > 0 ? payload.image : null
      const imageThumbnail = typeof payload.imageThumbnail === 'string' && payload.imageThumbnail.length > 0 ? payload.imageThumbnail : null

      if (!body) return sendError(response, 400, '正文不能为空。')
      if (title.length > 160) return sendError(response, 400, '标题不能超过 160 个字符。')
      if (body.length > 10_000) return sendError(response, 400, '正文不能超过 10000 个字符。')
      if (image && (!image.startsWith('data:image/') || Buffer.byteLength(image, 'utf8') > MAX_IMAGE_DATA_BYTES)) {
        return sendError(response, 400, '图片格式不支持，或图片大小超过限制。')
      }
      if (imageThumbnail && (!imageThumbnail.startsWith('data:image/') || Buffer.byteLength(imageThumbnail, 'utf8') > MAX_IMAGE_DATA_BYTES)) {
        return sendError(response, 400, '图片缩略图格式不支持，或大小超过限制。')
      }

      const [result] = await pool.execute<mysql.ResultSetHeader>(
        'INSERT INTO photo_notes (title, body, image, image_thumbnail) VALUES (?, ?, ?, ?)',
        [title || '没有标题的一页', body, image, imageThumbnail],
      )
      const [rows] = await pool.query<NoteRow[]>(
        'SELECT id, title, body, image, image_thumbnail, created_at FROM photo_notes WHERE id = ?',
        [result.insertId],
      )
      return response.status(201).json({ note: toNote(rows[0]) })
    }

    const id = Number(request.query.id)
    if (!Number.isInteger(id) || id <= 0) return sendError(response, 400, '笔记编号无效。')
    const [result] = await pool.execute<mysql.ResultSetHeader>('DELETE FROM photo_notes WHERE id = ?', [id])
    if (result.affectedRows === 0) return sendError(response, 404, '笔记不存在。')
    return response.status(204).end()
  } catch (error) {
    console.error('[api/notes]', error)
    return sendError(response, 500, '笔记服务暂时不可用，请检查数据库连接。')
  }
}
