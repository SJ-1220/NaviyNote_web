'use client'
import LoadingPage from '@/components/Loading'
import Main from '@/components/Main/Main'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MainPage() {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return <LoadingPage />
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <Main />
}
