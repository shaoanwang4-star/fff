import { useEffect, useState } from 'react'

export type Route =
  | { name: 'library' }
  | { name: 'reader'; comicId: string; chapterId: string | null; pageIndex: number }

function encode(route: Route): string {
  if (route.name === 'library') return '#/'
  const chapter = encodeURIComponent(route.chapterId ?? '')
  const query = route.pageIndex > 0 ? `?p=${route.pageIndex}` : ''
  return `#/comic/${encodeURIComponent(route.comicId)}/${chapter}${query}`
}

function decode(hash: string): Route {
  const raw = hash.replace(/^#/, '')
  const [pathname, search] = raw.split('?')
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] !== 'comic' || parts.length < 2) return { name: 'library' }
  const comicId = decodeURIComponent(parts[1])
  const chapterId = parts[2] ? decodeURIComponent(parts[2]) : null
  const pageIndex = Math.max(0, Math.trunc(Number(new URLSearchParams(search ?? '').get('p')) || 0))
  return { name: 'reader', comicId, chapterId, pageIndex }
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => decode(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(decode(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = (next: Route) => {
    const target = encode(next)
    if (window.location.hash === target) setRoute(next)
    else window.location.hash = target
  }

  return { route, navigate }
}
