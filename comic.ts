export type ReadingMode = 'single' | 'scroll'

export type FitMode = 'width' | 'height' | 'actual'

export interface PageRef {
  index: number
  url: string
  file: string
}

export interface Chapter {
  id: string
  comicId: string
  title: string
  pages: PageRef[]
}

export interface Comic {
  id: string
  title: string
  cover: PageRef | null
  chapters: Chapter[]
  totalPages: number
}

export interface ProgressEntry {
  comicId: string
  chapterId: string
  pageIndex: number
  updatedAt: number
}

export interface ReaderSettings {
  mode: ReadingMode
  fit: FitMode
  rtl: boolean
}
