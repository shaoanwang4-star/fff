import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { loadProgress, saveProgress } from '../services/storage'

export function useProgress(
  comicId: string,
  chapterId: string,
  initial = 0,
): [number, Dispatch<SetStateAction<number>>] {
  const [pageIndex, setPageIndex] = useState(() =>
    initial > 0 ? initial : (loadProgress(comicId, chapterId)?.pageIndex ?? 0),
  )

  useEffect(() => {
    saveProgress({ comicId, chapterId, pageIndex })
  }, [comicId, chapterId, pageIndex])

  return [pageIndex, setPageIndex]
}
