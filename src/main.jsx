import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'https://perfomity-cowork.onrender.com';
axios.defaults.baseURL = API;

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem('token'); delete axios.defaults.headers.common['Authorization']; })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const r = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', r.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}`;
    setUser(r.data.user);
    return r.data;
  };

  const register = async (name, email, password) => {
    const r = await axios.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', r.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}`;
    setUser(r.data.user);
    return r.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/clients', icon: '◈', label: 'Clients' },
    { path: '/launch', icon: '⚡', label: 'Launch Campaign' },
    { path: '/research', icon: '◎', label: 'Research' },
    { path: '/reporting', icon: '▲', label: 'Reporting' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">PERFOMITY <span>COWORK</span></div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button key={item.path} className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-pill">
          <div className="user-avatar">{user?.name?.[0] || 'P'}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 8 }} onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

// ─── PROTECTED LAYOUT ─────────────────────────────────────────────────────────
function AppLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">PERFOMITY <span>COWORK</span></div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your Perfomity account</div>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="arihant@perfomitymedia.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">Don't have an account? <a onClick={() => navigate('/register')}>Create one</a></div>
      </div>
    </div>
  );
}

function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">PERFOMITY <span>COWORK</span></div>
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Set up your Perfomity Cowork</div>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Arihant Jain" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="arihant@perfomitymedia.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">Already have an account? <a onClick={() => navigate('/login')}>Sign in</a></div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/reporting/overview')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner"></div><div className="loading-text">Loading dashboard...</div></div>;

  const t = data?.totals || {};
  const campaigns = data?.campaigns || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Good morning, {user?.name?.split(' ')[0]} 👋</div>
        <div className="page-subtitle">Here's your Perfomity Cowork overview</div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Spend</div>
          <div className="metric-value gold">₹{(t.spend || 0).toFixed(0)}</div>
          <div className="metric-sub">All campaigns</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value green">₹{(t.revenue || 0).toFixed(0)}</div>
          <div className="metric-sub">Attributed</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">ROAS</div>
          <div className="metric-value blue">{(t.roas || 0).toFixed(2)}x</div>
          <div className="metric-sub">Return on ad spend</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Purchases</div>
          <div className="metric-value">{t.purchases || 0}</div>
          <div className="metric-sub">Total conversions</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/launch')}>⚡ Launch Campaign</button>
        <button className="btn btn-secondary" onClick={() => navigate('/clients')}>+ Add Client</button>
        <button className="btn btn-ghost" onClick={() => navigate('/research')}>◎ Research Ads</button>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <div className="table-title">Recent Campaigns</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reporting')}>View All</button>
        </div>
        {campaigns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <div className="empty-title">No campaigns yet</div>
            <div className="empty-sub">Launch your first campaign to see it here</div>
            <button className="btn btn-primary" onClick={() => navigate('/launch')}>Launch Campaign</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Client</th>
                <th>Status</th>
                <th>Spend</th>
                <th>ROAS</th>
                <th>CPA</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 10).map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/reporting/${c.id}`)}>
                  <td><div style={{ fontWeight: 500 }}>{c.name}</div></td>
                  <td><span style={{ color: 'var(--muted)', fontSize: 12 }}>{c.clientName}</span></td>
                  <td><span className={`badge badge-${c.status === 'ACTIVE' ? 'green' : c.status === 'PAUSED' ? 'gold' : 'gray'}`}>{c.status}</span></td>
                  <td>₹{(c.metrics?.spend || 0).toFixed(0)}</td>
                  <td style={{ color: 'var(--green)' }}>{(c.metrics?.roas || 0).toFixed(2)}x</td>
                  <td>₹{(c.metrics?.cpa || 0).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── CLIENTS PAGE ─────────────────────────────────────────────────────────────
function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = () => axios.get('/api/clients').then(r => setClients(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({}); setErr(''); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm(c); setErr(''); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      if (editing) await axios.put(`/api/clients/${editing._id}`, form);
      else await axios.post('/api/clients', form);
      setShowModal(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this client?')) return;
    await axios.delete(`/api/clients/${id}`);
    load();
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">{clients.length} client{clients.length !== 1 ? 's' : ''} managed</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Client</button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--gray2)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div className="empty-icon">◈</div>
          <div className="empty-title">No clients yet</div>
          <div className="empty-sub">Add your first client to start launching campaigns</div>
          <button className="btn btn-primary" onClick={openNew}>+ Add Client</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {clients.map(c => (
            <div key={c._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{c.brand}</div>
                </div>
                <span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>AD ACCOUNT</div>
              <div style={{ fontSize: 12, marginBottom: 12, wordBreak: 'break-all' }}>{c.adAccountId || '—'}</div>
              {c.pixelId && <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--muted)' }}>PIXEL: {c.pixelId}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Client' : 'Add Client'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {err && <div className="alert alert-error">{err}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Client Name <em>*</em></label>
                    <input className="form-input" placeholder="e.g. Zukie Brand" value={form.name || ''} onChange={f('name')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand / Product</label>
                    <input className="form-input" placeholder="e.g. Zukie Perfumes" value={form.brand || ''} onChange={f('brand')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ad Account ID <em>*</em></label>
                  <input className="form-input" placeholder="act_2832086990326522" value={form.adAccountId || ''} onChange={f('adAccountId')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Meta Access Token <em>*</em></label>
                  <input className="form-input" type="password" placeholder="EAAR3ttx..." value={form.metaAccessToken || ''} onChange={f('metaAccessToken')} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Facebook Page ID <em>*</em></label>
                    <input className="form-input" placeholder="123456789" value={form.pageId || ''} onChange={f('pageId')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pixel ID</label>
                    <input className="form-input" placeholder="Optional" value={form.pixelId || ''} onChange={f('pixelId')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" placeholder="Any notes about this client..." value={form.notes || ''} onChange={f('notes')} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CAMPAIGN LAUNCHER ────────────────────────────────────────────────────────
function Launch() {
  const [step, setStep] = useState(0);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    clientId: '', campaignName: '', objective: 'OUTCOME_TRAFFIC',
    budgetType: 'ABO', totalBudget: '', conversionEvent: 'PURCHASE',
    landingUrl: '', ctaType: 'SHOP_NOW', driveImageUrl: '',
    as1_name: 'Broad — All India', as1_min: 18, as1_max: 45, as1_gender: 'all',
    as2_name: '', as2_interests: '', as2_min: 18, as2_max: 45, as2_gender: 'all',
    as3_name: '', as3_interests: '', as3_min: 18, as3_max: 45, as3_gender: 'all',
    cp_product: '', cp_benefit: '', cp_tone: 'Direct and punchy', cp_cta: 'Shop Now'
  });
  const [copies, setCopies] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');
  const [launching, setLaunching] = useState(false);
  const [launchMsg, setLaunchMsg] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { axios.get('/api/clients').then(r => setClients(r.data)); }, []);

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const selectedClient = clients.find(c => c._id === form.clientId);
  const perAdset = form.totalBudget ? Math.floor(form.totalBudget / 3) : 0;

  const buildTargeting = (min, max, gender, interests) => {
    const t = { geo_locations: { countries: ['IN'] }, age_min: parseInt(min), age_max: parseInt(max) };
    if (gender !== 'all') t.genders = [parseInt(gender)];
    if (interests) {
      const items = interests.split(',').map(s => ({ name: s.trim() })).filter(s => s.name);
      if (items.length) t.flexible_spec = [{ interests: items }];
    }
    return t;
  };

  const generateCopy = async () => {
    if (!form.cp_product || !form.cp_benefit) { setErr('Fill Product and Key Benefit'); return; }
    setGenerating(true); setErr('');
    const msgs = ['Analysing brief...', 'Writing headlines...', 'Crafting body copy...', 'Scoring ROAS potential...', 'Finalising...'];
    let i = 0;
    const iv = setInterval(() => { if (i < msgs.length) setGenMsg(msgs[i++]); }, 1200);
    try {
      const r = await axios.post('/api/generate', {
        brand: selectedClient?.brand || form.cp_product,
        benefit: form.cp_benefit,
        offer: form.cp_product,
        tone: form.cp_tone,
        cta: form.cp_cta,
        count: 3
      });
      setCopies(r.data.variants.slice(0, 3).map(v => ({ ...v, description: v.description || 'Shop now. Limited time.' })));
      setStep(3);
    } catch (e) {
      setErr(e.response?.data?.error || 'Generation failed');
    } finally {
      clearInterval(iv); setGenerating(false);
    }
  };

  const launchCampaign = async () => {
    if (!form.clientId) { setErr('Select a client'); return; }
    if (!form.campaignName) { setErr('Enter campaign name'); return; }
    if (!form.totalBudget) { setErr('Enter budget'); return; }
    if (!form.landingUrl) { setErr('Enter landing URL'); return; }
    if (!copies.length) { setErr('Generate ad copy first'); return; }
    if (form.objective === 'OUTCOME_SALES' && !selectedClient?.pixelId) {
      setErr('Sales objective requires a Pixel ID. Add it in the Client settings or switch to Traffic.');
      return;
    }

    setLaunching(true); setErr('');
    const msgs = ['Creating campaign...', 'Creating adset 1 of 3...', 'Creating adset 2 of 3...', 'Creating adset 3 of 3...', 'Creating ads...', 'Saving to database...'];
    let i = 0;
    const iv = setInterval(() => { if (i < msgs.length) setLaunchMsg(msgs[i++]); }, 3000);

    try {
      const adsets = [
        { name: form.as1_name || 'Broad — All India', targeting: buildTargeting(form.as1_min, form.as1_max, form.as1_gender, '') },
        { name: form.as2_name || 'Interest 1', targeting: buildTargeting(form.as2_min, form.as2_max, form.as2_gender, form.as2_interests) },
        { name: form.as3_name || 'Interest 2', targeting: buildTargeting(form.as3_min, form.as3_max, form.as3_gender, form.as3_interests) }
      ];

      const r = await axios.post('/api/campaigns/launch', {
        clientId: form.clientId,
        campaignName: form.campaignName,
        objective: form.objective,
        budgetType: form.budgetType,
        totalBudget: parseFloat(form.totalBudget),
        conversionEvent: form.conversionEvent,
        landingUrl: form.landingUrl,
        ctaType: form.ctaType,
        driveImageUrl: form.driveImageUrl,
        adsets,
        copies
      });

      setResult(r.data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Launch failed. Check your credentials and try again.');
    } finally {
      clearInterval(iv); setLaunching(false);
    }
  };

  const steps = ['Campaign', 'Targeting', 'Ad Copy', 'Launch'];

  if (result) return (
    <div>
      <div className="page-header">
        <div className="page-title">Campaign Launched! 🎉</div>
        <div className="page-subtitle">Check Meta Ads Manager to review and activate</div>
      </div>
      <div className="card" style={{ borderColor: 'var(--green)' }}>
        <div style={{ color: 'var(--green)', fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>✓ Campaign Created on Meta</div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--muted)', background: 'var(--gray3)', padding: 12, borderRadius: 8, marginBottom: 8, wordBreak: 'break-all' }}>
          <strong style={{ color: 'var(--white)', display: 'block', marginBottom: 4 }}>Campaign ID</strong>
          {result.metaCampaignId}
        </div>
        {result.campaign?.adsets?.map((a, i) => (
          <div key={i} style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--muted)', background: 'var(--gray3)', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <strong style={{ color: 'var(--white)', display: 'block', marginBottom: 4 }}>Adset {i + 1}: {a.name}</strong>
            ID: {a.metaAdsetId} · {a.ads?.length || 0} ads created
            {a.ads?.some(ad => ad.error) && <div style={{ color: 'var(--red)', marginTop: 4 }}>Some ads had errors — add creatives manually in Ads Manager</div>}
          </div>
        ))}
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => { setResult(null); setStep(0); setCopies([]); }}>Launch Another</button>
          <button className="btn btn-ghost" onClick={() => window.open('https://adsmanager.facebook.com', '_blank')}>Open Ads Manager</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Launch Campaign</div>
        <div className="page-subtitle">DCT structure — 1 Campaign · 3 Adsets · 3 Ads each</div>
      </div>

      <div className="step-bar">
        {steps.map((s, i) => (
          <button key={i} className={`step-tab ${step === i ? 'active' : i < step ? 'done' : ''}`} onClick={() => { if (i < step || copies.length > 0) setStep(i); }}>
            {i < step ? '✓ ' : ''}{s}
          </button>
        ))}
      </div>

      {err && <div className="alert alert-error" style={{ marginBottom: 20 }}>{err}</div>}

      {/* STEP 0: CAMPAIGN SETUP */}
      {step === 0 && (
        <div style={{ maxWidth: 640 }}>
          <div className="sec-title">Campaign Setup</div>
          <div className="form-group">
            <label className="form-label">Client <em>*</em></label>
            <select className="form-input" value={form.clientId} onChange={f('clientId')}>
              <option value="">Select a client</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name} — {c.brand}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Campaign Name <em>*</em></label>
              <input className="form-input" placeholder="e.g. Uff | Sales | Apr 26" value={form.campaignName} onChange={f('campaignName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Objective <em>*</em></label>
              <select className="form-input" value={form.objective} onChange={f('objective')}>
                <option value="OUTCOME_TRAFFIC">Traffic — Link Clicks</option>
                <option value="OUTCOME_SALES">Sales — Conversions (Pixel needed)</option>
                <option value="OUTCOME_LEADS">Leads</option>
                <option value="OUTCOME_AWARENESS">Awareness</option>
              </select>
            </div>
          </div>
          {form.objective === 'OUTCOME_SALES' && (
            <div className="info-box">
              <strong>Pixel Required</strong>
              Sales objective needs a Pixel ID set in your client settings. Current pixel: {selectedClient?.pixelId || 'Not set — go to Clients to add it'}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Budget Type</label>
            <div className="toggle-row">
              <button type="button" className={`toggle-opt ${form.budgetType === 'ABO' ? 'active' : ''}`} onClick={() => setForm({ ...form, budgetType: 'ABO' })}>ABO — Per Adset</button>
              <button type="button" className={`toggle-opt ${form.budgetType === 'CBO' ? 'active' : ''}`} onClick={() => setForm({ ...form, budgetType: 'CBO' })}>CBO — Campaign</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Total Daily Budget ₹ <em>*</em></label>
            <input className="form-input" type="number" placeholder="e.g. 3000" value={form.totalBudget} onChange={f('totalBudget')} />
          </div>
          {perAdset > 0 && (
            <div className="budget-pill">
              <div><div className="bp-label">Per Adset / Day</div><div className="bp-sub">Equal split · 3 adsets</div></div>
              <div style={{ textAlign: 'right' }}><div className="bp-val">₹{perAdset}</div><div className="bp-sub">{form.budgetType}</div></div>
            </div>
          )}
          {form.objective === 'OUTCOME_SALES' && (
            <div className="form-group">
              <label className="form-label">Conversion Event</label>
              <select className="form-input" value={form.conversionEvent} onChange={f('conversionEvent')}>
                <option value="PURCHASE">Purchase</option>
                <option value="ADD_TO_CART">Add to Cart</option>
                <option value="INITIATE_CHECKOUT">Initiate Checkout</option>
                <option value="LEAD">Lead</option>
                <option value="VIEW_CONTENT">View Content</option>
              </select>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Landing Page URL <em>*</em></label>
              <input className="form-input" type="url" placeholder="https://yourstore.com" value={form.landingUrl} onChange={f('landingUrl')} />
            </div>
            <div className="form-group">
              <label className="form-label">CTA Button</label>
              <select className="form-input" value={form.ctaType} onChange={f('ctaType')}>
                <option value="SHOP_NOW">Shop Now</option>
                <option value="BUY_NOW">Buy Now</option>
                <option value="LEARN_MORE">Learn More</option>
                <option value="SIGN_UP">Sign Up</option>
                <option value="GET_OFFER">Get Offer</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Creative URL (Google Drive direct link or image URL)</label>
            <input className="form-input" placeholder="https://drive.google.com/uc?export=download&id=..." value={form.driveImageUrl} onChange={f('driveImageUrl')} />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>For Drive: File → Share → Copy link → convert to direct download URL. Format: drive.google.com/uc?export=download&id=FILE_ID</div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => { if (!form.clientId || !form.campaignName || !form.totalBudget || !form.landingUrl) { setErr('Fill all required fields'); return; } setErr(''); setStep(1); }}>
            Next → Targeting
          </button>
        </div>
      )}

      {/* STEP 1: TARGETING */}
      {step === 1 && (
        <div style={{ maxWidth: 640 }}>
          <div className="info-box"><strong>DCT Testing Framework</strong>Adset 1 = Broad (Meta finds buyers). Adsets 2 & 3 = Your best interest segments. Equal budget split.</div>

          {[1, 2, 3].map(n => (
            <div key={n} className="adset-block">
              <div className="adset-header">
                <div className="adset-title">Adset {n}</div>
                <div className="adset-badge">{n === 1 ? 'Broad' : `Interest ${n - 1}`}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Adset Name</label>
                <input className="form-input" placeholder={n === 1 ? 'Broad — All India' : `Interest ${n - 1}`} value={form[`as${n}_name`]} onChange={f(`as${n}_name`)} />
              </div>
              {n > 1 && (
                <div className="form-group">
                  <label className="form-label">Interests (comma separated)</label>
                  <input className="form-input" placeholder="e.g. Perfume, Fragrance, Luxury" value={form[`as${n}_interests`]} onChange={f(`as${n}_interests`)} />
                </div>
              )}
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Age Min</label>
                  <input className="form-input" type="number" value={form[`as${n}_min`]} onChange={f(`as${n}_min`)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age Max</label>
                  <input className="form-input" type="number" value={form[`as${n}_max`]} onChange={f(`as${n}_max`)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form[`as${n}_gender`]} onChange={f(`as${n}_gender`)}>
                    <option value="all">All</option>
                    <option value="1">Men</option>
                    <option value="2">Women</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={() => { setErr(''); setStep(2); }}>Next → Ad Copy</button>
          </div>
        </div>
      )}

      {/* STEP 2: AD COPY */}
      {step === 2 && (
        <div style={{ maxWidth: 640 }}>
          <div className="info-box"><strong>Claude generates 3 variations</strong>One per ad. Each gets a unique angle, headline, and primary text. All editable after generation.</div>
          <div className="form-group">
            <label className="form-label">Product / Offer <em>*</em></label>
            <input className="form-input" placeholder="e.g. Uff Perfumes — Buy 2 Get 1 Free" value={form.cp_product} onChange={f('cp_product')} />
          </div>
          <div className="form-group">
            <label className="form-label">Key Benefit <em>*</em></label>
            <input className="form-input" placeholder="e.g. Affordable luxury, long lasting fragrance" value={form.cp_benefit} onChange={f('cp_benefit')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tone</label>
              <select className="form-input" value={form.cp_tone} onChange={f('cp_tone')}>
                <option>Direct and punchy</option>
                <option>Urgent and FOMO-driven</option>
                <option>Conversational and friendly</option>
                <option>Premium and refined</option>
                <option>Energetic and bold</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">CTA Text</label>
              <select className="form-input" value={form.cp_cta} onChange={f('cp_cta')}>
                <option>Shop Now</option>
                <option>Buy Now</option>
                <option>Get Offer</option>
                <option>Claim Deal</option>
                <option>Learn More</option>
              </select>
            </div>
          </div>

          {generating ? (
            <div className="loading-wrap"><div className="spinner"></div><div className="loading-text">{genMsg}</div></div>
          ) : (
            <button className="btn btn-secondary btn-lg btn-block" onClick={generateCopy}>✦ Generate 3 Ad Variations with Claude</button>
          )}

          {copies.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="sec-title">Generated Copies — Edit if needed</div>
              {copies.map((c, i) => (
                <div key={i} className="copy-card">
                  <div className="copy-card-header">
                    <span className="copy-angle">Variation {i + 1} · {c.angle}</span>
                    <span className={`copy-score ${c.isHot ? 'hot' : ''}`}>{c.isHot ? '🔥 ' : ''}{c.score}</span>
                  </div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label">Headline</label>
                    <input className="form-input" value={c.headline} onChange={e => { const n = [...copies]; n[i].headline = e.target.value; setCopies(n); }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label">Primary Text</label>
                    <textarea className="form-input" rows="3" value={c.primaryText} onChange={e => { const n = [...copies]; n[i].primaryText = e.target.value; setCopies(n); }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <input className="form-input" value={c.description || ''} onChange={e => { const n = [...copies]; n[i].description = e.target.value; setCopies(n); }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            {copies.length > 0 && <button className="btn btn-primary btn-lg" onClick={() => { setErr(''); setStep(3); }}>Next → Launch</button>}
          </div>
        </div>
      )}

      {/* STEP 3: LAUNCH */}
      {step === 3 && (
        <div style={{ maxWidth: 640 }}>
          <div className="info-box">
            <strong>Ready to Launch</strong>
            Campaign: {form.campaignName}<br />
            Client: {selectedClient?.name}<br />
            Budget: ₹{form.totalBudget}/day ({form.budgetType}) · ₹{perAdset}/adset<br />
            Adsets: 3 · Ads: {copies.length * 3} total · All in PAUSED status
          </div>

          <div className="sec-title">Summary — 3 Ad Copies to be used</div>
          {copies.map((c, i) => (
            <div key={i} style={{ background: 'var(--gray3)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--accent)', marginBottom: 6 }}>Ad {i + 1}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.headline}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.primaryText}</div>
            </div>
          ))}

          {launching ? (
            <div className="loading-wrap"><div className="spinner"></div><div className="loading-text">{launchMsg}</div></div>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={launchCampaign}>⚡ Launch Campaign on Meta</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RESEARCH PAGE ────────────────────────────────────────────────────────────
function Research() {
  const [form, setForm] = useState({ niche: '', competitor: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const analyze = async () => {
    if (!form.niche) { setErr('Enter a niche'); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const r = await axios.post('/api/research/analyze', form);
      setResult(r.data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Analysis failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Ad Research</div>
        <div className="page-subtitle">Claude analyses winning patterns in your niche</div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Research Brief</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Niche / Industry <em>*</em></label>
              <input className="form-input" placeholder="e.g. Perfumes, Protein Supplements" value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Competitor (optional)</label>
              <input className="form-input" placeholder="e.g. Boat, Mamaearth" value={form.competitor} onChange={e => setForm({ ...form, competitor: e.target.value })} />
            </div>
          </div>
          <div className="info-box">
            <strong>How it works</strong>
            Claude analyses winning ad patterns in your niche and generates ad copy inspired by what works. For direct competitor research, use Meta Ad Library: facebook.com/ads/library
          </div>
          {err && <div className="alert alert-error">{err}</div>}
          <button className="btn btn-secondary btn-lg" onClick={analyze} disabled={loading}>
            {loading ? 'Analysing...' : '◎ Analyse & Generate Winning Ads'}
          </button>
        </div>

        {loading && <div className="loading-wrap"><div className="spinner"></div><div className="loading-text">Claude is researching winning patterns...</div></div>}

        {result && (
          <div>
            <div className="sec-title">Strategic Insights</div>
            <div className="card" style={{ marginBottom: 20 }}>
              {result.insights?.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--fm)' }}>0{i + 1}</span>
                  <span>{ins}</span>
                </div>
              ))}
            </div>

            <div className="sec-title">Winning Hook Patterns</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {result.hooks?.map((h, i) => (
                <div key={i} className="badge badge-blue" style={{ padding: '6px 12px', fontSize: 12 }}>{h}</div>
              ))}
            </div>

            <div className="sec-title">Generated Ad Copies</div>
            {result.variants?.map((v, i) => (
              <div key={i} className="copy-card">
                <div className="copy-card-header">
                  <span className="copy-angle">{v.angle}</span>
                  <span className={`copy-score ${v.isHot ? 'hot' : ''}`}>{v.isHot ? '🔥 ' : ''}{v.score}</span>
                </div>
                <div className="copy-headline">{v.headline}</div>
                <div className="copy-body">{v.primaryText}</div>
                {v.rationale && <div style={{ fontSize: 11, color: 'var(--blue)', fontFamily: 'var(--fm)', marginTop: 8 }}>WHY IT WORKS: {v.rationale}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REPORTING PAGE ───────────────────────────────────────────────────────────
function Reporting() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    axios.get('/api/clients').then(r => setClients(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedClient ? `?clientId=${selectedClient}` : '';
    axios.get(`/api/reporting/overview${params}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [selectedClient]);

  const syncCampaign = async (id) => {
    setSyncing(id);
    try {
      await axios.post(`/api/campaigns/${id}/sync`);
      const params = selectedClient ? `?clientId=${selectedClient}` : '';
      const r = await axios.get(`/api/reporting/overview${params}`);
      setData(r.data);
    } catch (e) {
      alert('Sync failed: ' + (e.response?.data?.error || e.message));
    } finally { setSyncing(null); }
  };

  const t = data?.totals || {};
  const campaigns = data?.campaigns || [];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Reporting</div>
          <div className="page-subtitle">Live campaign performance across all clients</div>
        </div>
        <select className="form-input" style={{ width: 220 }} value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
          <option value="">All Clients</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="metrics-grid" style={{ marginBottom: 24 }}>
            <div className="metric-card">
              <div className="metric-label">Total Spend</div>
              <div className="metric-value gold">₹{(t.spend || 0).toFixed(0)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Revenue</div>
              <div className="metric-value green">₹{(t.revenue || 0).toFixed(0)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">ROAS</div>
              <div className="metric-value blue">{(t.roas || 0).toFixed(2)}x</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">CPA</div>
              <div className="metric-value">₹{(t.cpa || 0).toFixed(0)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Impressions</div>
              <div className="metric-value">{(t.impressions || 0).toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Clicks</div>
              <div className="metric-value">{(t.clicks || 0).toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">CTR</div>
              <div className="metric-value">{(t.ctr || 0).toFixed(2)}%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Purchases</div>
              <div className="metric-value">{t.purchases || 0}</div>
            </div>
          </div>

          <div className="table-wrap">
            <div className="table-header">
              <div className="table-title">{campaigns.length} Campaigns</div>
            </div>
            {campaigns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▲</div>
                <div className="empty-title">No campaigns yet</div>
                <div className="empty-sub">Launch a campaign to see reporting here</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Spend</th>
                    <th>Revenue</th>
                    <th>ROAS</th>
                    <th>CPA</th>
                    <th>CTR</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--fm)' }}>{c.objective?.replace('OUTCOME_', '')}</div>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.clientName}</td>
                      <td><span className={`badge badge-${c.status === 'ACTIVE' ? 'green' : c.status === 'PAUSED' ? 'gold' : 'gray'}`}>{c.status}</span></td>
                      <td>₹{(c.metrics?.spend || 0).toFixed(0)}</td>
                      <td style={{ color: 'var(--green)' }}>₹{(c.metrics?.revenue || 0).toFixed(0)}</td>
                      <td style={{ color: 'var(--blue)', fontWeight: 600 }}>{(c.metrics?.roas || 0).toFixed(2)}x</td>
                      <td>₹{(c.metrics?.cpa || 0).toFixed(0)}</td>
                      <td>{(c.metrics?.ctr || 0).toFixed(2)}%</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => syncCampaign(c.id)} disabled={syncing === c.id}>
                          {syncing === c.id ? '...' : '↻ Sync'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
          <Route path="/launch" element={<AppLayout><Launch /></AppLayout>} />
          <Route path="/research" element={<AppLayout><Research /></AppLayout>} />
          <Route path="/reporting" element={<AppLayout><Reporting /></AppLayout>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
