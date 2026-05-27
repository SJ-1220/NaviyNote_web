import { updateTodo } from '@/lib/api/todoApi'
import { DayCellMountArg, EventChangeArg, EventInput } from '@fullcalendar/core'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useDrop } from 'react-dnd'
import { toast } from 'sonner'
import { Todo } from '../types/todo'

export const useCalendar = (
  todos: Todo[],
  setTodos: (todos: Todo[]) => void
) => {
  const { data: session } = useSession()
  const [events, setEvents] = useState<EventInput[]>([])
  const calendarAllDayRef = useRef<HTMLTableCellElement[]>([])
  const calendarDropRef = useRef<HTMLDivElement>(null)

  // Todo를 캘린더에 드롭했을 때 해당 todo의 날짜를 업데이트하는 함수
  const handleDrop = async (calendarDroppedDate: string, todoId: string) => {
    if (!todoId || !session?.user?.email) return
    try {
      const calendarCorrectedDate = new Date(calendarDroppedDate)
      calendarCorrectedDate.setDate(calendarCorrectedDate.getDate() + 1)

      await updateTodo(
        todoId,
        { date: calendarCorrectedDate.toISOString().split('T')[0] },
        session.user.email
      )
      const newTodos = todos.map((todo: Todo) =>
        todo.id === todoId
          ? { ...todo, date: calendarCorrectedDate.toISOString().split('T')[0] }
          : todo
      )
      setTodos(newTodos)
    } catch (err) {
      if (err instanceof TypeError) {
        toast.error(
          '서버와 연결할 수 없습니다. 오프라인 상태인지 확인해주세요.'
        )
      } else {
        toast.error('날짜 변경에 실패했습니다. 다시 시도해 주세요.')
      }
    }
  }

  // drop했을 때, 드롭된 위치의 날짜로 Todo 데이터 동기화하는 함수
  const handleDropRef = useRef(handleDrop)
  useEffect(() => {
    handleDropRef.current = handleDrop
  })

  // todo가 캘린더에 드롭된 좌표를 통해 날짜를 찾는 함수
  const [, drop] = useDrop(() => ({
    accept: 'TODO',
    drop: (item: { id: string }, monitor) => {
      const calendarDroppedInfo = monitor.getClientOffset()
      if (!calendarDroppedInfo) return
      const { x: dropX, y: dropY } = calendarDroppedInfo
      const calendarDroppedPoint = calendarAllDayRef.current.find((point) => {
        if (!point) return false
        const rect = point.getBoundingClientRect()
        return (
          dropX >= rect.left &&
          dropX <= rect.right &&
          dropY >= rect.top &&
          dropY <= rect.bottom
        )
      })
      const calendarDroppedDate = calendarDroppedPoint?.dataset.date
      if (calendarDroppedDate) {
        handleDropRef.current(calendarDroppedDate, item.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  useEffect(() => {
    drop(calendarDropRef.current)
  }, [drop])

  useEffect(() => {
    setEvents(
      todos
        .filter((todo: Todo) => todo.date)
        .map((todo: Todo) => ({
          id: todo.id,
          title: todo.task,
          start: todo.date ? new Date(todo.date) : undefined,
        }))
    )
  }, [todos])

  const handleEventDrop = async (eventDropInfo: EventChangeArg) => {
    const todoId = eventDropInfo.event.id
    if (!todoId || !session?.user?.email) return

    const updatedDate = eventDropInfo.event.startStr
    try {
      await updateTodo(todoId, { date: updatedDate }, session.user.email)
      const newTodos = todos.map((todo: Todo) =>
        todo.id === todoId ? { ...todo, date: updatedDate } : todo
      )
      setTodos(newTodos)
    } catch (err) {
      eventDropInfo.revert()
      if (err instanceof TypeError) {
        toast.error(
          '서버와 연결할 수 없습니다. 오프라인 상태인지 확인해주세요.'
        )
      } else {
        toast.error('날짜 변경에 실패했습니다. 다시 시도해 주세요.')
      }
    }
  }

  const handleDayCellDidMount = (info: DayCellMountArg) => {
    calendarAllDayRef.current.push(info.el as HTMLTableCellElement)
    info.el.dataset.date = info.date.toISOString().split('T')[0]
  }

  useEffect(() => {
    return () => {
      calendarAllDayRef.current = []
    }
  }, [])

  return {
    events,
    calendarDropRef,
    handleEventDrop,
    handleDayCellDidMount,
  }
}
