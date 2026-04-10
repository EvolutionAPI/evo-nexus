import { useEffect, useState } from 'react'
import {
  Plus,
  Trash2,
  Plug,
  CheckCircle2,
  AlertCircle,
  Globe,
  MessageSquare,
  DollarSign,
  Video,
  Camera,
  Briefcase,
  Database,
  type LucideIcon,
} from 'lucide-react'
import { api } from '../lib/api'

interface Integration {
  name: string
  type: string
  status: 'ok' | 'error' | 'pending'
}

interface SocialAccount {
  index: number
  label: string
  status: string
  detail: string
  days_left: number | null
}

interface SocialPlatform {
  id: string
  name: string
  icon: string
  accounts: SocialAccount[]
  has_connected: boolean
}

// Category styling for integration types
const TYPE_META: Record<string, { icon: LucideIcon; color: string; colorMuted: string; glowColor: string }> = {
  'api': { icon: Globe, color: '#60A5FA', colorMuted: 'rgba(96,165,250,0.12)', glowColor: 'rgba(96,165,250,0.15)' },
  'mcp': { icon: Plug, color: '#A78BFA', colorMuted: 'rgba(167,139,250,0.12)', glowColor: 'rgba(167,139,250,0.15)' },
  'cli': { icon: Database, color: '#22D3EE', colorMuted: 'rgba(34,211,238,0.12)', glowColor: 'rgba(34,211,238,0.15)' },
  'erp': { icon: DollarSign, color: '#34D399', colorMuted: 'rgba(52,211,153,0.12)', glowColor: 'rgba(52,211,153,0.15)' },
  'bot': { icon: MessageSquare, color: '#FBBF24', colorMuted: 'rgba(251,191,36,0.12)', glowColor: 'rgba(251,191,36,0.15)' },
  'oauth': { icon: Globe, color: '#F472B6', colorMuted: 'rgba(244,114,182,0.12)', glowColor: 'rgba(244,114,182,0.15)' },
}

const DEFAULT_TYPE = { icon: Plug, color: '#8b949e', colorMuted: 'rgba(139,148,158,0.12)', glowColor: 'rgba(139,148,158,0.15)' }

function getTypeMeta(type: string) {
  if (!type) return DEFAULT_TYPE
  const key = Object.keys(TYPE_META).find((k) => type.toLowerCase().includes(k))
  return key ? TYPE_META[key] : DEFAULT_TYPE
}

// Social platform icon mapping
const PLATFORM_ICONS: Record<string, { icon: LucideIcon; color: string; colorMuted: string; glowColor: string }> = {
  'youtube': { icon: Video, color: '#EF4444', colorMuted: 'rgba(239,68,68,0.12)', glowColor: 'rgba(239,68,68,0.15)' },
  'instagram': { icon: Camera, color: '#E879F9', colorMuted: 'rgba(232,121,249,0.12)', glowColor: 'rgba(232,121,249,0.15)' },
  'linkedin': { icon: Briefcase, color: '#60A5FA', colorMuted: 'rgba(96,165,250,0.12)', glowColor: 'rgba(96,165,250,0.15)' },
}

const DEFAULT_PLATFORM = { icon: Globe, color: '#8b949e', colorMuted: 'rgba(139,148,158,0.12)', glowColor: 'rgba(139,148,158,0.15)' }

function getPlatformMeta(id: string) {
  const key = Object.keys(PLATFORM_ICONS).find((k) => id.toLowerCase().includes(k))
  return key ? PLATFORM_ICONS[key] : DEFAULT_PLATFORM
}

// Stat Card (matches Overview design)
function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="group relative bg-[#161b22] border border-[#21262d] rounded-2xl p-5 transition-all duration-300 hover:border-[#00FFA7]/40 hover:shadow-[0_0_24px_rgba(0,255,167,0.06)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FFA7]/20 to-transparent rounded-t-2xl" />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#00FFA7]/8 border border-[#00FFA7]/15">
          <Icon size={18} className="text-[#00FFA7]" />
        </div>
      </div>
      <p className="text-3xl font-bold text-[#e6edf3] tracking-tight">{value}</p>
      <p className="text-sm text-[#667085] mt-1">{label}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-[#21262d] animate-pulse" />
        <div className="h-2 w-2 rounded-full bg-[#21262d] animate-pulse" />
      </div>
      <div className="h-4 w-32 rounded bg-[#21262d] animate-pulse mb-2" />
      <div className="h-3 w-20 rounded bg-[#21262d] animate-pulse" />
    </div>
  )
}

function SkeletonStat() {
  return <div className="skeleton h-24 rounded-2xl" />
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/integrations').catch(() => ({ integrations: [] })),
      api.get('/social-accounts').catch(() => ({ platforms: [] })),
    ]).then(([intData, socialData]) => {
      const ints = (intData?.integrations || []).map((i: any) => ({
        name: i.name || '',
        type: i.type || i.category || '',
        status: (i.status === 'ok' || i.configured) ? 'ok' as const : 'pending' as const,
      }))
      setIntegrations(ints)
      setPlatforms(socialData?.platforms || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleDisconnect = async (platformId: string, index: number) => {
    try {
      const data = await api.delete(`/social-accounts/${platformId}/${index}`)
      setPlatforms(data?.platforms || [])
    } catch (e) {
      console.error(e)
    }
  }

  const connectedCount = integrations.filter((i) => i.status === 'ok').length
  const totalSocialAccounts = platforms.reduce((sum, p) => sum + p.accounts.length, 0)

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e6edf3] tracking-tight">Integrations</h1>
        <p className="text-[#667085] text-sm mt-1">Connected services, APIs & social accounts</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <StatCard label="Connected" value={connectedCount} icon={CheckCircle2} />
            <StatCard label="Total Integrations" value={integrations.length} icon={Plug} />
            <StatCard label="Social Accounts" value={totalSocialAccounts} icon={Globe} />
          </>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* API Integrations */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#00FFA7]/8 border border-[#00FFA7]/15">
                <Plug size={14} className="text-[#00FFA7]" />
              </div>
              <h2 className="text-base font-semibold text-[#e6edf3]">APIs & Services</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00FFA7]/10 text-[#00FFA7] border border-[#00FFA7]/20">
                {integrations.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((int, i) => {
                const typeMeta = getTypeMeta(int.type)
                const Icon = typeMeta.icon
                const isConnected = int.status === 'ok'

                return (
                  <div
                    key={i}
                    className="group relative rounded-xl border border-[#21262d] bg-[#161b22] p-5 transition-all duration-300 hover:border-transparent"
                  >
                    {/* Hover glow */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        boxShadow: isConnected
                          ? `inset 0 0 0 1px rgba(0,255,167,0.27), 0 0 20px rgba(0,255,167,0.10)`
                          : `inset 0 0 0 1px ${typeMeta.color}44, 0 0 20px ${typeMeta.glowColor}`,
                        borderRadius: 'inherit',
                      }}
                    />

                    {/* Top row: icon + status dot */}
                    <div className="relative flex items-start justify-between mb-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: typeMeta.colorMuted }}
                      >
                        <Icon size={20} style={{ color: typeMeta.color }} />
                      </div>
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full mt-1"
                        style={{
                          backgroundColor: isConnected ? '#00FFA7' : '#3F3F46',
                          boxShadow: isConnected ? '0 0 8px rgba(0,255,167,0.5)' : 'none',
                        }}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="relative text-[15px] font-semibold text-[#e6edf3] transition-colors duration-200 group-hover:text-white mb-2">
                      {int.name}
                    </h3>

                    {/* Bottom badges */}
                    <div className="relative flex items-center gap-2">
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: typeMeta.colorMuted,
                          color: typeMeta.color,
                          borderColor: `${typeMeta.color}33`,
                        }}
                      >
                        {int.type}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        isConnected
                          ? 'bg-[#00FFA7]/10 text-[#00FFA7] border-[#00FFA7]/25'
                          : 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/25'
                      }`}>
                        {isConnected ? 'Connected' : 'Not configured'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Social Accounts */}
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#00FFA7]/8 border border-[#00FFA7]/15">
                <Globe size={14} className="text-[#00FFA7]" />
              </div>
              <h2 className="text-base font-semibold text-[#e6edf3]">Social Accounts</h2>
            </div>

            <div className="space-y-6">
              {platforms.map((platform) => {
                const platMeta = getPlatformMeta(platform.id)
                const PlatIcon = platMeta.icon

                return (
                  <div key={platform.id}>
                    {/* Platform header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: platMeta.colorMuted }}
                        >
                          <PlatIcon size={16} style={{ color: platMeta.color }} />
                        </div>
                        <span className="font-semibold text-[#e6edf3] text-sm">{platform.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#667085] border border-[#21262d]">
                          {platform.accounts.length} account{platform.accounts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <a
                        href={`/connect/${platform.id}`}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#00FFA7]/10 text-[#00FFA7] border border-[#00FFA7]/20 hover:bg-[#00FFA7]/20 hover:shadow-[0_0_12px_rgba(0,255,167,0.10)] transition-all"
                      >
                        <Plus size={13} /> Add account
                      </a>
                    </div>

                    {/* Account cards */}
                    {platform.accounts.length > 0 ? (
                      <div className="space-y-2">
                        {platform.accounts.map((acc) => {
                          const isOk = acc.status === 'connected'
                          const isExpiring = acc.status === 'expiring'
                          const isExpired = acc.status === 'expired'

                          return (
                            <div
                              key={acc.index}
                              className="group relative rounded-xl border border-[#21262d] bg-[#161b22] p-4 flex items-center justify-between transition-all duration-300 hover:border-transparent"
                            >
                              {/* Hover glow */}
                              <div
                                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{
                                  boxShadow: `inset 0 0 0 1px ${platMeta.color}44, 0 0 16px ${platMeta.glowColor}`,
                                  borderRadius: 'inherit',
                                }}
                              />

                              <div className="relative flex items-center gap-3">
                                {/* Status dot */}
                                <span
                                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: isOk ? '#00FFA7' : isExpired ? '#EF4444' : isExpiring ? '#FBBF24' : '#3F3F46',
                                    boxShadow: isOk ? '0 0 6px rgba(0,255,167,0.5)' : isExpired ? '0 0 6px rgba(239,68,68,0.5)' : 'none',
                                  }}
                                />
                                <div>
                                  <p className="text-sm font-medium text-[#e6edf3]">{acc.label}</p>
                                  <p className="text-xs text-[#667085] mt-0.5">{acc.detail}</p>
                                </div>
                              </div>

                              <div className="relative flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                                  isOk ? 'bg-[#00FFA7]/10 text-[#00FFA7] border-[#00FFA7]/25' :
                                  isExpiring ? 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/25' :
                                  isExpired ? 'bg-red-500/10 text-red-400 border-red-500/25' :
                                  'bg-white/[0.04] text-[#667085] border-[#21262d]'
                                }`}>
                                  {isOk && <CheckCircle2 size={10} />}
                                  {(isExpiring || isExpired) && <AlertCircle size={10} />}
                                  {isOk ? 'Connected' :
                                   isExpiring ? `Expires in ${acc.days_left}d` :
                                   isExpired ? 'Expired' : 'Incomplete'}
                                </span>
                                <button
                                  onClick={() => handleDisconnect(platform.id, acc.index)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#667085] hover:text-red-400 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[#21262d] bg-[#161b22]/50 p-6 text-center">
                        <p className="text-sm text-[#667085]">No accounts connected</p>
                        <p className="text-xs text-[#3F3F46] mt-1">Click "Add account" to get started</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
