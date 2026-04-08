import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import Markdown from '../components/Markdown'
import { Save, Eye, Pencil } from 'lucide-react'

const TABS = [
  { key: 'env', label: '.env', format: 'env' },
  { key: 'claude-md', label: 'CLAUDE.md', format: 'md' },
  { key: 'routines', label: 'ROUTINES.md', format: 'md' },
  { key: 'roadmap', label: 'ROADMAP.md', format: 'md' },
  { key: 'makefile', label: 'Makefile', format: 'json' },
  { key: 'commands', label: 'Commands', format: 'json' },
]

interface EnvEntry {
  type: 'var' | 'comment'
  key?: string
  value: string
}

function EnvEditor() {
  const [entries, setEntries] = useState<EnvEntry[]>([])
  const [raw, setRaw] = useState('')
  const [mode, setMode] = useState<'visual' | 'raw'>('visual')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/config/env').then((data: { entries: EnvEntry[]; raw: string }) => {
      setEntries(data.entries || [])
      setRaw(data.raw || '')
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (mode === 'raw') {
        await api.put('/config/env', { raw })
      } else {
        await api.put('/config/env', { entries })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const updateVar = (index: number, field: 'key' | 'value', val: string) => {
    setEntries(prev => {
      const next = [...prev]
      if (field === 'key') next[index] = { ...next[index], key: val }
      else next[index] = { ...next[index], value: val }
      return next
    })
  }

  if (loading) return <div className="text-[#667085]">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('visual')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'visual' ? 'bg-[#00FFA7]/10 text-[#00FFA7]' : 'text-[#667085] hover:text-[#D0D5DD]'}`}>
            <Eye size={12} /> Visual
          </button>
          <button onClick={() => { setMode('raw'); setRaw(entries.map(e => e.type === 'comment' ? e.value : `${e.key}=${e.value}`).join('\n')) }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'raw' ? 'bg-[#00FFA7]/10 text-[#00FFA7]' : 'text-[#667085] hover:text-[#D0D5DD]'}`}>
            <Pencil size={12} /> Raw
          </button>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${saved ? 'bg-[#00FFA7]/20 text-[#00FFA7]' : 'bg-[#00FFA7] text-[#0C111D] hover:bg-[#00FFA7]/90'} disabled:opacity-50`}>
          <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save .env'}
        </button>
      </div>

      {mode === 'raw' ? (
        <textarea value={raw} onChange={(e) => setRaw(e.target.value)}
          className="w-full h-[500px] px-4 py-3 rounded-lg bg-[#0C111D] border border-[#344054] text-[#D0D5DD] font-mono text-sm focus:outline-none focus:border-[#00FFA7] resize-none"
          spellCheck={false} />
      ) : (
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {entries.map((entry, i) => (
            entry.type === 'comment' ? (
              <div key={i} className="px-3 py-1.5 text-xs text-[#667085] font-mono">
                {entry.value}
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 px-3 py-1">
                <code className="text-xs text-[#00FFA7] font-mono w-56 shrink-0 truncate" title={entry.key}>
                  {entry.key}
                </code>
                <span className="text-[#667085]">=</span>
                <input type={entry.key?.includes('SECRET') || entry.key?.includes('TOKEN') || entry.key?.includes('PASSWORD') ? 'password' : 'text'}
                  value={entry.value} onChange={(e) => updateVar(i, 'value', e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-[#0C111D] border border-[#344054] text-[#D0D5DD] font-mono text-xs focus:outline-none focus:border-[#00FFA7]"
                  placeholder="(empty)" />
              </div>
            )
          ))}
        </div>
      )}

      <p className="text-[10px] text-[#667085] mt-3">
        Changes are saved to .env and reloaded immediately — no restart needed.
        Secrets (TOKEN, SECRET, PASSWORD) are masked in visual mode.
      </p>
    </div>
  )
}

export default function Config() {
  const [activeTab, setActiveTab] = useState('env')
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'env') return // env has its own component
    if (!content[activeTab]) {
      setLoading(true)
      const tab = TABS.find(t => t.key === activeTab)
      const fetcher = tab?.format === 'json' ? api.get(`/config/${activeTab}`) : api.getRaw(`/config/${activeTab}`)
      fetcher
        .then((data) => {
          if (tab?.format === 'json') {
            if (activeTab === 'makefile' && Array.isArray(data)) {
              const header = '| Command | Description |\n|---------|-------------|\n'
              const rows = data.map((item: { name?: string; description?: string }) => `| \`make ${item.name || ''}\` | ${item.description || ''} |`).join('\n')
              setContent((prev) => ({ ...prev, [activeTab]: header + rows }))
            } else if (activeTab === 'commands' && Array.isArray(data)) {
              const header = '| Command | Content |\n|---------|--------|\n'
              const rows = data.map((item: { name?: string; content?: string }) => `| \`${item.name || ''}\` | ${(item.content || '').substring(0, 100).replace(/\n/g, ' ')} |`).join('\n')
              setContent((prev) => ({ ...prev, [activeTab]: header + rows }))
            } else {
              setContent((prev) => ({ ...prev, [activeTab]: JSON.stringify(data, null, 2) }))
            }
          } else {
            setContent((prev) => ({ ...prev, [activeTab]: data }))
          }
        })
        .catch(() => setContent((prev) => ({ ...prev, [activeTab]: 'Failed to load content' })))
        .finally(() => setLoading(false))
    }
  }, [activeTab, content])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Config</h1>
        <p className="text-[#667085] mt-1">Workspace configuration files</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#344054] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-[#00FFA7] border-[#00FFA7]'
                : 'text-[#667085] border-transparent hover:text-[#D0D5DD]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#182230] border border-[#344054] rounded-xl p-6">
        {activeTab === 'env' ? (
          <EnvEditor />
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-5 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />)}
          </div>
        ) : (
          <div className="markdown-content">
            <Markdown>{content[activeTab] || ''}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}
