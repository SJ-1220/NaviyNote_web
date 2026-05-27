/**
 * memoApi.ts — Frontend HTTP client for the memo resource.
 *
 * All functions that previously called Supabase directly (via memosServer.tsx
 * + src/services/memoService.ts) now call the naviynote_api REST backend.
 *
 * Backend base URL is read from NEXT_PUBLIC_API_URL (e.g. http://localhost:3001).
 *
 * Expected backend contract:
 *  GET    /memos?email=<userEmail>                        → Memo[]
 *  GET    /memos/:id?email=<userEmail>                    → MemoWithTodo | null
 *  GET    /memos/connectable?email=<userEmail>            → Memo[]
 *  POST   /memos     body: { memo, email }                → { newMemo, memosUpdate }
 *  DELETE /memos/:id body: { email }                      → void
 *  PATCH  /memos/:id body: { updates, email }             → Memo[]
 */

import { Memo, MemoWithTodo } from '@/types/memo'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

function base(path: string) {
  return `${API_BASE}${path}`
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ── Read ─────────────────────────────────────────────────────────────

export const fetchMemos = async (userEmail: string): Promise<Memo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base(`/memos?email=${encodeURIComponent(userEmail)}`))
  return handleResponse<Memo[]>(res)
}

export const fetchMemoWithTodo = async (
  memoId: string,
  userEmail: string
): Promise<MemoWithTodo | null> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/memos/${memoId}?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<MemoWithTodo | null>(res)
}

export const fetchConnectMemo = async (userEmail: string): Promise<Memo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/memos/connectable?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<Memo[]>(res)
}

// ── Write ─────────────────────────────────────────────────────────────

export const addMemo = async (
  memo: Omit<Memo, 'id'>,
  userEmail: string
): Promise<{ newMemo: Memo; memosUpdate: Memo | null }> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base('/memos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memo, email: userEmail }),
  })
  return handleResponse<{ newMemo: Memo; memosUpdate: Memo | null }>(res)
}

export const deleteMemo = async (
  memoId: string,
  userEmail: string
): Promise<void> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base(`/memos/${memoId}`), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail }),
  })
  await handleResponse<void>(res)
}

export const updateMemo = async (
  memoId: string,
  updates: Partial<Memo>,
  userEmail: string
): Promise<Memo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base(`/memos/${memoId}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates, email: userEmail }),
  })
  return handleResponse<Memo[]>(res)
}
