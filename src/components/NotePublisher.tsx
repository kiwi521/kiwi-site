import { Camera, ImagePlus, Send } from 'lucide-react'
import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import type { NoteDraft } from '../types/note'
import { prepareUploadImage } from '../utils/imageProcessing'

type NotePublisherProps = {
  adminToken: string
  submitting: boolean
  onAdminTokenChange: (value: string) => void
  onSubmit: (note: NoteDraft) => Promise<void>
}

export function NotePublisher({ adminToken, submitting, onAdminTokenChange, onSubmit }: NotePublisherProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState('')
  const [imageThumbnail, setImageThumbnail] = useState('')
  const [imageName, setImageName] = useState('')
  const [message, setMessage] = useState('')
  const [preparingImage, setPreparingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const clearImage = () => {
    setImage('')
    setImageThumbnail('')
    setImageName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setPreparingImage(true)
      setMessage('正在转换并压缩图片……')
      const preparedImage = await prepareUploadImage(file)
      setImage(preparedImage.displayDataUrl)
      setImageThumbnail(preparedImage.thumbnailDataUrl)
      setImageName(preparedImage.fileName)
      setMessage('图片已压缩并添加，可以继续写下这次拍摄。')
    } catch (error) {
      clearImage()
      setMessage(error instanceof Error ? error.message : '图片处理失败，请换一张图片再试。')
    } finally {
      setPreparingImage(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanBody = body.trim()
    if (!cleanBody) return setMessage('先写下一点文字，再发布这条笔记。')
    if (!adminToken.trim()) return setMessage('请输入发布密码，只有你可以写入主页。')

    try {
      setMessage('正在保存笔记……')
      await onSubmit({ title: title.trim() || '没有标题的一页', body: cleanBody, image: image || null, imageThumbnail: imageThumbnail || null })
      setTitle('')
      setBody('')
      clearImage()
      setMessage('已发布，这条笔记现在就在你的档案里。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '发布失败，请稍后再试。')
    }
  }

  return (
    <section id="publish" className="mx-auto mt-20 max-w-6xl scroll-mt-24 rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.28)] sm:p-10 lg:p-12">
      <div className="mb-8 flex items-start justify-between gap-5">
        <div><p className="text-xs tracking-[0.2em] text-[#f0b38d]">写下今天的观察</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">发布一条摄影笔记</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">一张照片，一点文字，或者只是今天突然想记住的一个画面。</p></div>
        <Camera className="hidden text-[#e8702a] sm:block" size={28} strokeWidth={1.5} />
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          <label className="block"><span className="mb-2 block text-sm text-white/75">标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：傍晚的光从窗边经过" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#e8702a]/60" /></label>
          <label className="block"><span className="mb-2 block text-sm text-white/75">发布密码</span><input type="password" value={adminToken} onChange={(event) => onAdminTokenChange(event.target.value)} placeholder="Vercel 环境变量 NOTES_ADMIN_TOKEN" autoComplete="current-password" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#e8702a]/60" /></label>
          <label className="block"><span className="mb-2 block text-sm text-white/75">正文</span><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="写下这次拍摄的想法、当时的光线，或者只是你想留下的一句话……" rows={8} className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm leading-7 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#e8702a]/60" /></label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-white/40">图片会在本地压缩后保存；列表加载缩略图，点击后查看高清图。</p><button type="submit" disabled={submitting || preparingImage} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8702a] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#d2611f] disabled:cursor-wait disabled:opacity-60"><Send size={16} />{submitting ? '正在保存' : preparingImage ? '正在处理图片' : '发布笔记'}</button></div>
          {message && <p className="text-sm text-[#f0b38d]" role="status">{message}</p>}
        </div>

        <div>
          <span className="mb-2 block text-sm text-white/75">配一张图片</span>
          <button type="button" disabled={preparingImage} onClick={() => fileInputRef.current?.click()} className="group relative flex min-h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/20 text-center transition-colors hover:border-[#e8702a]/60 hover:bg-[#e8702a]/[0.06] disabled:cursor-wait">
            {image && <img src={image} alt="待发布的预览图" className="absolute inset-0 h-full w-full object-cover opacity-75" />}
            <span className="relative z-10 flex flex-col items-center gap-3 rounded-2xl bg-black/35 px-5 py-4 backdrop-blur-sm"><ImagePlus className="text-[#f0b38d]" size={25} /><span className="text-sm text-white">{imageName || '选择一张照片'}</span><span className="text-xs text-white/45">JPG、PNG、WebP、HEIC，最大 5MB</span></span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={(event) => void handleImageChange(event)} className="sr-only" />
          {image && <button type="button" onClick={clearImage} className="mt-3 text-xs text-white/45 transition-colors hover:text-white">移除图片</button>}
        </div>
      </form>
    </section>
  )
}
