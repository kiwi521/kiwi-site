import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createNote, deleteNote, fetchNotes, uploadImages } from '../api/notes'
import { HeroSection } from '../components/HeroSection'
import { NotePublisher } from '../components/NotePublisher'
import { PhotoMasonry } from '../components/PhotoMasonry'
import { ProfileFooter, ProfileIntro } from '../components/ProfileSections'
import { SiteHeader } from '../components/SiteHeader'
import type { JournalNote, NoteDraft } from '../types/note'

export function PhotographyJournalPage() {
  const [notes, setNotes] = useState<JournalNote[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [notesError, setNotesError] = useState('')
  const [adminToken, setAdminToken] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setNotes(await fetchNotes())
        setNotesError('')
      } catch {
        setNotesError('笔记服务暂时不可用，请检查 Vercel 的 MySQL 环境变量。')
      } finally {
        setNotesLoading(false)
      }
    }

    setAdminToken(window.sessionStorage.getItem('kiwi-notes-token') || '')
    void loadNotes()
  }, [])

  const handleCreateNote = async (draft: NoteDraft) => {
    setSubmitting(true)
    try {
      const uploaded = draft.image
        ? await uploadImages(draft.image, draft.imageThumbnail, adminToken.trim())
        : null
      const note = await createNote({
        ...draft,
        image: uploaded?.image || null,
        imageThumbnail: uploaded?.imageThumbnail || null,
        imageKey: uploaded?.imageKey,
        imageThumbnailKey: uploaded?.imageThumbnailKey,
      }, adminToken.trim())
      setNotes((currentNotes) => [note, ...currentNotes])
      setNotesError('')
      window.sessionStorage.setItem('kiwi-notes-token', adminToken.trim())
      window.setTimeout(() => document.querySelector('#notes')?.scrollIntoView({ behavior: 'smooth' }), 80)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNote = async (id: number) => {
    if (!adminToken.trim()) {
      setNotesError('请先在发布区域输入管理员密码，再删除笔记。')
      return false
    }

    try {
      await deleteNote(id, adminToken.trim())
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id))
      setNotesError('')
      return true
    } catch (error) {
      setNotesError(error instanceof Error ? error.message : '删除失败，请稍后再试。')
      return false
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />
      <HeroSection />

      <main className="relative bg-[#050505] px-5 pb-20 pt-16 sm:px-8 lg:px-12">
        <ProfileIntro />

        <section id="notes" className="mx-auto mt-20 max-w-6xl scroll-mt-24">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] text-white/45">最近的摄影笔记</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">把看见的东西写下来。</h2>
            </div>
            <a className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white" href="#publish"><ImagePlus size={16} />发布一条新笔记</a>
          </div>
          <PhotoMasonry notes={notes} loading={notesLoading} error={notesError} onDelete={handleDeleteNote} />
        </section>

        <NotePublisher adminToken={adminToken} submitting={submitting} onAdminTokenChange={setAdminToken} onSubmit={handleCreateNote} />
        <ProfileFooter />
      </main>
    </div>
  )
}
