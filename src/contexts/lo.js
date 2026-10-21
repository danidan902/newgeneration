import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from 'recharts';

// ─────────────────────────────────────────────
// THEME CONTEXT
// ─────────────────────────────────────────────
const ThemeContext = createContext({ isDark: true, toggle: () => {} });

const tokens = (dark) => ({
  bg:       dark ? '#080C14' : '#F0F4FF',
  surface:  dark ? '#0E1525' : '#FFFFFF',
  glass:    dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
  glassBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.15)',
  sidebar:  dark ? '#080C14' : '#FFFFFF',
  card:     dark ? '#111827' : '#FFFFFF',
  cyan:     '#06E5C8',
  violet:   '#7C5CFC',
  blue:     '#4F8EF7',
  amber:    '#F5A623',
  rose:     '#F7526A',
  green:    '#22D5A6',
  grad1:    'linear-gradient(135deg, #7C5CFC, #4F8EF7)',
  grad2:    'linear-gradient(135deg, #06E5C8, #4F8EF7)',
  grad3:    'linear-gradient(135deg, #F5A623, #F7526A)',
  grad4:    'linear-gradient(135deg, #22D5A6, #06E5C8)',
  text:     dark ? '#EEF2FF' : '#0F172A',
  textSub:  dark ? '#94A3CF' : '#475569',
  textMuted:dark ? '#4A5580' : '#94A3B8',
  border:   dark ? 'rgba(79,142,247,0.12)' : 'rgba(99,102,241,0.12)',
  success: '#22D5A6',
  danger:  '#F7526A',
  warning: '#F5A623',
});

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { height: 100%; font-family: 'Outfit', sans-serif; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.4); border-radius: 4px; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(6,229,200,0.4); } 70% { box-shadow: 0 0 0 10px rgba(6,229,200,0); } 100% { box-shadow: 0 0 0 0 rgba(6,229,200,0); } }
      @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      .anim-fadeup { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
      .anim-fadein { animation: fadeIn .3s ease both; }
      .anim-spin { animation: spin 1s linear infinite; }
      .anim-float { animation: float 3s ease-in-out infinite; }
      .anim-pulse { animation: pulse-ring 2s ease-out infinite; }
      .stagger-1 { animation-delay: .05s; } .stagger-2 { animation-delay: .10s; } .stagger-3 { animation-delay: .15s; } .stagger-4 { animation-delay: .20s; } .stagger-5 { animation-delay: .25s; } .stagger-6 { animation-delay: .30s; }
      .nav-link { transition: all .2s ease; }
      .nav-link:hover { transform: translateX(3px); }
      .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
      .card-hover:hover { transform: translateY(-3px); }
      .btn-primary { transition: all .2s ease; cursor: pointer; border: none; outline: none; }
      .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }
      .btn-primary:active { transform: translateY(0); }
      .glass-card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      .mono { font-family: 'JetBrains Mono', monospace; }
      .table-row { transition: background .15s ease; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
);

const Icons = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  marks:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  report:    "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  news:      "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  profile:   "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  sun:       "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  moon:      "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  bell:      "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  logout:    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  menu:      "M4 6h16M4 12h16M4 18h16",
  close:     "M6 18L18 6M6 6l12 12",
  chevron:   "M19 9l-7 7-7-7",
  star:      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  trend:     "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  book:      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  collapse:  "M11 19l-7-7 7-7",
  expand:    "M13 5l7 7-7 7",
};

// ─────────────────────────────────────────────
// REUSABLE PRIMITIVES
// ─────────────────────────────────────────────
const GlassCard = ({ children, style, className = '', hover = false }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  return (
    <div className={`glass-card ${hover ? 'card-hover' : ''} ${className}`} style={{ background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 20, ...style }}>
      {children}
    </div>
  );
};

const GradBadge = ({ children, grad }) => (
  <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>
    {children}
  </span>
);

const StatusPill = ({ status }) => {
  const map = {
    Pass: ['#22D5A6', 'rgba(34,213,166,0.12)'],
    Fail: ['#F7526A', 'rgba(247,82,106,0.12)'],
    present: ['#22D5A6', 'rgba(34,213,166,0.10)'],
    absent: ['#F7526A', 'rgba(247,82,106,0.10)'],
    late: ['#F5A623', 'rgba(245,166,35,0.10)'],
  };
  const [color, bg] = map[status] || ['#94A3B8', 'rgba(148,163,184,0.1)'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: '.04em', color, background: bg, border: `1px solid ${color}30`, textTransform: 'uppercase' }}>
      {status === 'present' ? '●' : status === 'absent' ? '●' : status === 'late' ? '●' : null} {status}
    </span>
  );
};

const Spinner = ({ color = '#7C5CFC' }) => (
  <div style={{ width: 36, height: 36, border: `3px solid ${color}20`, borderTop: `3px solid ${color}`, borderRadius: '50%' }} className="anim-spin" />
);

// ─────────────────────────────────────────────
// METRIC CARD
// ─────────────────────────────────────────────
const MetricCard = ({ label, value, sub, grad, icon, delay = 0 }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  return (
    <div className={`card-hover anim-fadeup stagger-${delay}`} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: '24px 20px', position: 'relative', overflow: 'hidden', cursor: 'default' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: grad, borderRadius: '50%', opacity: .15, filter: 'blur(12px)' }} />
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: grad, marginBottom: 14, color: '#fff' }}>{icon}</div>
      <p style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color: t.text, lineHeight: 1, marginBottom: 6 }} className="mono">{value}</p>
      {sub && <p style={{ fontSize: 12, color: t.textSub }}>{sub}</p>}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: grad, borderRadius: '0 0 20px 20px' }} />
    </div>
  );
};

// ─────────────────────────────────────────────
// CHART TOOLTIP
// ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, isDark }) => {
  const t = tokens(isDark);
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.glassBorder}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>{p.name}: <span className="mono">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span></p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// SIDEBAR - COLLAPSE VIA HAMBURGER
// ─────────────────────────────────────────────
const navItems = [
  { path: '/student',            label: 'Dashboard',  icon: Icons.dashboard },
  { path: '/student/marks',      label: 'My Marks',   icon: Icons.marks },
  { path: '/student/attendance', label: 'Attendance',  icon: Icons.calendar },
  { path: '/student/reports',    label: 'Reports',    icon: Icons.report },
  { path: '/student/news',       label: 'News Feed',  icon: Icons.news },
  { path: '/student/profile',    label: 'Profile',    icon: Icons.profile },
];

const Sidebar = ({ user, classData, studentData, open, onClose, collapsed }) => {
  const { isDark, toggle } = useContext(ThemeContext);
  const t = tokens(isDark);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (p) => p === '/student' ? location.pathname === '/student' : location.pathname.startsWith(p);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <>
      {open && !collapsed && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }} className="anim-fadein" />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: sidebarWidth, background: t.sidebar,
        borderRight: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', zIndex: 50,
        transition: 'width .3s cubic-bezier(.22,1,.36,1), transform .3s cubic-bezier(.22,1,.36,1)',
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 12px' : '28px 24px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: t.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, boxShadow: '0 4px 16px rgba(124,92,252,0.4)', flexShrink: 0 }}>E</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: t.text, letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>EduManage</p>
                <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>Student Portal</p>
              </div>
            </div>
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 12, background: t.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, boxShadow: '0 4px 16px rgba(124,92,252,0.4)' }}>E</div>
          )}
        </div>

        {/* User card - hidden when collapsed */}
        {!collapsed && (
          <div style={{ padding: '16px 20px' }}>
            <div style={{ background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, boxShadow: '0 4px 14px rgba(124,92,252,0.35)', flexShrink: 0 }}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                  {classData?.grade ? `Grade ${classData.grade}` : studentData?.grade || 'Student'}
                  {classData?.section ? ` · Sec ${classData.section}` : ''}
                </p>
                {classData?.program && <p style={{ fontSize: 11, color: t.cyan, marginTop: 1 }}>{classData.program}</p>}
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.green, flexShrink: 0, boxShadow: `0 0 0 3px ${t.green}30` }} className="anim-pulse" />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '8px 8px' : '0 12px' }}>
          {!collapsed && <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: '.1em', textTransform: 'uppercase', padding: '6px 12px 10px' }}>Navigation</p>}
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={onClose} className="nav-link" title={collapsed ? item.label : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12, justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '12px' : '10px 14px', borderRadius: 12, marginBottom: 2, textDecoration: 'none',
                  background: active ? t.grad1 : 'transparent', color: active ? '#fff' : t.textSub,
                  fontWeight: active ? 600 : 500, fontSize: 14,
                  boxShadow: active ? '0 4px 16px rgba(124,92,252,0.3)' : 'none', position: 'relative',
                }}>
                <Icon d={item.icon} size={collapsed ? 20 : 17} />
                {!collapsed && item.label}
                {active && !collapsed && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: collapsed ? '8px' : '12px', borderTop: `1px solid ${t.border}` }}>
          <button onClick={toggle} title={isDark ? 'Light Mode' : 'Dark Mode'}
            style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%', padding: collapsed ? '10px' : '10px 14px', borderRadius: 12, background: t.glass, border: `1px solid ${t.glassBorder}`, color: t.textSub, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 6 }}
            className="btn-primary">
            <Icon d={isDark ? Icons.sun : Icons.moon} size={collapsed ? 18 : 17} />
            {!collapsed && <>{isDark ? 'Light Mode' : 'Dark Mode'}<div style={{ marginLeft: 'auto', width: 36, height: 20, borderRadius: 99, background: isDark ? t.violet : t.cyan, position: 'relative', transition: 'background .3s' }}><div style={{ position: 'absolute', top: 2, left: isDark ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} /></div></>}
          </button>
          {!collapsed && (
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', borderRadius: 12, background: 'transparent', border: 'none', color: t.danger, fontSize: 14, fontWeight: 500, cursor: 'pointer' }} className="btn-primary">
              <Icon d={Icons.logout} size={17} /> Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────
// HEADER - WITH HAMBURGER FOR COLLAPSE
// ─────────────────────────────────────────────
const Header = ({ user, onMobileMenuClick, onToggleCollapse, collapsed }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [showDrop, setShowDrop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pageName = navItems.find(n => {
    if (n.path === '/student') return location.pathname === '/student';
    return location.pathname.startsWith(n.path);
  })?.label || 'Dashboard';

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: isDark ? 'rgba(8,12,20,0.85)' : 'rgba(240,244,255,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${t.border}`,
      padding: '0 24px', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Hamburger - toggles collapse on desktop, opens sidebar on mobile */}
        <button onClick={onToggleCollapse}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
            color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          className="btn-primary"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon d={Icons.menu} />
        </button>
        <div>
          <p style={{ fontWeight: 800, fontSize: 18, color: t.text, lineHeight: 1.1 }}>{pageName}</p>
          <p style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{today}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => {}} style={{ width: 38, height: 38, borderRadius: 10, background: t.glass, border: `1px solid ${t.glassBorder}`, color: t.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }} className="btn-primary">
          <Icon d={Icons.bell} />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: t.rose, border: `2px solid ${isDark ? '#080C14' : '#F0F4FF'}` }} />
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowDrop(!showDrop)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 12, padding: '6px 10px', cursor: 'pointer' }}
            className="btn-primary">
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: t.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{user?.name?.split(' ')[0]}</span>
            <span style={{ color: t.textMuted, display: 'flex' }}><Icon d={Icons.chevron} size={14} /></span>
          </button>

          {showDrop && (
            <>
              <div onClick={() => setShowDrop(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div className="anim-fadeup" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 220, borderRadius: 16, zIndex: 50, background: t.surface, border: `1px solid ${t.border}`, boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(99,102,241,0.12)', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: `1px solid ${t.border}` }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{user?.name}</p>
                  <p style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{user?.email}</p>
                </div>
                <div style={{ padding: '8px' }}>
                  <Link to="/student/profile" onClick={() => setShowDrop(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: t.textSub, fontSize: 13, fontWeight: 500 }} className="nav-link">
                    <Icon d={Icons.profile} size={15} /> My Profile
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, background: 'none', border: 'none', color: t.danger, fontSize: 13, fontWeight: 500, cursor: 'pointer' }} className="nav-link">
                    <Icon d={Icons.logout} size={15} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
// STUDENT HOME - WITH REAL API DATA
// ─────────────────────────────────────────────
const StudentHome = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [user, setUser] = useState(null);
  const [marksSummary, setMarksSummary] = useState(null);
  const [subjectWiseMarks, setSubjectWiseMarks] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      const studentId = userData._id || userData.id;
      if (!studentId) { setLoading(false); return; }

      let marks = [];
      try { const marksRes = await api.get(`/marks/student/${studentId}`); marks = marksRes.data || []; } catch (err) {}

      const subjectsMap = new Map();
      marks.forEach(mark => {
        if (!subjectsMap.has(mark.subject)) subjectsMap.set(mark.subject, { subject: mark.subject, firstTest: 0, midExam: 0, notebook: 0, finalExam: 0, total: 0 });
        const s = subjectsMap.get(mark.subject);
        if (mark.examType === 'quiz') s.firstTest = mark.score;
        else if (mark.examType === 'midterm') s.midExam = mark.score;
        else if (mark.examType === 'assignment') s.notebook = mark.score;
        else if (mark.examType === 'final') s.finalExam = mark.score;
        s.total = s.firstTest + s.midExam + s.notebook + s.finalExam;
      });
      const subjectsData = Array.from(subjectsMap.values());
      setSubjectWiseMarks(subjectsData);

      let overallAvg = 0, result = 'N/A', grade = 'N/A';
      if (subjectsData.length > 0) {
        overallAvg = subjectsData.reduce((sum, s) => sum + s.total, 0) / subjectsData.length;
        result = overallAvg >= 50 ? 'Pass' : 'Fail';
        if (overallAvg >= 90) grade = 'A+'; else if (overallAvg >= 80) grade = 'A'; else if (overallAvg >= 70) grade = 'B'; else if (overallAvg >= 60) grade = 'C'; else if (overallAvg >= 50) grade = 'D'; else grade = 'F';
      }
      setMarksSummary({ total: subjectsData.reduce((sum, s) => sum + s.total, 0), percentage: overallAvg.toFixed(2), result, grade });

      try { const attRes = await api.get(`/attendance/student/${studentId}`); const attendance = attRes.data || []; const present = attendance.filter(a => a.status === 'present').length; setAttendanceStats({ present, absent: attendance.length - present, total: attendance.length }); } catch (err) {}

    } catch (error) { console.error('Error:', error); toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const attendancePercentage = attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0;
  const chartData = subjectWiseMarks.map(s => ({ name: s.subject.slice(0, 4), total: s.total, firstTest: s.firstTest * 10, midExam: s.midExam * 5 }));
  const CustomTooltip = (props) => <ChartTooltip {...props} isDark={isDark} />;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="text-center"><Spinner /><p className="mt-4" style={{ color: t.textMuted }}>Loading dashboard...</p></div></div>;

  return (
    <div>
      <div className="anim-fadeup" style={{ background: t.grad1, borderRadius: 20, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(6,229,200,0.15)' }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 6 }}>Good day 👋</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Your academic overview at a glance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <MetricCard label="Overall Average" value={`${marksSummary?.percentage || 0}%`} sub={`Grade ${marksSummary?.grade || 'N/A'}`} grad={t.grad1} icon={<Icon d={Icons.star} size={18} />} delay={1} />
        <MetricCard label="Attendance" value={`${attendancePercentage}%`} sub={`${attendanceStats.present} / ${attendanceStats.total} days`} grad={t.grad2} icon={<Icon d={Icons.calendar} size={18} />} delay={2} />
        <MetricCard label="Subjects" value={subjectWiseMarks.length} sub="Active courses" grad={t.grad3} icon={<Icon d={Icons.book} size={18} />} delay={3} />
        <MetricCard label="Status" value={marksSummary?.result || 'N/A'} sub="Academic standing" grad={t.grad4} icon={<Icon d={Icons.trend} size={18} />} delay={4} />
      </div>

      {subjectWiseMarks.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <GlassCard className="anim-fadeup stagger-3" style={{ padding: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 18 }}><GradBadge grad={t.grad1}>Subject Performance</GradBadge></p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Total" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => (<Cell key={i} fill={_.total >= 80 ? t.cyan : _.total >= 60 ? t.violet : t.rose} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            <GlassCard className="anim-fadeup stagger-4" style={{ padding: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 18 }}><GradBadge grad={t.grad2}>Grade Distribution</GradBadge></p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={[
                    { name: 'A+ (90-100)', value: subjectWiseMarks.filter(s => s.total >= 90).length, color: t.green },
                    { name: 'A  (80-89)', value: subjectWiseMarks.filter(s => s.total >= 80 && s.total < 90).length, color: t.cyan },
                    { name: 'B  (70-79)', value: subjectWiseMarks.filter(s => s.total >= 70 && s.total < 80).length, color: t.violet },
                    { name: 'C  (60-69)', value: subjectWiseMarks.filter(s => s.total >= 60 && s.total < 70).length, color: t.amber },
                    { name: 'F  (<60)', value: subjectWiseMarks.filter(s => s.total < 60).length, color: t.rose },
                  ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {subjectWiseMarks.map((_, i) => (<Cell key={i} fill={[t.green, t.cyan, t.violet, t.amber, t.rose][i % 5]} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: t.textMuted }} />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
          <GlassCard className="anim-fadeup stagger-5" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 16 }}>Quick Actions</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[{ to: '/student/marks', label: 'View Marks', grad: t.grad1 }, { to: '/student/attendance', label: 'Attendance', grad: t.grad2 }, { to: '/student/reports', label: 'Reports', grad: t.grad3 }, { to: '/student/profile', label: 'Edit Profile', grad: t.grad4 }].map(({ to, label, grad }) => (
                <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', borderRadius: 12, background: grad, color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none', textAlign: 'center' }} className="btn-primary">{label}</Link>
              ))}
            </div>
          </GlassCard>
        </>
      ) : (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📚</p>
          <p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Academic Data Yet</p>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 8 }}>Your marks and performance will appear here once added by your teacher.</p>
        </GlassCard>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// VIEW MARKS - WITH REAL API DATA
// ─────────────────────────────────────────────
const ViewMarks = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMarks(); }, []);

  const fetchMarks = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = userData._id || userData.id;
      if (!studentId) { setLoading(false); return; }
      const res = await api.get(`/marks/student/${studentId}`);
      const marks = res.data || [];
      const subjectsMap = new Map();
      marks.forEach(mark => {
        if (!subjectsMap.has(mark.subject)) subjectsMap.set(mark.subject, { subject: mark.subject, firstTest: 0, midExam: 0, notebook: 0, finalExam: 0 });
        const s = subjectsMap.get(mark.subject);
        if (mark.examType === 'quiz') s.firstTest = mark.score;
        else if (mark.examType === 'midterm') s.midExam = mark.score;
        else if (mark.examType === 'assignment') s.notebook = mark.score;
        else if (mark.examType === 'final') s.finalExam = mark.score;
      });
      setMarksData(Array.from(subjectsMap.values()).map(s => {
        const total = s.firstTest + s.midExam + s.notebook + s.finalExam;
        let result = total >= 50 ? 'Pass' : 'Fail', grade = 'F';
        if (total >= 90) grade = 'A+'; else if (total >= 80) grade = 'A'; else if (total >= 70) grade = 'B'; else if (total >= 60) grade = 'C'; else if (total >= 50) grade = 'D';
        return { ...s, total, result, grade };
      }));
    } catch (err) { toast.error('Failed to load marks'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  const avg = marksData.length > 0 ? (marksData.reduce((s, m) => s + m.total, 0) / marksData.length).toFixed(1) : 0;
  const cols = ['Subject', 'First Test /10', 'Mid Exam /20', 'Notebook /20', 'Final /50', 'Total /100', 'Grade', 'Result'];

  return (
    <div className="anim-fadeup">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 22, fontWeight: 800, color: t.text }}>Academic Marks</h2><p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>Full semester breakdown</p></div>
        <div style={{ textAlign: 'right' }}><p style={{ fontSize: 12, color: t.textMuted }}>Overall Average</p><p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }} className="mono"><GradBadge grad={t.grad1}>{avg}%</GradBadge></p></div>
      </div>
      {marksData.length === 0 ? (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}><p style={{ fontSize: 48, marginBottom: 16 }}>📊</p><p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Marks Available</p></GlassCard>
      ) : (
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: t.grad1 }}>{cols.map(c => <th key={c} style={{ padding: '14px 16px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', whiteSpace: 'nowrap' }}>{c}</th>)}</tr></thead>
              <tbody>
                {marksData.map((m, i) => (
                  <tr key={i} className="table-row" style={{ borderBottom: `1px solid ${t.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: t.text, fontSize: 13 }}>{m.subject}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub, fontSize: 13 }} className="mono">{m.firstTest}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub, fontSize: 13 }} className="mono">{m.midExam}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub, fontSize: 13 }} className="mono">{m.notebook}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub, fontSize: 13 }} className="mono">{m.finalExam}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: 15 }} className="mono"><GradBadge grad={m.total >= 80 ? t.grad2 : m.total >= 60 ? t.grad1 : t.grad3}>{m.total}</GradBadge></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: m.total >= 80 ? 'rgba(6,229,200,0.12)' : m.total >= 60 ? 'rgba(124,92,252,0.12)' : 'rgba(247,82,106,0.12)', color: m.total >= 80 ? t.cyan : m.total >= 60 ? t.violet : t.rose, fontWeight: 800, fontSize: 13 }}>{m.grade}</span></td>
                    <td style={{ padding: '14px 16px' }}><StatusPill status={m.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// VIEW ATTENDANCE - WITH REAL API DATA
// ─────────────────────────────────────────────
const ViewAttendance = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = userData._id || userData.id;
      if (!studentId) { setLoading(false); return; }
      const res = await api.get(`/attendance/student/${studentId}`);
      setRecords(res.data || []);
    } catch (err) { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  const stats = { present: records.filter(r => r.status === 'present').length, absent: records.filter(r => r.status === 'absent').length, late: records.filter(r => r.status === 'late').length, total: records.length };
  const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 24 }}>Attendance Record</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <MetricCard label="Present" value={stats.present} sub="Days attended" grad={t.grad4} icon={<Icon d="M5 13l4 4L19 7" />} delay={1} />
        <MetricCard label="Absent" value={stats.absent} sub="Days missed" grad={t.grad3} icon={<Icon d={Icons.close} />} delay={2} />
        <MetricCard label="Late" value={stats.late} sub="Days late" grad="linear-gradient(135deg,#F5A623,#F97316)" icon={<Icon d="M12 8v4l3 3" />} delay={3} />
        <MetricCard label="Rate" value={`${pct}%`} sub="Attendance rate" grad={pct >= 75 ? t.grad2 : t.grad3} icon={<Icon d={Icons.trend} />} delay={4} />
      </div>
      {records.length === 0 ? (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}><p style={{ fontSize: 48, marginBottom: 16 }}>📅</p><p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Attendance Records</p></GlassCard>
      ) : (
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: t.grad1 }}>{['Date', 'Subject', 'Status'].map(h => <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '.04em' }}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="table-row" style={{ borderBottom: `1px solid ${t.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '13px 20px', color: t.textSub, fontSize: 13 }}>{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: t.text, fontSize: 13 }}>{r.subject || '-'}</td>
                    <td style={{ padding: '13px 20px' }}><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// REPORTS - FULL PERFORMANCE TREND DESIGN
// ─────────────────────────────────────────────
const StudentReports = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [marksData, setMarksData] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = userData._id || userData.id;
      if (!studentId) { setLoading(false); return; }

      try {
        const marksRes = await api.get(`/marks/student/${studentId}`);
        const marks = marksRes.data || [];
        const map = new Map();
        marks.forEach(m => {
          if (!map.has(m.subject)) map.set(m.subject, { subject: m.subject, firstTest: 0, midExam: 0, notebook: 0, finalExam: 0, total: 0 });
          const s = map.get(m.subject);
          if (m.examType === 'quiz') s.firstTest = m.score;
          else if (m.examType === 'midterm') s.midExam = m.score;
          else if (m.examType === 'assignment') s.notebook = m.score;
          else if (m.examType === 'final') s.finalExam = m.score;
          s.total = s.firstTest + s.midExam + s.notebook + s.finalExam;
        });
        setMarksData(Array.from(map.values()));
      } catch (err) { console.error('Marks error:', err); }

      try {
        const attRes = await api.get(`/attendance/student/${studentId}`);
        setAttendanceRecords(attRes.data || []);
      } catch (err) { console.error('Attendance error:', err); }

    } catch (error) { console.error('Error:', error); toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  const CustomTooltip = (props) => <ChartTooltip {...props} isDark={isDark} />;

  // Generate trend data from attendance records
  const getMonthlyPerformance = () => {
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    attendanceRecords.forEach(record => {
      const date = new Date(record.date);
      const month = months[date.getMonth()];
      if (!monthlyData[month]) monthlyData[month] = { attendance: 0, count: 0 };
      if (record.status === 'present') monthlyData[month].attendance += 100;
      else if (record.status === 'late') monthlyData[month].attendance += 50;
      monthlyData[month].count++;
    });

    const avgMark = marksData.length > 0 ? marksData.reduce((s, m) => s + m.total, 0) / marksData.length : 0;

    return months.slice(0, 6).map(month => ({
      month,
      marks: avgMark,
      attendance: monthlyData[month]?.count > 0 ? Math.round(monthlyData[month].attendance / monthlyData[month].count) : 0
    }));
  };

  const trendData = getMonthlyPerformance();

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 6 }}>Academic Reports</h2>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28 }}>Comprehensive performance analytics</p>

      {marksData.length === 0 ? (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📊</p>
          <p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Report Data Available</p>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 8 }}>Your reports will appear here once marks are added.</p>
        </GlassCard>
      ) : (
        <>
          {/* Performance Trend */}
          <GlassCard style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 20 }}>
              <GradBadge grad={t.grad1}>📈 Performance Trend</GradBadge>
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: t.textMuted }} />
                <Area type="monotone" dataKey="marks" fill="url(#marksGrad)" stroke="#7C5CFC" strokeWidth={2.5} name="Marks %" dot={{ fill: '#7C5CFC', r: 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="attendance" stroke={t.cyan} strokeWidth={2.5} name="Attendance %" dot={{ fill: t.cyan, r: 4, strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Subject Breakdown */}
          <GlassCard style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 20 }}>
              <GradBadge grad={t.grad2}>📊 Subject Breakdown</GradBadge>
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={marksData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: t.textMuted }} />
                <Bar dataKey="firstTest" fill={t.violet} name="First Test" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="midExam" fill={t.blue} name="Mid Exam" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="notebook" fill={t.amber} name="Notebook" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="finalExam" fill={t.cyan} name="Final" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Proficiency Radar */}
          <GlassCard style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 20 }}>
              <GradBadge grad={t.grad3}>🎯 Proficiency Radar</GradBadge>
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={marksData}>
                <PolarGrid stroke={t.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: t.textMuted, fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: 9 }} />
                <Radar name="Score" dataKey="total" stroke={t.violet} fill={t.violet} fillOpacity={0.25} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// EDIT PROFILE - WITH REAL API
// ─────────────────────────────────────────────
const EditProfile = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{"name":"","email":""}'));
  const [form, setForm] = useState({
    name: user.name || '', email: user.email || '', phone: user.phone || '',
    address: user.address || '', parentName: user.parentName || '', parentPhone: user.parentPhone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = user._id || user.id;
      await api.put(`/users/${userId}`, form);
      const updated = { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const Field = ({ label, name, type = 'text' }) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</label>
      {editing ? (
        <input type={type} name={name} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)', border: `1px solid ${t.border}`, color: t.text, fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif' }} />
      ) : (
        <p style={{ fontSize: 14, fontWeight: 600, color: t.text, padding: '10px 0' }}>{form[name] || <span style={{ color: t.textMuted, fontStyle: 'italic' }}>Not set</span>}</p>
      )}
    </div>
  );

  return (
    <div className="anim-fadeup">
      <div style={{ background: t.grad1, borderRadius: 20, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Profile</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Manage your personal information</p>
      </div>
      <GlassCard style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: t.text }}>Personal Information</p>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{ padding: '8px 18px', borderRadius: 10, background: t.grad1, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }} className="btn-primary">Edit Profile</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: t.textSub, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }} className="btn-primary">Cancel</button>
              <button onClick={handleSave} disabled={loading} style={{ padding: '8px 16px', borderRadius: 10, background: t.grad1, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Field label="Full Name" name="name" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Parent Name" name="parentName" />
          <Field label="Parent Phone" name="parentPhone" type="tel" />
          <Field label="Address" name="address" />
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// NEWS FEED
// ─────────────────────────────────────────────
const NewsFeedPage = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get('/news');
      let newsData = [];
      if (Array.isArray(res.data)) newsData = res.data;
      else if (res.data?.news && Array.isArray(res.data.news)) newsData = res.data.news;
      else if (res.data?.data && Array.isArray(res.data.data)) newsData = res.data.data;
      setNews(newsData);
    } catch (err) { console.error('News error:', err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 24 }}>News Feed</h2>
      {news.length === 0 ? (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📰</p>
          <p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No News Available</p>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 8 }}>News and announcements will appear here.</p>
        </GlassCard>
      ) : (
        news.map((n, i) => (
          <GlassCard key={n._id || n.id || i} hover style={{ padding: '20px 24px', marginBottom: 14 }} className={`anim-fadeup stagger-${(i % 5) + 1}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.cyan, letterSpacing: '.08em', background: 'rgba(6,229,200,0.1)', padding: '3px 8px', borderRadius: 99, marginBottom: 8, display: 'inline-block' }}>{n.tag || n.category || 'NEWS'}</span>
                <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginTop: 6 }}>{n.title}</p>
                <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{n.content || n.description || ''}</p>
                <p style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>{new Date(n.createdAt || n.date || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOT DASHBOARD
// ─────────────────────────────────────────────
const StudentDashboard = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [classData, setClassData] = useState(null);

  const toggle = () => setIsDark(d => { localStorage.setItem('theme', !d ? 'dark' : 'light'); return !d; });
  const toggleCollapse = () => setSidebarCollapsed(prev => { localStorage.setItem('sidebarCollapsed', !prev); return !prev; });
  const t = tokens(isDark);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) { setLoading(false); return; }
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      const studentId = parsedUser._id || parsedUser.id;
      if (!studentId) { setLoading(false); return; }

      const studentRes = await api.get(`/students/${studentId}`);
      if (studentRes.data) {
        setStudentData(studentRes.data);
        let classId = typeof studentRes.data.classId === 'object' ? studentRes.data.classId?._id : studentRes.data.classId || studentRes.data.class;
        if (classId && typeof classId === 'string') {
          try { const classRes = await api.get(`/classes/${classId}`); if (classRes.data) setClassData(classRes.data); } catch (err) {}
        } else if (classId && typeof classId === 'object') {
          setClassData(classId);
        }
      }
    } catch (error) { console.error('Initial fetch error:', error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <ThemeContext.Provider value={{ isDark, toggle }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: t.bg, gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: t.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24 }} className="anim-float">E</div>
          <Spinner color={t.violet} />
          <p style={{ fontSize: 13, color: t.textMuted }}>Loading your dashboard…</p>
        </div>
      </ThemeContext.Provider>
    );
  }

  if (!user) {
    return (
      <ThemeContext.Provider value={{ isDark, toggle }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: t.bg, gap: 16 }}>
          <p style={{ fontSize: 18, color: t.text }}>Please login to continue</p>
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <GlobalStyles />
      <div style={{ display: 'flex', height: '100vh', background: t.bg, overflow: 'hidden' }}>
        <Sidebar user={user} classData={classData} studentData={studentData} open={false} onClose={() => {}} collapsed={sidebarCollapsed} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', marginLeft: sidebarCollapsed ? 72 : 260, transition: 'margin-left .3s cubic-bezier(.22,1,.36,1)' }}>
          <Header user={user} onMobileMenuClick={() => {}} onToggleCollapse={toggleCollapse} collapsed={sidebarCollapsed} />
          <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>
            <Routes>
              <Route path="/"            element={<StudentHome />} />
              <Route path="/marks"       element={<ViewMarks />} />
              <Route path="/attendance"  element={<ViewAttendance />} />
              <Route path="/reports"     element={<StudentReports />} />
              <Route path="/news"        element={<NewsFeedPage />} />
              <Route path="/profile"     element={<EditProfile />} />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default StudentDashboard;