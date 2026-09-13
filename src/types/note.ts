export type JournalNote = {
  id: number
  title: string
  body: string
  image?: string
  imageThumbnail?: string
  createdAt: string
}

export type NoteDraft = {
  title: string
  body: string
  image: string | null
  imageThumbnail: string | null
}

export type PreparedImage = {
  displayDataUrl: string
  thumbnailDataUrl: string
  fileName: string
}
