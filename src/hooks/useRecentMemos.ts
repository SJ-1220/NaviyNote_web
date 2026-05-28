import { useAuth } from '@/context/AuthContext'
import { fetchMainMemos, MainMemo } from '@/lib/api/mainApi'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useRecentMemos = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState<boolean>(true)
  const [recentMemos, setRecentMemos] = useState<MainMemo[]>([])

  useEffect(() => {
    const fetchRecentMemos = async () => {
      if (user && user.email) {
        try {
          const memos = await fetchMainMemos(user.email)
          setRecentMemos(memos)
        } catch (err) {
          if (err instanceof TypeError) {
            toast.error(
              '서버와 연결할 수 없습니다. 오프라인 상태인지 확인해주세요.'
            )
          } else {
            toast.error('메모 목록을 불러오지 못했습니다.')
          }
        }
      }
      setLoading(false)
    }
    fetchRecentMemos()
  }, [user])

  return { state: { loading, recentMemos } }
}
