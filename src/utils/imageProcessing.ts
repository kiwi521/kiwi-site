import heic2any from 'heic2any'
import type { PreparedImage } from '../types/note'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const DISPLAY_MAX_EDGE = 2400
const THUMBNAIL_MAX_EDGE = 960
const MAX_DISPLAY_BYTES = 2_200_000
const MAX_THUMBNAIL_BYTES = 280_000

function isHeicFile(file: File) {
  return file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name)
}

async function readImage(file: Blob) {
  const source = URL.createObjectURL(file)
  const image = new Image()
  image.decoding = 'async'

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('这张图片无法读取，请尝试使用 JPG、PNG、WebP 或 HEIC 文件。'))
      image.src = source
    })
    return image
  } finally {
    URL.revokeObjectURL(source)
  }
}

async function convertHeic(file: File) {
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92,
  })

  return Array.isArray(converted) ? converted[0] : converted
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('图片压缩失败，请换一张图片再试。'))
    }, 'image/jpeg', quality)
  })
}

async function createJpeg(image: HTMLImageElement, maxEdge: number, byteLimit: number) {
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持图片压缩。')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  let quality = 0.9
  let result = await canvasToBlob(canvas, quality)
  while (result.size > byteLimit && quality > 0.55) {
    quality -= 0.08
    result = await canvasToBlob(canvas, quality)
  }

  if (result.size > byteLimit) {
    throw new Error('图片压缩后仍然过大，请裁剪或降低照片分辨率后再上传。')
  }

  return result
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('图片读取失败，请重试。'))
    reader.readAsDataURL(blob)
  })
}

export async function prepareUploadImage(file: File): Promise<PreparedImage> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('图片原文件需要小于 5MB，请先压缩或裁剪后再上传。')
  }

  const source = isHeicFile(file) ? await convertHeic(file) : file
  const image = await readImage(source)
  const [displayImage, thumbnailImage] = await Promise.all([
    createJpeg(image, DISPLAY_MAX_EDGE, MAX_DISPLAY_BYTES),
    createJpeg(image, THUMBNAIL_MAX_EDGE, MAX_THUMBNAIL_BYTES),
  ])

  const [displayDataUrl, thumbnailDataUrl] = await Promise.all([
    blobToDataUrl(displayImage),
    blobToDataUrl(thumbnailImage),
  ])

  return {
    displayDataUrl,
    thumbnailDataUrl,
    fileName: isHeicFile(file) ? file.name.replace(/\.(heic|heif)$/i, '.jpg') : file.name,
  }
}
