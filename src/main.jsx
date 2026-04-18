import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'https://perfomity-cowork.onrender.com';

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pc_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pc_token') || null);

  const login = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem('pc_user', JSON.stringify(u));
    localStorage.setItem('pc_token', t);
  };
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('pc_user');
    localStorage.removeItem('pc_token');
  };
  const apiFetch = async (path, opts = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };
  return <AuthContext.Provider value={{ user, token, login, logout, apiFetch }}>{children}</AuthContext.Provider>;
}
const useAuth = () => useContext(AuthContext);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  bg: '#0D0D0D', card: '#1A1A1A', border: '#2A2A2A', orange: '#FF4500',
  orangeD: '#CC3700', text: '#F0F0F0', muted: '#888', green: '#22C55E', red: '#EF4444'
};
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${S.bg}; color: ${S.text}; font-family: 'DM Sans', system-ui, sans-serif; }
  input, select, textarea {
    background: #111; border: 1px solid ${S.border}; color: ${S.text};
    border-radius: 8px; padding: 10px 14px; width: 100%; font-size: 14px;
    outline: none; transition: border 0.2s;
  }
  input:focus, select:focus, textarea:focus { border-color: ${S.orange}; }
  button { cursor: pointer; font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; display: inline-block; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fade { animation: fadeIn 0.3s ease; }
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = 'primary', disabled, style = {}, small }) => {
  const base = {
    padding: small ? '8px 16px' : '12px 24px',
    borderRadius: 8, border: 'none', fontWeight: 600,
    fontSize: small ? 13 : 14, transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style
  };
  const variants = {
    primary: { background: S.orange, color: '#fff' },
    ghost: { background: 'transparent', color: S.muted, border: `1px solid ${S.border}` },
    danger: { background: '#1f0000', color: S.red, border: `1px solid #3f0000` },
    success: { background: '#052010', color: S.green, border: `1px solid #0a3020` }
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, ...style }}>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>}
    <input {...props} />
  </div>
);

const Toast = ({ msg, type }) => msg ? (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: type === 'error' ? '#1f0000' : '#052010',
    border: `1px solid ${type === 'error' ? S.red : S.green}`,
    color: type === 'error' ? S.red : S.green,
    padding: '14px 20px', borderRadius: 10, maxWidth: 360, fontSize: 14
  }} className="fade">{msg}</div>
) : null;

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.user, data.token);
      nav('/dashboard');
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: S.text }}>PERFOMITY</span>{' '}
            <span style={{ color: S.orange }}>COWORK</span>
          </div>
          <div style={{ color: S.muted, fontSize: 14, marginTop: 8 }}>Meta Ads Automation Platform</div>
        </div>
        <Card>
          {err && <div style={{ color: S.red, marginBottom: 16, fontSize: 13, padding: '10px 14px', background: '#1f0000', borderRadius: 8 }}>{err}</div>}
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@perfomitymedia.com" />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <Btn onClick={submit} disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? '⟳ Signing in...' : 'Sign In'}
          </Btn>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: S.muted }}>
            No account? <span style={{ color: S.orange, cursor: 'pointer' }} onClick={() => nav('/register')}>Register</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.user, data.token);
      nav('/dashboard');
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            <span style={{ color: S.text }}>PERFOMITY</span> <span style={{ color: S.orange }}>COWORK</span>
          </div>
        </div>
        <Card>
          {err && <div style={{ color: S.red, marginBottom: 16, fontSize: 13 }}>{err}</div>}
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Arihant Jain" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <Btn onClick={submit} disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? '⟳ Creating account...' : 'Create Account'}
          </Btn>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: S.muted }}>
            Have account? <span style={{ color: S.orange, cursor: 'pointer' }} onClick={() => nav('/login')}>Sign in</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
const navItems = [
  { path: '/dashboard', icon: '▦', label: 'Dashboard' },
  { path: '/clients', icon: '◉', label: 'Clients' },
  { path: '/launch', icon: '⚡', label: 'Launch Campaign' },
  { path: '/reporting', icon: '▲', label: 'Reporting' },
  { path: '/research', icon: '◈', label: 'Research' },
];

function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#111', borderRight: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: S.text }}>PERFOMITY</span><br />
            <span style={{ color: S.orange }}>COWORK</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {navItems.map(item => {
            const active = loc.pathname === item.path;
            return (
              <div key={item.path} onClick={() => nav(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                  background: active ? '#FF450015' : 'transparent',
                  color: active ? S.orange : S.muted,
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s'
                }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: S.muted, marginBottom: 12 }}>{user?.email}</div>
          <Btn onClick={logout} variant="ghost" small style={{ width: '100%' }}>Logout</Btn>
        </div>
      </div>
      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: 32, maxWidth: 'calc(100vw - 220px)' }}>
        {children}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { apiFetch, user } = useAuth();
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    apiFetch('/api/clients').then(setClients).catch(() => {});
    apiFetch('/api/campaign-logs').then(setLogs).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: '◉' },
    { label: 'Campaigns Launched', value: logs.length, icon: '⚡' },
    { label: 'Total Ads Created', value: logs.reduce((a, l) => a + (l.adIds?.length || 0), 0), icon: '▦' },
    { label: 'Total Budget/Day', value: `₹${logs.reduce((a, l) => a + (l.budget || 0), 0).toLocaleString()}`, icon: '₹' },
  ];

  return (
    <div className="fade">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
      </h1>
      <p style={{ color: S.muted, marginBottom: 32 }}>Here's your Perfomity Cowork overview.</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: S.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1, color: S.orange }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Btn onClick={() => nav('/launch')} style={{ width: '100%' }}>⚡ Launch New Campaign</Btn>
            <Btn onClick={() => nav('/clients')} variant="ghost" style={{ width: '100%' }}>+ Add Client</Btn>
            <Btn onClick={() => nav('/reporting')} variant="ghost" style={{ width: '100%' }}>▲ View Reports</Btn>
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1, color: S.orange }}>Recent Launches</div>
          {logs.length === 0 ? (
            <div style={{ color: S.muted, fontSize: 14 }}>No campaigns launched yet.</div>
          ) : logs.slice(0, 4).map(l => (
            <div key={l._id} style={{ padding: '10px 0', borderBottom: `1px solid ${S.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{l.name}</div>
                <div style={{ fontSize: 12, color: S.muted }}>{l.adIds?.length} ads · ₹{l.budget}/day</div>
              </div>
              <span style={{ fontSize: 11, color: '#f59e0b', background: '#1c1000', padding: '3px 8px', borderRadius: 4 }}>PAUSED</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients() {
  const { apiFetch } = useAuth();
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', brand: '', website: '', adAccountId: '', accessToken: '', pageId: '', instagramId: '', pixelId: '', notes: '' });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { apiFetch('/api/clients').then(setClients).catch(() => {}); }, []);

  const save = async () => {
    setLoading(true);
    try {
      if (editing) {
        const updated = await apiFetch(`/api/clients/${editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        setClients(c => c.map(x => x._id === updated._id ? updated : x));
        showToast('Client updated');
      } else {
        const created = await apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(form) });
        setClients(c => [created, ...c]);
        showToast('Client added');
      }
      setShowForm(false); setEditing(null);
      setForm({ name: '', brand: '', website: '', adAccountId: '', accessToken: '', pageId: '', instagramId: '', pixelId: '', notes: '' });
    } catch (e) { showToast(e.message, 'error'); } finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this client?')) return;
    await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
    setClients(c => c.filter(x => x._id !== id));
    showToast('Deleted');
  };

  const edit = (c) => { setEditing(c); setForm(c); setShowForm(true); };

  return (
    <div className="fade">
      <Toast msg={toast?.msg} type={toast?.type} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Clients</h1>
        <Btn onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', brand: '', website: '', adAccountId: '', accessToken: '', pageId: '', instagramId: '', pixelId: '', notes: '' }); }}>+ Add Client</Btn>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 20, color: S.orange }}>{editing ? 'Edit Client' : 'New Client'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Client Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Uff Perfumes" />
            <Input label="Brand / Product" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Uff Perfumes" />
            <Input label="Website URL" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://uffperfumes.com" />
            <Input label="Ad Account ID" value={form.adAccountId} onChange={e => setForm({ ...form, adAccountId: e.target.value })} placeholder="act_2832086990326522" />
            <div style={{ gridColumn: '1/-1' }}>
              <Input label="Access Token" value={form.accessToken} onChange={e => setForm({ ...form, accessToken: e.target.value })} placeholder="EAAxxxxxxxxx..." />
            </div>
            <Input label="Facebook Page ID" value={form.pageId} onChange={e => setForm({ ...form, pageId: e.target.value })} placeholder="123456789" />
            <Input label="Instagram Account ID" value={form.instagramId} onChange={e => setForm({ ...form, instagramId: e.target.value })} placeholder="17841xxxxxx (optional)" />
            <Input label="Pixel ID" value={form.pixelId} onChange={e => setForm({ ...form, pixelId: e.target.value })} placeholder="123456789 (optional)" />
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any notes about this client..." style={{ background: '#111', border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '10px 14px', width: '100%', fontSize: 14, outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Btn onClick={save} disabled={loading}>{loading ? '⟳ Saving...' : 'Save Client'}</Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      {clients.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◉</div>
          <div style={{ color: S.muted }}>No clients yet. Add your first client to get started.</div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {clients.map(c => (
            <Card key={c._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: S.muted, marginBottom: 8 }}>{c.website}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: S.muted }}>
                    <span>Ad Account: <span style={{ color: S.text }}>{c.adAccountId || '—'}</span></span>
                    <span>Page ID: <span style={{ color: S.text }}>{c.pageId || '—'}</span></span>
                    <span>Pixel: <span style={{ color: S.text }}>{c.pixelId || '—'}</span></span>
                  </div>
                  {c.accessToken && <div style={{ fontSize: 12, color: S.green, marginTop: 6 }}>✓ Access token saved</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn small variant="ghost" onClick={() => edit(c)}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => del(c._id)}>Delete</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LAUNCH CAMPAIGN ──────────────────────────────────────────────────────────
function Launch() {
  const { apiFetch } = useAuth();
  const [step, setStep] = useState(0);
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [copies, setCopies] = useState([]);
  const [result, setResult] = useState(null);

  const [brief, setBrief] = useState({
    clientId: '', campaignName: '', brand: '', benefit: '', offer: '',
    audience: '', tone: 'Direct and punchy', cta: 'Shop Now',
    numVariants: 3
  });
  const [targeting, setTargeting] = useState({
    ageMin: 18, ageMax: 45, countries: 'IN', genders: ''
  });
  const [budget, setBudget] = useState({
    adsetDailyBudget: 999, numAdsets: 3,
    websiteUrl: '', accessToken: '', adAccountId: '', pageId: ''
  });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => { apiFetch('/api/clients').then(setClients).catch(() => {}); }, []);

  // Auto-fill from client
  const selectClient = (clientId) => {
    setBrief(b => ({ ...b, clientId }));
    const c = clients.find(x => x._id === clientId);
    if (c) {
      setBudget(b => ({
        ...b,
        websiteUrl: c.website || b.websiteUrl,
        accessToken: c.accessToken || b.accessToken,
        adAccountId: c.adAccountId || b.adAccountId,
        pageId: c.pageId || b.pageId,
      }));
      setBrief(b => ({ ...b, clientId, brand: c.brand || b.brand }));
    }
  };

  const generateCopies = async () => {
    setGenerating(true);
    try {
      const data = await apiFetch('/api/generate-copy', {
        method: 'POST',
        body: JSON.stringify({
          brand: brief.brand, benefit: brief.benefit, offer: brief.offer,
          audience: brief.audience, tone: brief.tone, cta: brief.cta,
          numVariants: brief.numVariants
        })
      });
      setCopies(data.variants);
      setStep(2);
    } catch (e) { showToast(e.message, 'error'); } finally { setGenerating(false); }
  };

  const launch = async () => {
    setLaunching(true);
    try {
      const selectedCopies = copies.filter(c => c._selected !== false);
      const data = await apiFetch('/api/launch-campaign', {
        method: 'POST',
        body: JSON.stringify({
          clientId: brief.clientId,
          campaignName: brief.campaignName,
          adsetDailyBudget: budget.adsetDailyBudget,
          numAdsets: budget.numAdsets,
          copies: selectedCopies,
          targeting: {
            ageMin: targeting.ageMin,
            ageMax: targeting.ageMax,
            countries: targeting.countries.split(',').map(s => s.trim()),
            genders: targeting.genders ? targeting.genders.split(',').map(Number) : []
          },
          websiteUrl: budget.websiteUrl,
          accessToken: budget.accessToken,
          adAccountId: budget.adAccountId,
          pageId: budget.pageId
        })
      });
      setResult(data);
      setStep(3);
    } catch (e) { showToast(e.message, 'error'); } finally { setLaunching(false); }
  };

  const steps = ['Campaign Brief', 'Targeting & Budget', 'Review Ad Copy', 'Launched'];

  return (
    <div className="fade">
      <Toast msg={toast?.msg} type={toast?.type} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>Launch Campaign</h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
              color: i === step ? S.orange : i < step ? S.green : S.muted,
              borderBottom: `2px solid ${i === step ? S.orange : i < step ? S.green : S.border}`,
              paddingBottom: 12, width: '100%'
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: i === step ? S.orange : i < step ? S.green : S.border,
                color: i <= step ? '#fff' : S.muted
              }}>{i < step ? '✓' : i + 1}</span>
              {s}
            </div>
          </div>
        ))}
      </div>

      {/* Step 0: Brief */}
      {step === 0 && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 20, color: S.orange, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13 }}>Campaign Brief</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Select Client</label>
              <select value={brief.clientId} onChange={e => selectClient(e.target.value)}>
                <option value="">— Select client —</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Campaign Name" value={brief.campaignName} onChange={e => setBrief({ ...brief, campaignName: e.target.value })} placeholder="Uff Perfumes - Buy2Get1 - Apr 2026" />
            <Input label="Brand / Product" value={brief.brand} onChange={e => setBrief({ ...brief, brand: e.target.value })} placeholder="Uff Perfumes — long-lasting Indian fragrances" />
            <Input label="Key Benefit" value={brief.benefit} onChange={e => setBrief({ ...brief, benefit: e.target.value })} placeholder="Lasts 12+ hours, premium scent" />
            <div style={{ gridColumn: '1/-1' }}>
              <Input label="Offer / Promotion" value={brief.offer} onChange={e => setBrief({ ...brief, offer: e.target.value })} placeholder="Buy 2 Get 1 FREE — limited time" />
            </div>
            <Input label="Target Audience" value={brief.audience} onChange={e => setBrief({ ...brief, audience: e.target.value })} placeholder="Urban Indian men & women 22-40" />
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Tone</label>
              <select value={brief.tone} onChange={e => setBrief({ ...brief, tone: e.target.value })}>
                <option>Direct and punchy</option>
                <option>Aspirational and premium</option>
                <option>Friendly and conversational</option>
                <option>Urgent and FOMO-driven</option>
                <option>Story-driven / founder angle</option>
              </select>
            </div>
            <Input label="CTA Text" value={brief.cta} onChange={e => setBrief({ ...brief, cta: e.target.value })} placeholder="Shop Now" />
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Ad Variants to Generate</label>
              <select value={brief.numVariants} onChange={e => setBrief({ ...brief, numVariants: Number(e.target.value) })}>
                <option value={3}>3 variants</option>
                <option value={5}>5 variants</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <Btn onClick={() => setStep(1)} disabled={!brief.campaignName || !brief.brand || !brief.benefit || !brief.offer}>
              Next: Targeting & Budget →
            </Btn>
          </div>
        </Card>
      )}

      {/* Step 1: Targeting + Budget */}
      {step === 1 && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 20, color: S.orange, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13 }}>Targeting & Budget</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Age Min" type="number" value={targeting.ageMin} onChange={e => setTargeting({ ...targeting, ageMin: Number(e.target.value) })} />
            <Input label="Age Max" type="number" value={targeting.ageMax} onChange={e => setTargeting({ ...targeting, ageMax: Number(e.target.value) })} />
            <Input label="Countries (comma-separated)" value={targeting.countries} onChange={e => setTargeting({ ...targeting, countries: e.target.value })} placeholder="IN" />
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Gender</label>
              <select value={targeting.genders} onChange={e => setTargeting({ ...targeting, genders: e.target.value })}>
                <option value="">All genders</option>
                <option value="1">Male only</option>
                <option value="2">Female only</option>
              </select>
            </div>
            <Input label="Daily Budget per Adset (₹)" type="number" value={budget.adsetDailyBudget} onChange={e => setBudget({ ...budget, adsetDailyBudget: Number(e.target.value) })} />
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Number of Adsets</label>
              <select value={budget.numAdsets} onChange={e => setBudget({ ...budget, numAdsets: Number(e.target.value) })}>
                <option value={1}>1 adset</option>
                <option value={2}>2 adsets</option>
                <option value={3}>3 adsets</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1', padding: '12px 16px', background: '#111', borderRadius: 8, fontSize: 13, color: S.muted }}>
              Total daily budget: <strong style={{ color: S.text }}>₹{budget.adsetDailyBudget * budget.numAdsets}/day</strong>
            </div>
            <Input label="Website URL" value={budget.websiteUrl} onChange={e => setBudget({ ...budget, websiteUrl: e.target.value })} placeholder="https://uffperfumes.com/shop" />
            <Input label="Facebook Page ID" value={budget.pageId} onChange={e => setBudget({ ...budget, pageId: e.target.value })} placeholder="From client record or Business Manager" />
            {!brief.clientId && <>
              <Input label="Ad Account ID (override)" value={budget.adAccountId} onChange={e => setBudget({ ...budget, adAccountId: e.target.value })} placeholder="act_2832086990326522" />
              <Input label="Access Token (override)" value={budget.accessToken} onChange={e => setBudget({ ...budget, accessToken: e.target.value })} placeholder="EAAxxxxxx..." />
            </>}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Btn variant="ghost" onClick={() => setStep(0)}>← Back</Btn>
            <Btn onClick={generateCopies} disabled={generating || !budget.websiteUrl || !budget.pageId}>
              {generating ? <><span className="spin">⟳</span> Generating AI copies...</> : '⚡ Generate Ad Copies →'}
            </Btn>
          </div>
        </Card>
      )}

      {/* Step 2: Review copies */}
      {step === 2 && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1, color: S.orange }}>Review Ad Copies</div>
                <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>AI-generated variants — edit or deselect before launching</div>
              </div>
              <div style={{ fontSize: 13, color: S.muted }}>
                Campaign: <strong style={{ color: S.text }}>{brief.campaignName}</strong> · Budget: <strong style={{ color: S.text }}>₹{budget.adsetDailyBudget * budget.numAdsets}/day</strong>
              </div>
            </div>
          </Card>

          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {copies.map((copy, i) => (
              <Card key={i} style={{ border: `1px solid ${copy._selected === false ? S.border : copy.isHot ? S.orange + '60' : S.border}`, opacity: copy._selected === false ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: S.muted, fontWeight: 600 }}>Ad {i + 1}</span>
                    {copy.isHot && <span style={{ fontSize: 11, color: S.orange, background: '#FF450015', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>🔥 TOP PICK</span>}
                    <span style={{ fontSize: 11, color: S.muted }}>{copy.angle}</span>
                    <span style={{ fontSize: 11, color: S.green }}>{copy.score}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn small variant={copy._selected === false ? 'ghost' : 'success'} onClick={() => setCopies(c => c.map((x, j) => j === i ? { ...x, _selected: x._selected === false ? true : false } : x))}>
                      {copy._selected === false ? 'Include' : '✓ Selected'}
                    </Btn>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Headline</label>
                  <input value={copy.headline} onChange={e => setCopies(c => c.map((x, j) => j === i ? { ...x, headline: e.target.value } : x))} style={{ marginTop: 4, marginBottom: 10 }} />
                  <label style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Primary Text</label>
                  <textarea value={copy.primaryText} rows={3} onChange={e => setCopies(c => c.map((x, j) => j === i ? { ...x, primaryText: e.target.value } : x))}
                    style={{ marginTop: 4, background: '#111', border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '10px 14px', width: '100%', fontSize: 14, outline: 'none', resize: 'vertical' }} />
                </div>
              </Card>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
            <Btn onClick={launch} disabled={launching}>
              {launching ? <><span className="spin">⟳</span> Launching on Meta...</> : '⚡ Launch Campaign on Meta'}
            </Btn>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && result && (
        <Card style={{ textAlign: 'center', padding: 48 }} className="fade">
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Campaign Created!</h2>
          <p style={{ color: S.muted, marginBottom: 32 }}>Your campaign is live in Meta Ads Manager in PAUSED status. Review and activate when ready.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Campaign ID', value: result.campaignId },
              { label: 'Ad Sets', value: result.summary.adsets },
              { label: 'Total Ads', value: result.summary.ads },
              { label: 'Daily Budget', value: result.summary.totalDailyBudget },
            ].map(s => (
              <div key={s.label} style={{ background: '#111', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: S.muted, marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Btn onClick={() => { setStep(0); setCopies([]); setResult(null); }}>Launch Another</Btn>
            <a href={`https://www.facebook.com/adsmanager/manage/campaigns`} target="_blank" rel="noreferrer">
              <Btn variant="ghost">Open in Ads Manager ↗</Btn>
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── REPORTING ────────────────────────────────────────────────────────────────
function Reporting() {
  const { apiFetch } = useAuth();
  const [clients, setClients] = useState([]);
  const [sel, setSel] = useState({ clientId: '', datePreset: 'last_7d', level: 'campaign' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { apiFetch('/api/clients').then(setClients).catch(() => {}); }, []);

  const fetchReport = async () => {
    const client = clients.find(c => c._id === sel.clientId);
    if (!client) return;
    setLoading(true); setErr('');
    try {
      const res = await apiFetch('/api/report', {
        method: 'POST',
        body: JSON.stringify({ adAccountId: client.adAccountId, accessToken: client.accessToken, datePreset: sel.datePreset, level: sel.level })
      });
      setData(res.data || []);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  const getMetric = (row, type) => {
    const actions = row.actions || [];
    const found = actions.find(a => a.action_type === type);
    return found ? found.value : '—';
  };

  return (
    <div className="fade">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>Reporting</h1>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Client</label>
            <select value={sel.clientId} onChange={e => setSel({ ...sel, clientId: e.target.value })}>
              <option value="">— Select client —</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Date Range</label>
            <select value={sel.datePreset} onChange={e => setSel({ ...sel, datePreset: e.target.value })}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7d">Last 7 days</option>
              <option value="last_14d">Last 14 days</option>
              <option value="last_30d">Last 30 days</option>
              <option value="this_month">This month</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Level</label>
            <select value={sel.level} onChange={e => setSel({ ...sel, level: e.target.value })}>
              <option value="campaign">Campaign</option>
              <option value="adset">Ad Set</option>
              <option value="ad">Ad</option>
            </select>
          </div>
          <Btn onClick={fetchReport} disabled={loading || !sel.clientId}>
            {loading ? <><span className="spin">⟳</span></> : '▲ Pull Report'}
          </Btn>
        </div>
      </Card>

      {err && <div style={{ color: S.red, marginBottom: 16, padding: '12px 16px', background: '#1f0000', borderRadius: 8 }}>{err}</div>}

      {data && (
        <Card style={{ overflowX: 'auto' }}>
          {data.length === 0 ? (
            <div style={{ color: S.muted, textAlign: 'center', padding: 32 }}>No data for this period.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                  {['Name', 'Spend (₹)', 'Impressions', 'Clicks', 'CTR', 'CPM', 'Purchases', 'ROAS'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: S.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${S.border}`, transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.campaign_name || row.adset_name || row.ad_name}</td>
                    <td style={{ padding: '12px' }}>₹{parseFloat(row.spend || 0).toFixed(0)}</td>
                    <td style={{ padding: '12px' }}>{parseInt(row.impressions || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{parseInt(row.clicks || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{parseFloat(row.ctr || 0).toFixed(2)}%</td>
                    <td style={{ padding: '12px' }}>₹{parseFloat(row.cpm || 0).toFixed(0)}</td>
                    <td style={{ padding: '12px' }}>{getMetric(row, 'purchase')}</td>
                    <td style={{ padding: '12px', color: row.purchase_roas?.[0]?.value > 2 ? S.green : S.text }}>
                      {row.purchase_roas?.[0]?.value ? parseFloat(row.purchase_roas[0].value).toFixed(2) + 'x' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── RESEARCH ─────────────────────────────────────────────────────────────────
function Research() {
  const { apiFetch } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const presets = [
    'Write 5 high-converting ad hooks for a perfume brand targeting men 25-40 in India',
    'What are the best Meta ad strategies for DTC ecommerce in 2026?',
    'Give me 3 creative angles for a Buy 2 Get 1 FREE perfume offer',
    'Analyze what makes a high ROAS Facebook ad for fashion brands',
    'Write 5 different UGC-style ad scripts for a skincare brand',
  ];

  const ask = async () => {
    setLoading(true); setResponse('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'You are an expert Meta ads strategist and DTC copywriter. Give concise, actionable, specific responses. Format your answers clearly.',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      setResponse(data.content?.map(c => c.text).join('') || 'No response');
    } catch (e) { setResponse('Error: ' + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AI Research</h1>
      <p style={{ color: S.muted, marginBottom: 28 }}>Ask anything about Meta ads, creative strategy, or copywriting.</p>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Quick Prompts</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {presets.map(p => (
              <button key={p} onClick={() => setPrompt(p)} style={{
                background: '#111', border: `1px solid ${S.border}`, color: S.muted,
                borderRadius: 20, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
                transition: 'all 0.15s'
              }}>{p.substring(0, 50)}...</button>
            ))}
          </div>
        </div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Ask about ad strategy, copy, audiences, creative angles..."
          style={{ background: '#111', border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '12px 14px', width: '100%', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 12 }} />
        <Btn onClick={ask} disabled={loading || !prompt.trim()}>
          {loading ? <><span className="spin">⟳</span> Thinking...</> : '◈ Ask AI'}
        </Btn>
      </Card>

      {response && (
        <Card className="fade">
          <div style={{ fontSize: 12, color: S.orange, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>AI Response</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: S.text }}>{response}</div>
        </Card>
      )}
    </div>
  );
}

// ─── PROTECTED ROUTE ──────────────────────────────────────────────────────────
function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{css}</style>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Protected><AppLayout><Dashboard /></AppLayout></Protected>} />
            <Route path="/clients" element={<Protected><AppLayout><Clients /></AppLayout></Protected>} />
            <Route path="/launch" element={<Protected><AppLayout><Launch /></AppLayout></Protected>} />
            <Route path="/reporting" element={<Protected><AppLayout><Reporting /></AppLayout></Protected>} />
            <Route path="/research" element={<Protected><AppLayout><Research /></AppLayout></Protected>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
