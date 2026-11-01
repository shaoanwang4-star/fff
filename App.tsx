import { useHashRoute, type Route } from './hooks/useHashRoute'
import { useSettings } from './hooks/useSettings'
import { findComic } from './services/comicSource'
import LibraryPage from './pages/LibraryPage'
import ReaderPage from './pages/ReaderPage'

interface Props {
  onBack: () => void
}

function NotFound({ comicId, onBack }: { comicId: string } & Props) {
  return (
    <div className="app">
      <header className="topbar">
        <button onClick={onBack}>← 书架</button>
        <h1>未找到漫画</h1>
      </header>
      <main className="reader">
        <div className="narrow">
          <p>目录里没有 id 为 <code>{comicId}</code> 的漫画。</p>
          <p className="empty">把图片放进 <code>src/assets/comics/&lt;漫画名&gt;/&lt;话数&gt;/</code> 后刷新页面。</p>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const { route, navigate } = useHashRoute()
  const { settings, update } = useSettings()
  const goLibrary = () => navigate({ name: 'library' })

  if (route.name === 'reader') {
    const comic = findComic(route.comicId)
    if (!comic) return <NotFound comicId={route.comicId} onBack={goLibrary} />
    return (
      <ReaderPage
        key={comic.id}
        comic={comic}
        route={route}
        settings={settings}
        onUpdateSettings={update}
        navigate={navigate}
      />
    )
  }

  return <LibraryPage navigate={(next: Route) => navigate(next)} />
}
