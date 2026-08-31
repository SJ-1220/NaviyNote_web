export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  date: string | null;
  memoId: string | null;
  important: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoWithMemo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  date: string | null;
  memoId: string | null;
  important: boolean;
  createdAt: string;
  updatedAt: string;
  memo?: { content: string };
}
