import { type SubmitEvent, useEffect, useState } from 'react'
import './App.css'

type Note = {
  id: number
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/notes')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Note[]>
      })
      .then(setNotes)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      setSubmitError('제목을 입력하세요.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = (await res.json()) as Note
      setNotes((prev) => [...prev, created])
      setTitle('')
      setContent('')
    } catch (e) {
      setSubmitError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 노트를 삭제할까요?')) return
    setDeletingId(id)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      // 404는 이미 삭제된 노트이므로 목록에서 제거만 한다
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`)
      setNotes((prev) => prev.filter((note) => note.id !== id))
      if (editingId === id) setEditingId(null)
    } catch (e) {
      setDeleteError((e as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content ?? '')
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditError(null)
  }

  const handleUpdate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editingId === null) return
    if (!editTitle.trim()) {
      setEditError('제목을 입력하세요.')
      return
    }
    setSaving(true)
    setEditError(null)
    try {
      const res = await fetch(`/api/notes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const updated = (await res.json()) as Note
      setNotes((prev) =>
        prev.map((note) => (note.id === updated.id ? updated : note)),
      )
      setEditingId(null)
    } catch (e) {
      setEditError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="center">
      <h1>Notes</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <textarea
            placeholder="내용"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? '저장 중...' : '추가'}
        </button>
        {submitError && <p>노트를 추가하지 못했습니다: {submitError}</p>}
      </form>
      {loading && <p>불러오는 중...</p>}
      {error && <p>목록을 불러오지 못했습니다: {error}</p>}
      {!loading && !error && notes.length === 0 && <p>노트가 없습니다.</p>}
      {deleteError && <p>노트를 삭제하지 못했습니다: {deleteError}</p>}
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {editingId === note.id ? (
              <form onSubmit={handleUpdate}>
                <div>
                  <input
                    type="text"
                    placeholder="제목"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="내용"
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button type="button" onClick={cancelEdit} disabled={saving}>
                  취소
                </button>
                {editError && <p>노트를 수정하지 못했습니다: {editError}</p>}
              </form>
            ) : (
              <>
                <div
                  onClick={() => startEdit(note)}
                  style={{ cursor: 'pointer' }}
                  title="클릭하여 수정"
                >
                  <h2>{note.title}</h2>
                  {note.content && <p>{note.content}</p>}
                  <small>
                    작성 {new Date(note.createdAt).toLocaleString()}
                    {note.updatedAt !== note.createdAt &&
                      ` · 수정 ${new Date(note.updatedAt).toLocaleString()}`}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                >
                  {deletingId === note.id ? '삭제 중...' : '삭제'}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default App
