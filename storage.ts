import type { ProgressEntry, ReaderSettings } from '../types/comic'

const SETTINGS_KEY = 'manga-reader.settings.v1'
const PROGRESS_KEY = 'manga-reader.progress.v1'

export const DEFAULT_SETTINGS: ReaderSettings = {
  mode: 'single',
  fit: 'width',
  rtl: false,
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 浏览器禁用存储或配额满时，阅读进度退回内存态
  }
}

export function loadSettings(): ReaderSettings {
  const value = readJson(SETTINGS_KEY)
  if (typeof value !== 'object' || value === null) return DEFAULT_SETTINGS
  const record = value as Record<string, unknown>
  return {
    mode: record.mode === 'scroll' ? 'scroll' : 'single',
    fit: record.fit === 'height' || record.fit === 'actual' ? record.fit : 'width',
    rtl: record.rtl === true,
  }
}

export function saveSettings(settings: ReaderSettings): void {
  writeJson(SETTINGS_KEY, settings)
}

function progressKey(entry: Pick<ProgressEntry, 'comicId' | 'chapterId'>): string {
  return `${entry.comicId}/${entry.chapterId}`
}

function loadProgressMap(): Map<string, ProgressEntry> {
  const value = readJson(PROGRESS_KEY)
  const map = new Map<string, ProgressEntry>()
  if (typeof value !== 'object' || value === null) return map
  for (const raw of Object.values(value as Record<string, unknown>)) {
    if (typeof raw !== 'object' || raw === null) continue
    const record = raw as Record<string, unknown>
    const { comicId, chapterId, pageIndex, updatedAt } = record
    if (typeof comicId !== 'string' || typeof chapterId !== 'string') continue
    if (typeof pageIndex !== 'number' || typeof updatedAt !== 'number') continue
    const entry: ProgressEntry = {
      comicId,
      chapterId,
      pageIndex: Math.max(0, Math.trunc(pageIndex)),
      updatedAt,
    }
    map.set(progressKey(entry), entry)
  }
  return map
}

function dumpProgressMap(map: Map<string, ProgressEntry>): void {
  const record: Record<string, ProgressEntry> = {}
  for (const [key, entry] of map) record[key] = entry
  writeJson(PROGRESS_KEY, record)
}

export function loadProgress(comicId: string, chapterId: string): ProgressEntry | undefined {
  return loadProgressMap().get(progressKey({ comicId, chapterId }))
}

export function saveProgress(entry: Omit<ProgressEntry, 'updatedAt'>): void {
  const map = loadProgressMap()
  const full: ProgressEntry = { ...entry, updatedAt: Date.now() }
  map.set(progressKey(entry), full)
  dumpProgressMap(map)
}

export function listProgress(comicId: string): ProgressEntry[] {
  return [...loadProgressMap().values()].filter((entry) => entry.comicId === comicId)
}

export function latestProgress(comicId: string): ProgressEntry | undefined {
  return listProgress(comicId).sort((a, b) => b.updatedAt - a.updatedAt)[0]
}

export function clearProgress(): void {
  writeJson(PROGRESS_KEY, {})
}
