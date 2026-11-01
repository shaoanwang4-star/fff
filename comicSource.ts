import type { Chapter, Comic, PageRef } from '../types/comic'

const ROOT = '/src/assets/comics/'

const ASSET_URLS = import.meta.glob('/src/assets/comics/**/*.{jpg,jpeg,png,webp,avif,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|avif|gif)$/i

function naturalCompare(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g
  const fa = a.match(re) ?? []
  const fb = b.match(re) ?? []
  for (let i = 0; i < Math.max(fa.length, fb.length); i++) {
    const sa = fa[i] ?? ''
    const sb = fb[i] ?? ''
    const na = Number(sa)
    const nb = Number(sb)
    if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb
    if (sa !== sb) return sa < sb ? -1 : 1
  }
  return 0
}

function labelFromFileName(file: string): string {
  return file.replace(IMAGE_EXT, '')
}

interface Draft {
  comicId: string
  chapterId: string | null
  file: string
  url: string
}

function parsePath(assetPath: string, url: string): Draft | null {
  if (!assetPath.startsWith(ROOT)) return null
  const relative = assetPath.slice(ROOT.length)
  const segments = relative.split('/')
  const file = segments[segments.length - 1]
  if (!IMAGE_EXT.test(file)) return null
  if (segments.length === 2) return { comicId: segments[0], chapterId: null, file, url }
  if (segments.length === 3) return { comicId: segments[0], chapterId: segments[1], file, url }
  return null
}

function toPageRefs(entries: Draft[]): PageRef[] {
  return entries
    .slice()
    .sort((a, b) => naturalCompare(a.file, b.file))
    .map((entry, index) => ({ index, url: entry.url, file: entry.file }))
}

let cached: Comic[] | null = null

export function listComics(): Comic[] {
  if (cached) return cached
  const byComic = new Map<string, Draft[]>()
  for (const [assetPath, url] of Object.entries(ASSET_URLS)) {
    const draft = parsePath(assetPath, url)
    if (!draft) continue
    const bucket = byComic.get(draft.comicId)
    if (bucket) bucket.push(draft)
    else byComic.set(draft.comicId, [draft])
  }

  const comics: Comic[] = []
  for (const [comicId, drafts] of byComic) {
    const loose = drafts.filter((d) => d.chapterId === null)
    const coverDraft = loose.find((d) => /^cover/i.test(d.file)) ?? loose[0]

    const chapterIds = [...new Set(drafts.map((d) => d.chapterId).filter((id): id is string => id !== null))]
    const chapters: Chapter[] = chapterIds
      .sort(naturalCompare)
      .map((chapterId) => ({
        id: chapterId,
        comicId,
        title: labelFromFileName(chapterId),
        pages: toPageRefs(drafts.filter((d) => d.chapterId === chapterId)),
      }))
      .filter((chapter) => chapter.pages.length > 0)

    comics.push({
      id: comicId,
      title: labelFromFileName(comicId),
      cover: coverDraft ? { index: -1, url: coverDraft.url, file: coverDraft.file } : null,
      chapters,
      totalPages: chapters.reduce((sum, chapter) => sum + chapter.pages.length, 0),
    })
  }

  cached = comics
    .filter((comic) => comic.chapters.length > 0)
    .sort((a, b) => naturalCompare(a.title, b.title))
  return cached
}

export function findComic(comicId: string): Comic | undefined {
  return listComics().find((comic) => comic.id === comicId)
}
