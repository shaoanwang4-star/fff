import { useState } from 'react'
import type { PageRef } from '../types/comic'

interface Props {
  page: PageRef
  lazy?: boolean
}

export default function PageImage({ page, lazy = false }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <div className="page-placeholder">无法加载 {page.file}</div>
  }

  return (
    <img
      className="page"
      src={page.url}
      alt={`第 ${page.index + 1} 页`}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
