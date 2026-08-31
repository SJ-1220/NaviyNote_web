/**
 * todoApi.ts — Frontend HTTP client for the todo resource.
 *
 * All functions that previously called Supabase directly (via todosServer.tsx
 * + src/services/todoService.ts) now call the naviynote_api REST backend.
 *
 * Expected backend contract:
 *  GET    /todos?email=<userEmail>                                 → Todo[]
 *  GET    /todos/:id?email=<userEmail>                             → TodoWithMemo | null
 *  POST   /todos        body: { todo, email }                      → { newTodo, todosUpdate }
 *  DELETE /todos/:id    body: { email }                            → void
 *  PATCH  /todos/:id    body: { updates, email }                   → Todo[]
 *  GET    /todos/three-days?email=&start=<startDate>&end=<endDate> → Todo[]
 *  GET    /todos/today?email=&date=<todayDate>                     → Todo[]
 *  GET    /todos/no-date?email=<userEmail>                         → Todo[]
 *  GET    /todos/month?email=&start=<startDate>&end=<endDate>      → Todo[]
 */

import { Todo, TodoWithMemo } from '@/types/todo'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export function base(path: string) {
  return `${API_BASE}/api${path}`
}

type ApiResponse<T> = ({ success: true } & T) | { success: false; message: string };

export async function handleResponse<T>(res: Response): Promise<T> {
  const data=(await res.json()) as ApiResponse<T>
  if (!data.success) {
    throw new Error(data.message)
  }
  return data as T
}

// ── Read ─────────────────────────────────────────────────────────────

export const fetchTodos = async (userEmail: string): Promise<Todo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base(`/todos?email=${encodeURIComponent(userEmail)}`))
  return handleResponse<Todo[]>(res)
}

export const fetchTodoWithMemo = async (
  todoId: string,
  userEmail: string
): Promise<TodoWithMemo | null> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/todos/${todoId}?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<TodoWithMemo | null>(res)
}

export const fetchThreeDaysTodo = async (
  userEmail: string,
  endDate: string,
  startDate: string
): Promise<Todo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const params = new URLSearchParams({
    email: userEmail,
    start: startDate,
    end: endDate,
  })
  const res = await fetch(base(`/todos/three-days?${params}`))
  return handleResponse<Todo[]>(res)
}

export const fetchTodayTodo = async (
  userEmail: string,
  todayDate: string
): Promise<Todo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const params = new URLSearchParams({ email: userEmail, date: todayDate })
  const res = await fetch(base(`/todos/today?${params}`))
  return handleResponse<Todo[]>(res)
}

export const fetchNoDateTodo = async (userEmail: string): Promise<Todo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(
    base(`/todos/no-date?email=${encodeURIComponent(userEmail)}`)
  )
  return handleResponse<Todo[]>(res)
}

export const fetchMonthTodo = async (
  userEmail: string,
  startDate: string,
  endDate: string
): Promise<Todo[]> => {
  if (!userEmail) throw new Error('User Email is required')
  const params = new URLSearchParams({
    email: userEmail,
    start: startDate,
    end: endDate,
  })
  const res = await fetch(base(`/todos/month?${params}`))
  return handleResponse<Todo[]>(res)
}

// ── Write ─────────────────────────────────────────────────────────────

export const addTodo = async (
  todo: Omit<Todo, 'id'>,
  userEmail: string
): Promise<{ newTodo: Todo; todosUpdate: Todo | null }> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base('/todos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todo, email: userEmail }),
  })
  return handleResponse<{ newTodo: Todo; todosUpdate: Todo | null }>(res)
}

export const deleteTodo = async (
  todoId: string,
  userEmail: string
): Promise<void> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base(`/todos/${todoId}`), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail }),
  })
  await handleResponse<void>(res)
}

export const updateTodo = async (
  todoId: string,
  updates: Partial<Todo>,
  userEmail: string
): Promise<Todo[]> => {
  if (!userEmail) throw new Error('User email is required')
  const res = await fetch(base(`/todos/${todoId}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates, email: userEmail }),
  })
  return handleResponse<Todo[]>(res)
}
