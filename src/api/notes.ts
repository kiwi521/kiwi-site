import type { JournalNote, NoteDraft } from '../types/note'

type NotesResponse = {
  notes?: JournalNote[]
  error?: string
}

type NoteResponse = {
  note?: JournalNote
  error?: string
}

async function getResponseError(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { error?: string }
  return payload.error || '请求失败，请稍后再试。'
}

export async function fetchNotes() {
  const response = await fetch('/api/notes')
  if (!response.ok) throw new Error(await getResponseError(response))

  const payload = (await response.json()) as NotesResponse
  return Array.isArray(payload.notes) ? payload.notes : []
}

export async function createNote(note: NoteDraft, adminToken: string) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Notes-Token': adminToken,
    },
    body: JSON.stringify(note),
  })

  if (!response.ok) throw new Error(await getResponseError(response))

  const payload = (await response.json()) as NoteResponse
  if (!payload.note) throw new Error('发布失败，请稍后再试。')
  return payload.note
}

export async function deleteNote(id: number, adminToken: string) {
  const response = await fetch(`/api/notes?id=${id}`, {
    method: 'DELETE',
    headers: { 'X-Notes-Token': adminToken },
  })

  if (!response.ok) throw new Error(await getResponseError(response))
}
