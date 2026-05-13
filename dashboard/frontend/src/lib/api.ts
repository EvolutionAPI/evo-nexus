const API = import.meta.env.DEV ? 'http://localhost:8080' : '';

// Sent on all mutating requests for CSRF mitigation (backend checks this header).
// Browsers cannot forge custom headers cross-origin without a CORS preflight,
// which the backend rejects for non-allowlisted origins.
const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' };

/** Erro estruturado lançado pelos métodos do `api`.
 *
 * Carrega `status` (número HTTP) e `code` (string opcional, vinda do JSON
 * do backend — ex.: `rate_limited`, `SYNC_IN_PROGRESS`). Consumidores
 * NOVOS devem checar essas propriedades; o `.message` continua existindo
 * no formato `"<status> <statusText>: <detail>"` para preservar callers
 * antigos que fazem `msg.includes('401')` etc. (Sourcery #80).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/** Extract a human-readable error message from a non-OK response.
 *
 * Tries JSON first (most backend routes return `{error, code}` or
 * `{error, message}`), then falls back to plain text. Always prefixes the
 * status so existing callers that pattern-match on '401'/'403' keep working.
 */
async function buildError(res: Response): Promise<ApiError> {
  let detail = ''
  let code: string | undefined
  try {
    const data = await res.clone().json()
    detail = data?.error || data?.description || data?.message || ''
    // Backend pode retornar `{error: "rate_limited", ...}` — nesse caso
    // o próprio "error" é o code. Também aceita um `code` explícito.
    code = data?.code || (typeof data?.error === 'string' ? data.error : undefined)
  } catch {
    try {
      const text = await res.text()
      // Trim default Flask HTML-error noise; keep payload short.
      detail = text.length < 500 ? text.trim() : ''
    } catch {
      // ignore
    }
  }
  const base = `${res.status} ${res.statusText}`
  const message = detail ? `${base}: ${detail}` : base
  return new ApiError(message, res.status, code)
}

export const api = {
  get: async (path: string, extraHeaders?: HeadersInit) => {
    const res = await fetch(`${API}/api${path}`, {
      credentials: 'include',
      headers: extraHeaders,
    });
    if (!res.ok) throw await buildError(res);
    return res.json();
  },
  getRaw: async (path: string) => {
    const res = await fetch(`${API}/api${path}`, { credentials: 'include' });
    if (!res.ok) throw await buildError(res);
    return res.text();
  },
  post: async (path: string, body?: unknown) => {
    const res = await fetch(`${API}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...XHR_HEADER },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await buildError(res);
    return res.json();
  },
  put: async (path: string, body?: unknown) => {
    const res = await fetch(`${API}/api${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...XHR_HEADER },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await buildError(res);
    return res.json();
  },
  patch: async (path: string, body?: unknown) => {
    const res = await fetch(`${API}/api${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...XHR_HEADER },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await buildError(res);
    return res.json();
  },
  delete: async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      method: 'DELETE',
      headers: { ...XHR_HEADER },
      credentials: 'include',
    });
    if (!res.ok) throw await buildError(res);
    return res.json();
  },
};
