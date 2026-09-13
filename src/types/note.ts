export type JournalNote = {
  id: number
  title: string
  body: string
  image?: string
  imageThumbnail?: string
  imageKey?: string
  imageThumbnailKey?: string
  createdAt: string
}

export type NoteDraft = {
  title: string
  body: string
  image: string | null
  imageThumbnail: string | null
  imageKey?: string
  imageThumbnailKey?: string
}

export type UploadedImages = {
  image: string
  imageKey: string
  imageThumbnail?: string
  imageThumbnailKey?: string
}

export type PreparedImage = {
  displayDataUrl: string
  thumbnailDataUrl: string
  fileName: string
}
