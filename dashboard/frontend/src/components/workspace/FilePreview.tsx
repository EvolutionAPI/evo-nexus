import { useState, useEffect } from 'react'
import { AlertCircle, FileX, Download, RefreshCw } from 'lucide-react'
import { api } from '../../lib/api'
import Markdown from '../Markdown'
import CodeView from './CodeView'

const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''

interface FilePreviewProps {
  path: string
  onDownload: () => void
}

type PreviewState =
  | { status: 'loading' }
  | { status: 'markdown'; content: string }
  | { status: 'html'; content: string }
  | { status: 'code'; content: string }
  | { status: 'text'; content: string }
  | { status: 'image' }
  | { status: 'video' }
  | { status: 'audio' }
  | { status: 'pdf' }
  | { status: 'binary'; size: number; mime: string; modified: number | null }
  | { status: 'error'; message: string }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp']
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv']
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma']

function getPreviewType(path: string): 'markdown' | 'html' | 'code' | 'text' | 'image' | 'video' | 'audio' | 'pdf' {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'md' || ext === 'markdown') return 'markdown'
  if (ext === 'html' || ext === 'htm') return 'html'
  if (IMAGE_EXTS.includes(ext)) return 'image'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  if (AUDIO_EXTS.includes(ext)) return 'audio'
  if (ext === 'pdf') return 'pdf'
  const codeExts = ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'sh', 'json', 'yaml', 'yml', 'toml', 'css', 'sql', 'rs', 'rb', 'php', 'java', 'c', 'cpp', 'h']
  if (codeExts.includes(ext)) return 'code'
  return 'text'
}

const MAX_TEXT_SIZE = 2 * 1024 * 1024 // 2MB

export default function FilePreview({ path, onDownload }: FilePreviewProps) {
  const [state, setState] = useState<PreviewState>({ status: 'loading' })
  const [visible, setVisible] = useState(false)

  const load = async () => {
    setState({ status: 'loading' })
    setVisible(false)
    try {
      const type = getPreviewType(path)

      // Media files load directly via download URL — no need to fetch content
      if (type === 'image') {
        setState({ status: 'image' })
        setTimeout(() => setVisible(true), 50)
        return
      }
      if (type === 'video') {
        setState({ status: 'video' })
        setTimeout(() => setVisible(true), 50)
        return
      }
      if (type === 'audio') {
        setState({ status: 'audio' })
        setTimeout(() => setVisible(true), 50)
        return
      }
      if (type === 'pdf') {
        setState({ status: 'pdf' })
        setTimeout(() => setVisible(true), 50)
        return
      }

      const data = await api.get(`/workspace/file?path=${encodeURIComponent(path)}`)
      const size: number = data.size ?? 0
      const mime: string = data.mime ?? 'application/octet-stream'
      const mtime: number | null = data.mtime ?? null

      // Truncated or no content → binary card
      if (data.truncated || size > MAX_TEXT_SIZE || typeof data.content !== 'string') {
        setState({ status: 'binary', size, mime, modified: mtime })
        setVisible(true)
        return
      }

      const content: string = data.content

      switch (type) {
        case 'markdown':
          setState({ status: 'markdown', content })
          break
        case 'html':
          setState({ status: 'html', content })
          break
        case 'code':
          setState({ status: 'code', content })
          break
        default:
          setState({ status: 'text', content })
      }
      // Crossfade in
      setTimeout(() => setVisible(true), 50)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar arquivo'
      setState({ status: 'error', message: msg })
      setVisible(true)
    }
  }

  useEffect(() => {
    load()
  }, [path])

  if (state.status === 'loading') {
    return (
      <div className="h-full p-6 space-y-4">
        <div className="h-6 rounded skeleton" style={{ width: '60%' }} />
        <div className="h-4 rounded skeleton" style={{ width: '80%' }} />
        <div className="h-4 rounded skeleton" style={{ width: '70%' }} />
        <div className="h-4 rounded skeleton" style={{ width: '50%' }} />
        <div className="h-4 rounded skeleton" style={{ width: '75%' }} />
        <div className="h-4 rounded skeleton" style={{ width: '65%' }} />
      </div>
    )
  }

  return (
    <div
      className="h-full overflow-auto transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {state.status === 'error' && (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertCircle size={32} style={{ color: 'var(--danger)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Erro ao carregar arquivo
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{state.message}</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--evo-green)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      {state.status === 'image' && (
        <div className="flex items-center justify-center h-full p-8">
          <img
            src={`${API_BASE}/api/workspace/download?path=${encodeURIComponent(path)}`}
            alt={path.split('/').pop() ?? path}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const parent = e.currentTarget.parentElement
              if (parent) {
                parent.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">Erro ao carregar imagem</p>'
              }
            }}
          />
        </div>
      )}

      {state.status === 'binary' && (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <FileX size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Arquivo binário
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{state.mime}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {formatSize(state.size)}
              {state.modified && ` · ${new Date(state.modified * 1000).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              background: 'rgba(0,255,167,0.1)',
              border: '1px solid rgba(0,255,167,0.3)',
              color: 'var(--evo-green)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,167,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,255,167,0.1)')}
          >
            <Download size={14} />
            Download
          </button>
        </div>
      )}

      {state.status === 'video' && (
        <div className="flex items-center justify-center h-full p-8">
          <video
            controls
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
          >
            <source src={`${API_BASE}/api/workspace/download?path=${encodeURIComponent(path)}`} />
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        </div>
      )}

      {state.status === 'audio' && (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <div
            className="flex items-center justify-center w-20 h-20 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--evo-green)" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <audio controls style={{ width: '100%', maxWidth: '500px' }}>
            <source src={`${API_BASE}/api/workspace/download?path=${encodeURIComponent(path)}`} />
            Seu navegador não suporta a reprodução de áudio.
          </audio>
        </div>
      )}

      {state.status === 'pdf' && (
        <iframe
          src={`${API_BASE}/api/workspace/download?path=${encodeURIComponent(path)}&inline=1`}
          className="w-full border-0"
          style={{ height: '100%' }}
          title={path}
        />
      )}

      {state.status === 'markdown' && (
        <div className="p-6 max-w-4xl">
          <Markdown>{state.content}</Markdown>
        </div>
      )}

      {state.status === 'html' && (
        <iframe
          srcDoc={state.content}
          className="w-full border-0"
          style={{ height: '100%', minHeight: '500px' }}
          title={path}
        />
      )}

      {state.status === 'code' && (
        <div className="h-full">
          <CodeView content={state.content} path={path} />
        </div>
      )}

      {state.status === 'text' && (
        <pre
          className="p-6 text-sm font-mono whitespace-pre-wrap break-words"
          style={{ color: 'var(--text-secondary)' }}
        >
          {state.content}
        </pre>
      )}
    </div>
  )
}
