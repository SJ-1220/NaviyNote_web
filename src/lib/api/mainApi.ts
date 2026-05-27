/**
 * mainApi.ts — Frontend HTTP client for the main/dashboard resource.
 *
 * All functions that previously called Supabase directly (via mainServer.ts)
 * now call the naviynote_api REST backend.
 *
 * Expected backend contract:
 *  GET /main/memos?email=<userEmail>          → MainMemo[]  (10 most recent)
 *  GET /main/todos/today?email=<userEmail>    → MainTodo[]
 *  GET /main/todos/prev?email=<userEmail>     → MainTodo[]  (past 5 days)
 *  GET /main/todos/next?email=<userEmail>     → MainTodo[]  (next 5 days)
 *  GET /main/todos/important?email=<userEmail>→ MainTodo[]  (6 most important)
 */

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

// ── Shared types (previously defined in mainServer.ts) ───────────────

export interface MainMemo {
  id: string
  user_email: string
  content: string
  important: boolean
}

export interface MainTodo {
  id: string
  user_email: string
  task: string
  date: string | null
  important: boolean
}

// ── Fetchers ──────────────────────────────────────────────────────────

export const fetchMainMemos = async (
  userEmail: string
): Promise<MainMemo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/main/memos?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<MainMemo[]>(res)
}

export const fetchMainTodayTodos = async (
  userEmail: string
): Promise<MainTodo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/main/todos/today?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<MainTodo[]>(res)
}

export const fetchMainPrevTodos = async (
  userEmail: string
): Promise<MainTodo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/main/todos/prev?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<MainTodo[]>(res)
}

export const fetchMainNextTodos = async (
  userEmail: string
): Promise<MainTodo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/main/todos/next?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<MainTodo[]>(res)
}

export const fetchMainImportantTodos = async (
  userEmail: string
): Promise<MainTodo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/main/todos/important?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<MainTodo[]>(res)
}
