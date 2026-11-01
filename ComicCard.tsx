import { latestProgress } from '../services/storage'
import type { Comic } from '../types/comic'

interface Props {
  comic: Comic
  onOpen: (chapterId: string, pageIndex: number) => void
}

export default function ComicCard({ comic, onOpen }: Props) {
  const saved = latestProgress(comic.id)
  const savedChapter = saved ? comic.chapters.find((c) => c.id === saved.chapterId) : undefined
  const target = savedChapter ?? comic.chapters[0]
  if (!target) return null

  const pageIndex = savedChapter
    ? Math.min(Math.max(0, saved!.pageIndex), target.pages.length - 1)
    : 0

  return (
    <article className="comic-card">
      <div className="cover">
        {comic.cover ? (
          <img src={comic.cover.url} alt={comic.title} loading="lazy" decoding="async" />
        ) : (
          <div className="page-placeholder">无封面</div>
        )}
      </div>

      <h2>{comic.title}</h2>
      <p className="meta">
        {comic.chapters.length} 话 · {comic.totalPages} 页
      </p>

      <button onClick={() => onOpen(target.id, pageIndex)}>
        {savedChapter ? `继续阅读 · ${target.title} 第 ${pageIndex + 1} 页` : `从 ${target.title} 开始`}
      </button>

      <div className="chapters">
        {comic.chapters.map((chapter) => (
          <button key={chapter.id} onClick={() => onOpen(chapter.id, 0)}>
            {chapter.title}
          </button>
        ))}
      </div>
    </article>
  )
}
