'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import Button from '../Button'
import { useAuth } from '@/context/AuthContext'

export default function AddCalendar() {
  const { user, authFetch , accessToken} = useAuth()
  const handleAddCalendar = useCallback(async () => {
    if (!user) {
      toast.error('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.')
      return
    }
    const uid = crypto.randomUUID()
    const calendarId = 'defaultCalendarId'
    const scheduleIcalString = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:Naver Calendar',
      'CALSCALE:GREGORIAN',
      'BEGIN:VTIMEZONE',
      'TZID:Asia/Seoul',
      'BEGIN:STANDARD',
      'DTSTART:19700101T000000',
      'TZNAME:GMT+09:00',
      'TZOFFSETFROM:+0900',
      'TZOFFSETTO:+0900',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'SEQUENCE:0',
      'CLASS:PUBLIC',
      'TRANSP:OPAQUE',
      `UID:${uid}`,
      'DTSTART;TZID=Asia/Seoul:20250628T090000',
      'DTEND;TZID=Asia/Seoul:20250628T100000',
      'SUMMARY:NaviyNote 2차 배포일',
      'DESCRIPTION:SJ-1220가 만든 NaviyNote의 2차 배포일입니다',
      'LOCATION:Online',
      'ORGANIZER;CN=Test Organizer:mailto:kindjin12@naver.com',
      'CREATED:20250625T000000Z',
      'LAST-MODIFIED:20250625T000000Z',
      'DTSTAMP:20250625T000000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n')

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/naver/add-schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken,
            calendarId,
            scheduleIcalString,
          }),
        }
      )

      await response.json()

      if (response.ok) {
        toast.success('네이버 캘린더에 일정이 추가되었습니다.')
      } else {
        toast.error('일정 추가에 실패했습니다.')
      }
    } catch {
      toast.error('일정 추가 중 오류가 발생했습니다.')
    }
  }, [accessToken])

  return (
    <Button
      type="button"
      onClick={handleAddCalendar}
      className={`text-ui-sm my-4 py-4 w-full border border-gray-200 rounded-xl transition-colors ${accessToken ? 'bg-secondary text-white hover:opacity-90' : 'bg-gray-200 text-gray-500'}`}
      disabled={!accessToken}
    >
      내 네이버캘린더에 배포일 일정 추가
    </Button>
  )
}
