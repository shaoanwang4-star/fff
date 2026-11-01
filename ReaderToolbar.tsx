import type { FitMode, ReadingMode, ReaderSettings } from '../types/comic'

const MODES: { value: ReadingMode; label: string }[] = [
  { value: 'single', label: '单页' },
  { value: 'scroll', label: '长条' },
]

const FITS: { value: FitMode; label: string }[] = [
  { value: 'width', label: '适应宽度' },
  { value: 'height', label: '适应高度' },
  { value: 'actual', label: '原始尺寸' },
]

interface Props {
  settings: ReaderSettings
  onUpdate: (patch: Partial<ReaderSettings>) => void
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}

export default function ReaderToolbar({ settings, onUpdate, onPrev, onNext, canPrev, canNext }: Props) {
  return (
    <div className="toolbar">
      <div className="group">
        <span className="group-label">模式</span>
        {MODES.map((mode) => (
          <button
            key={mode.value}
            aria-pressed={settings.mode === mode.value}
            onClick={() => onUpdate({ mode: mode.value })}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="group">
        <span className="group-label">画面</span>
        {FITS.map((fit) => (
          <button
            key={fit.value}
            aria-pressed={settings.fit === fit.value}
            onClick={() => onUpdate({ fit: fit.value })}
          >
            {fit.label}
          </button>
        ))}
      </div>

      <div className="group">
        <button
          aria-pressed={settings.rtl}
          title="日漫从右向左翻"
          onClick={() => onUpdate({ rtl: !settings.rtl })}
        >
          从右向左
        </button>
      </div>

      {settings.mode === 'single' && (
        <div className="group">
          <button onClick={onPrev} disabled={!canPrev}>
            上一页
          </button>
          <button onClick={onNext} disabled={!canNext}>
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
