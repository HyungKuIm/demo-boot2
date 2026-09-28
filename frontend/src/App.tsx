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
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <h2>{note.title}</h2>
            {note.content && <p>{note.content}</p>}
            <small>{new Date(note.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default App
