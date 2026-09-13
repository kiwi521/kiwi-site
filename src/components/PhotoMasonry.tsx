import { ArrowUpRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { JournalNote } from '../types/note'

type PhotoMasonryProps = {
  notes: JournalNote[]
  loading: boolean
  error: string
  onDelete: (id: number) => Promise<boolean>
}

function formatNoteDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function PhotoMasonry({ notes, loading, error, onDelete }: PhotoMasonryProps) {
  const [selectedNote, setSelectedNote] = useState<JournalNote | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<JournalNote | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!selectedNote) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedNote(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNote])

  const confirmDelete = async () => {
    if (!noteToDelete) return

    setDeleting(true)
    const deleted = await onDelete(noteToDelete.id)
    setDeleting(false)
    if (deleted) setNoteToDelete(null)
  }

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-7 py-14 text-center text-white/55">正在读取笔记……</div>
  }

  return (
    <>
      {error && <p className="mb-5 rounded-2xl border border-[#e8702a]/30 bg-[#e8702a]/10 px-4 py-3 text-sm text-[#f0b38d]">{error}</p>}
      {notes.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-7 py-14 text-center text-white/55">还没有笔记，先写下第一段关于这次拍摄的感受吧。</div>
      ) : (
        <div className="photo-masonry columns-1 gap-5 sm:columns-2 lg:columns-3">
          {notes.map((note) => {
            const thumbnail = note.imageThumbnail || note.image
            return (
              <article key={note.id} className="photo-masonry-item group mb-5 overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.045] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                {thumbnail && (
                  <button type="button" className="relative block w-full cursor-zoom-in overflow-hidden text-left" onClick={() => setSelectedNote(note)} aria-label={`查看照片：${note.title}`}>
                    <img src={thumbnail} alt={note.title} loading="lazy" decoding="async" className="block h-auto w-full transition duration-500 group-hover:scale-[1.025]" />
                    <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white/80 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">查看大图</span>
                  </button>
                )}
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 text-xs text-white/40">
                    <time dateTime={note.createdAt}>{formatNoteDate(note.createdAt)}</time>
                    <button type="button" onClick={() => setNoteToDelete(note)} className="rounded-full px-2 py-1 text-white/35 transition-colors hover:bg-white/10 hover:text-white" aria-label={`删除笔记：${note.title}`}>删除</button>
                  </div>
                  <h3 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{note.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/65">{note.body}</p>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {selectedNote?.image && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={selectedNote.title} onClick={() => setSelectedNote(null)}>
          <button type="button" className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-7 sm:top-7" onClick={() => setSelectedNote(null)} aria-label="关闭大图"><X size={20} /></button>
          <div className="flex max-h-full max-w-6xl flex-col items-center gap-4" onClick={(event) => event.stopPropagation()}>
            <img src={selectedNote.image} alt={selectedNote.title} className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl" />
            <div className="flex items-center gap-2 text-sm text-white/75">
              <span>{selectedNote.title}</span>
              <ArrowUpRight size={15} className="text-white/45" />
            </div>
          </div>
        </div>
      )}

      {noteToDelete && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-note-title">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#151515] p-6 shadow-2xl">
            <p className="text-xs tracking-[0.18em] text-[#f0b38d]">删除确认</p>
            <h3 id="delete-note-title" className="mt-3 text-xl font-semibold text-white">确定删除这条笔记吗？</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">“{noteToDelete.title}”将从公开页面与数据库中永久删除，无法恢复。</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => setNoteToDelete(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 disabled:opacity-50">取消</button>
              <button type="button" disabled={deleting} onClick={() => void confirmDelete()} className="rounded-full bg-[#d45739] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c4482d] disabled:cursor-wait disabled:opacity-60">{deleting ? '正在删除' : '确认删除'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
