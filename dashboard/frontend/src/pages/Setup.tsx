import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function Setup() {
  const { refreshUser } = useAuth()
  const [hasConfig, setHasConfig] = useState<boolean | null>(null)

  // Step 1: Workspace (only if no config exists)
  const [ownerName, setOwnerName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [language, setLanguage] = useState('en')

  // Step 2: Admin account
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Check if workspace.yaml already exists (CLI setup done)
  useEffect(() => {
    api.get('/config/workspace-status').then((data: { configured: boolean }) => {
      setHasConfig(data.configured)
    }).catch(() => setHasConfig(false))
  }, [])

  const [currentStep, setCurrentStep] = useState(1)

  // If config exists, skip to step 2
  useEffect(() => {
    if (hasConfig === true) setCurrentStep(2)
  }, [hasConfig])

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault()
    if (!ownerName.trim()) { setError('Your name is required'); return }
    setError('')
    setDisplayName(ownerName)
    setCurrentStep(2)
  }

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError('Username is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setSubmitting(true)
    try {
      // Collect geo (silent, best-effort)
      let geo = {}
      try {
        const geoResp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
        if (geoResp.ok) {
          const geoData = await geoResp.json()
          geo = {
            country: geoData.country_name,
            country_code: geoData.country_code,
            city: geoData.city,
            region: geoData.region,
            lat: geoData.latitude,
            lng: geoData.longitude,
            timezone: geoData.timezone,
          }
        }
      } catch { /* geo is optional */ }

      await api.post('/auth/setup', {
        // Send workspace config whenever Step 1 was shown (owner empty or no config)
        workspace: (hasConfig && currentStep === 2 && !ownerName.trim()) ? undefined : {
          owner_name: ownerName.trim(),
          company_name: companyName.trim(),
          timezone,
          language,
          agents: [],
          integrations: [],
          geo,
        },
        username: username.trim(),
        email: email.trim() || undefined,
        display_name: (displayName.trim() || ownerName.trim() || username.trim()),
        password,
      })
      await refreshUser()
      // Redirect to providers page for AI configuration
      window.location.href = '/providers'
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Setup failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-[#0C111D] border border-[#344054] text-white placeholder-[#667085] focus:outline-none focus:border-[#00FFA7] focus:ring-1 focus:ring-[#00FFA7] transition-colors text-sm"

  if (hasConfig === null) return (
    <div className="min-h-screen bg-[#0C111D] flex items-center justify-center">
      <div className="text-[#667085] text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0C111D] flex items-center justify-center px-4 py-8 font-[Inter]">
      <div className="w-full max-w-md">
        <div className="bg-[#182230] rounded-2xl border border-[#344054] p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-[#00FFA7]">Evo</span>
              <span className="text-white">Nexus</span>
            </h1>
            <p className="text-[#667085] text-sm mt-2">
              {currentStep === 1 ? 'Configure your workspace' : 'Create your admin account'}
            </p>
            {!hasConfig && (
              <div className="flex gap-2 justify-center mt-3">
                <div className={`h-1 w-16 rounded-full ${currentStep >= 1 ? 'bg-[#00FFA7]' : 'bg-[#344054]'}`} />
                <div className={`h-1 w-16 rounded-full ${currentStep >= 2 ? 'bg-[#00FFA7]' : 'bg-[#344054]'}`} />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Workspace config (only if CLI setup was not done) */}
          {currentStep === 1 && !hasConfig && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Your Name *</label>
                <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                  className={inputClass} placeholder="John Doe" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Company</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass} placeholder="Acme Inc" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Timezone</label>
                  <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                    className={inputClass} placeholder="America/Sao_Paulo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className={inputClass}>
                    <option value="en">English</option>
                    <option value="pt-BR">Portugues (BR)</option>
                    <option value="es">Espanol</option>
                  </select>
                </div>
              </div>

              <button type="submit"
                className="w-full py-2.5 rounded-lg bg-[#00FFA7] text-[#0C111D] font-semibold text-sm hover:bg-[#00FFA7]/90 transition-colors mt-2">
                Next
              </button>
            </form>
          )}

          {/* Step 2: Admin Account */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Username *</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className={inputClass} placeholder="admin" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputClass} placeholder="admin@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass} placeholder={ownerName || 'Admin'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Password *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className={inputClass} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#D0D5DD] mb-1.5">Confirm Password *</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass} placeholder="Repeat password" />
              </div>

              <div className="flex gap-3 mt-2">
                {!hasConfig && (
                  <button type="button" onClick={() => setCurrentStep(1)}
                    className="flex-1 py-2.5 rounded-lg text-[#D0D5DD] text-sm hover:bg-white/5 border border-[#344054] transition-colors">
                    Back
                  </button>
                )}
                <button type="submit" disabled={submitting}
                  className={`${hasConfig ? 'w-full' : 'flex-1'} py-2.5 rounded-lg bg-[#00FFA7] text-[#0C111D] font-semibold text-sm hover:bg-[#00FFA7]/90 transition-colors disabled:opacity-50`}>
                  {submitting ? 'Setting up...' : 'Create Admin & Start'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Credits */}
        <div className="text-center mt-6">
          <a href="https://evolutionfoundation.com.br" target="_blank" rel="noopener noreferrer" className="text-[#667085] text-xs hover:text-[#00FFA7] transition-colors">
            by <span className="font-semibold text-[#00FFA7]/70 hover:text-[#00FFA7]">Evolution Foundation</span>
          </a>
        </div>
      </div>
    </div>
  )
}
