// ParentDashboard.jsx
import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
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
      @keyframes slideInLeft { from { opacity: 0; transform: translateX(-100%); } to { opacity: 1; transform: translateX(0); } }
      @keyframes slideOutLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-100%); } }
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
      
      @media (max-width: 768px) {
        .hide-mobile { display: none; }
        .mobile-full { width: 100%; }
      }
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
  gender:    "M16.5 9.5a4 4 0 11-8 0 4 4 0 018 0zM12 13.5V18m0 0H9m3 0h3",
  program:   "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  grade:     "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  section:   "M4 6h16v2H4V6zm0 4h16v2H4v-2zm0 4h10v2H4v-2z",
  parent:    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  camera:    "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 9a4 4 0 100 8 4 4 0 000-8z",
  hash:      "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  children:  "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  x:         "M6 18L18 6M6 6l12 12",
};

// ─────────────────────────────────────────────
// PROFILE IMAGE COMPONENTS
// ─────────────────────────────────────────────
const PassportPhoto = ({ src, name, size = 120 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
  const imageSrc = src && typeof src === 'string' && src.length > 0 ? src : null;
  
  if (imageSrc && !imgError) {
    return (
      <img src={imageSrc} alt={name || 'Student'} 
        style={{ width: size, height: size * 1.33, borderRadius: 8, objectFit: 'cover',
          border: '3px solid #fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backgroundColor: '#f0f0f0' }}
        onError={() => setImgError(true)} />
    );
  }
  
  return (
    <div style={{ width: size, height: size * 1.33, borderRadius: 8, 
      background: 'linear-gradient(135deg, #7C5CFC, #4F8EF7)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', color: '#fff', 
      fontWeight: 700, fontSize: size * 0.4, border: '3px solid #fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      {initials}
    </div>
  );
};

const CircleAvatar = ({ src, name, size = 44 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
  const imageSrc = src && typeof src === 'string' && src.length > 0 ? src : null;
  
  if (imageSrc && !imgError) {
    return (
      <img src={imageSrc} alt={name || 'User'} 
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', backgroundColor: '#f0f0f0', flexShrink: 0 }}
        onError={() => setImgError(true)} />
    );
  }
  
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #7C5CFC, #4F8EF7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#fff',
      fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
      boxShadow: '0 4px 16px rgba(124,92,252,0.4)' }}>
      {initials}
    </div>
  );
};

// ─────────────────────────────────────────────
// REUSABLE PRIMITIVES
// ─────────────────────────────────────────────
const GlassCard = ({ children, style, className = '', hover = false }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  return (
    <div className={`glass-card ${hover ? 'card-hover' : ''} ${className}`} 
      style={{ background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 20, ...style }}>
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
    'A+': ['#22D5A6', 'rgba(34,213,166,0.12)'],
    A: ['#06E5C8', 'rgba(6,229,200,0.12)'],
    B: ['#7C5CFC', 'rgba(124,92,252,0.12)'],
    C: ['#F5A623', 'rgba(245,166,35,0.12)'],
    D: ['#F5A623', 'rgba(245,166,35,0.12)'],
    F: ['#F7526A', 'rgba(247,82,106,0.12)'],
  };
  const [color, bg] = map[status] || ['#94A3B8', 'rgba(148,163,184,0.1)'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: '.04em', color, background: bg, border: `1px solid ${color}30`, textTransform: 'uppercase' }}>
      {status}
    </span>
  );
};

const Spinner = ({ color = '#7C5CFC' }) => (
  <div style={{ width: 36, height: 36, border: `3px solid ${color}20`, borderTop: `3px solid ${color}`, borderRadius: '50%' }} className="anim-spin" />
);

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

const ChartTooltip = ({ active, payload, label, isDark }) => {
  const t = tokens(isDark);
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.glassBorder}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>{p.name}: <span className="mono">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span></p>)}
    </div>
  );
};

// ─────────────────────────────────────────────
// SIDEBAR (with Hamburger for mobile)
// ─────────────────────────────────────────────
const navItems = [
  { path: '/parent', label: 'Dashboard', icon: Icons.dashboard },
  { path: '/parent/marks', label: 'My Marks', icon: Icons.marks },
  { path: '/parent/attendance', label: 'Attendance', icon: Icons.calendar },
  { path: '/parent/reports', label: 'Reports', icon: Icons.report },
  { path: '/parent/profile', label: 'Profile', icon: Icons.profile },
];

const Sidebar = ({ user, studentDetails, open, onClose, collapsed, onToggleCollapse }) => {
  const { isDark, toggle } = useContext(ThemeContext);
  const t = tokens(isDark);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isActive = (p) => {
    if (p === '/parent') return location.pathname === '/parent';
    return location.pathname.startsWith(p);
  };
  
  const sidebarWidth = (!isMobile && !collapsed) ? 260 : (isMobile ? 280 : 72);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Mobile sidebar with overlay
  if (isMobile) {
    return (
      <>
        {open && (
          <div onClick={onClose} style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
            zIndex: 999, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.3s ease' 
          }} />
        )}
        <aside style={{ 
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, 
          background: t.sidebar, borderRight: `1px solid ${t.border}`, 
          display: 'flex', flexDirection: 'column', zIndex: 1000,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          overflowY: 'auto'
        }}>
          {/* Logo & Close */}
          <div style={{ padding: '20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: t.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>P</div>
              <div><p style={{ fontWeight: 800, fontSize: 16, color: t.text }}>Parent Portal</p><p style={{ fontSize: 11, color: t.textMuted }}>Track your children</p></div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: t.glass, border: `1px solid ${t.glassBorder}`, cursor: 'pointer' }}>
              <Icon d={Icons.x} size={18} />
            </button>
          </div>
          
          {/* Parent Info */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CircleAvatar src={user?.profileImage} name={user?.name} size={44} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{user?.name || 'Parent'}</p>
                  <p style={{ fontSize: 11, color: t.textMuted }}>Parent</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav style={{ flex: 1, padding: '0 12px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: '.1em', textTransform: 'uppercase', padding: '6px 12px 10px' }}>Navigation</p>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={onClose} className="nav-link"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, marginBottom: 2, textDecoration: 'none',
                    background: active ? t.grad1 : 'transparent', color: active ? '#fff' : t.textSub, fontWeight: active ? 600 : 500, fontSize: 14 }}>
                  <Icon d={item.icon} size={17} /> {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* Theme Toggle & Logout */}
          <div style={{ padding: '12px', borderTop: `1px solid ${t.border}` }}>
            <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', borderRadius: 12, background: t.glass, border: `1px solid ${t.glassBorder}`, color: t.textSub, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 6 }}>
              <Icon d={isDark ? Icons.sun : Icons.moon} size={17} /> {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', borderRadius: 12, background: 'transparent', border: 'none', color: t.danger, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <Icon d={Icons.logout} size={17} /> Logout
            </button>
          </div>
        </aside>
      </>
    );
  }
  
  // Desktop sidebar
  return (
    <aside style={{ 
      position: 'fixed', top: 0, left: 0, bottom: 0, width: sidebarWidth, background: t.sidebar,
      borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', zIndex: 50,
      transition: 'width .3s cubic-bezier(.22,1,.36,1)', overflowY: 'auto', overflowX: 'hidden' 
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 12px' : '28px 24px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: t.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>P</div>
        {!collapsed && <div style={{ marginLeft: 12 }}><p style={{ fontWeight: 800, fontSize: 16, color: t.text }}>Parent Portal</p><p style={{ fontSize: 11, color: t.textMuted }}>Track your children</p></div>}
      </div>
      
      {/* Parent Info */}
      {!collapsed && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CircleAvatar src={user?.profileImage} name={user?.name} size={44} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{user?.name || 'Parent'}</p>
                <p style={{ fontSize: 11, color: t.textMuted }}>Parent</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav style={{ flex: 1, padding: collapsed ? '8px 8px' : '0 12px' }}>
        {!collapsed && <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: '.1em', textTransform: 'uppercase', padding: '6px 12px 10px' }}>Navigation</p>}
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} className="nav-link" title={collapsed ? item.label : ''}
              style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12, justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px' : '10px 14px', borderRadius: 12, marginBottom: 2, textDecoration: 'none',
                background: active ? t.grad1 : 'transparent', color: active ? '#fff' : t.textSub,
                fontWeight: active ? 600 : 500, fontSize: 14 }}>
              <Icon d={item.icon} size={collapsed ? 20 : 17} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
      
      {/* Theme Toggle and Logout */}
      <div style={{ padding: collapsed ? '8px' : '12px', borderTop: `1px solid ${t.border}` }}>
        <button onClick={toggle} title={isDark ? 'Light Mode' : 'Dark Mode'}
          style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%', padding: collapsed ? '10px' : '10px 14px', borderRadius: 12, background: t.glass, border: `1px solid ${t.glassBorder}`, color: t.textSub, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 6 }}>
          <Icon d={isDark ? Icons.sun : Icons.moon} size={collapsed ? 18 : 17} />
          {!collapsed && <>{isDark ? 'Light Mode' : 'Dark Mode'}</>}
        </button>
        
        {!collapsed && (
          <button onClick={handleLogout} className="nav-link"
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px',
              borderRadius: 12, background: 'transparent', border: 'none', color: t.danger,
              fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Icon d={Icons.logout} size={17} /> Logout
          </button>
        )}
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────
// HEADER (with Hamburger)
// ─────────────────────────────────────────────
const Header = ({ user, studentDetails, onMobileMenuClick, onToggleCollapse, collapsed }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [showDrop, setShowDrop] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const pageName = navItems.find(n => {
    if (n.path === '/parent') return location.pathname === '/parent';
    return location.pathname.startsWith(n.path);
  })?.label || 'Dashboard';
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: isDark ? 'rgba(8,12,20,0.85)' : 'rgba(240,244,255,0.85)',
      backdropFilter: 'blur(20px)', borderBottom: `1px solid ${t.border}`, padding: '0 20px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {isMobile ? (
          <button onClick={onMobileMenuClick} className="btn-primary"
            style={{ width: 38, height: 38, borderRadius: 10, background: t.glass, border: `1px solid ${t.glassBorder}`,
              color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon d={Icons.menu} size={18} />
          </button>
        ) : (
          <button onClick={onToggleCollapse} className="btn-primary"
            style={{ width: 38, height: 38, borderRadius: 10, background: t.glass, border: `1px solid ${t.glassBorder}`,
              color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon d={collapsed ? Icons.expand : Icons.collapse} size={18} />
          </button>
        )}
        <div><p style={{ fontWeight: 800, fontSize: 18, color: t.text }}>{pageName}</p><p style={{ fontSize: 11, color: t.textMuted, display: isMobile ? 'none' : 'block' }}>{today}</p></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowDrop(!showDrop)} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 12, padding: '4px 10px', cursor: 'pointer' }}>
            <CircleAvatar src={user?.profileImage} name={user?.name} size={32} />
            <span style={{ fontSize: 13, fontWeight: 600, color: t.text, display: isMobile ? 'none' : 'inline' }}>{user?.name?.split(' ')[0] || 'Parent'}</span>
          </button>
          {showDrop && (
            <>
              <div onClick={() => setShowDrop(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div className="anim-fadeup" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 220, borderRadius: 16, zIndex: 50, background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: `1px solid ${t.border}` }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{user?.name}</p>
                  <p style={{ fontSize: 12, color: t.textMuted }}>{user?.email}</p>
                </div>
                <div style={{ padding: '8px' }}>
                  <Link to="/parent/profile" onClick={() => setShowDrop(false)} className="nav-link"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: t.textSub, fontSize: 13 }}>My Profile</Link>
                  <button onClick={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }} 
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, background: 'none', border: 'none', color: t.danger, fontSize: 13, cursor: 'pointer' }}>Logout</button>
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
// STUDENT DETAILS MODAL
// ─────────────────────────────────────────────
const StudentDetailModal = ({ student, onClose, isDark }) => {
  const t = tokens(isDark);
  
  const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: t.textMuted }}>{label}</span>
      <span style={{ fontSize: 14, color: t.text }}>{value || '—'}</span>
    </div>
  );
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.surface, borderRadius: 20, maxWidth: 500, width: '100%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: 0 }}>Student Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: t.textMuted, padding: '0 8px' }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <PassportPhoto src={student?.profileImage} name={student?.name} size={100} />
          </div>
          <DetailRow label="Full Name" value={student?.name} />
          <DetailRow label="Roll Number" value={student?.rollNumber} />
          <DetailRow label="Gender" value={student?.sex} />
          <DetailRow label="Program" value={student?.programs} />
          <DetailRow label="Grade" value={student?.grade} />
          <DetailRow label="Section" value={student?.section} />
          <DetailRow label="Email" value={student?.email} />
          <DetailRow label="Phone" value={student?.phone} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// VIEW MARKS PAGE
// ─────────────────────────────────────────────
const ViewMarks = ({ selectedStudentId, studentName }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedStudentId) fetchMarks();
  }, [selectedStudentId]);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/marks/student/${selectedStudentId}`);
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><Spinner /></div>;

  const avg = marksData.length > 0 ? (marksData.reduce((s, m) => s + m.total, 0) / marksData.length).toFixed(1) : 0;
  const cols = ['Subject', 'First Test /10', 'Mid Exam /20', 'Notebook /20', 'Final /50', 'Total /100', 'Grade', 'Result'];

  return (
    <div className="anim-fadeup">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div><h2 style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{studentName}'s Marks</h2></div>
        <div style={{ textAlign: 'right' }}><p style={{ fontSize: 12, color: t.textMuted }}>Average</p><p style={{ fontSize: 32, fontWeight: 800 }} className="mono"><GradBadge grad={t.grad1}>{avg}%</GradBadge></p></div>
      </div>
      {marksData.length === 0 ? (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}><p style={{ fontSize: 48 }}>📊</p><p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Marks Available</p></GlassCard>
      ) : (
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: t.grad1 }}>{cols.map(c => <th key={c} style={{ padding: '14px 16px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 700 }}>{c}</th>)}</tr></thead>
              <tbody>
                {marksData.map((m, i) => (
                  <tr key={i} className="table-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: t.text }}>{m.subject}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub }} className="mono">{m.firstTest}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub }} className="mono">{m.midExam}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub }} className="mono">{m.notebook}</td>
                    <td style={{ padding: '14px 16px', color: t.textSub }} className="mono">{m.finalExam}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: 15 }} className="mono"><GradBadge grad={t.grad1}>{m.total}</GradBadge></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(124,92,252,0.12)', color: t.violet, fontWeight: 800 }}>{m.grade}</span></td>
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
// VIEW ATTENDANCE PAGE
// ─────────────────────────────────────────────
const ViewAttendance = ({ selectedStudentId, studentName }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedStudentId) fetchAttendance();
  }, [selectedStudentId]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/student/${selectedStudentId}`);
      setRecords(res.data || []);
    } catch (err) { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><Spinner /></div>;

  const stats = { present: records.filter(r => r.status === 'present').length, absent: records.filter(r => r.status === 'absent').length, late: records.filter(r => r.status === 'late').length, total: records.length };
  const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 8 }}>{studentName}'s Attendance</h2>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 24 }}>Daily attendance record</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <MetricCard label="Present" value={stats.present} sub="Days attended" grad={t.grad4} icon={<Icon d="M5 13l4 4L19 7" />} delay={1} />
        <MetricCard label="Absent" value={stats.absent} sub="Days missed" grad={t.grad3} icon={<Icon d={Icons.close} />} delay={2} />
        <MetricCard label="Rate" value={`${pct}%`} sub="Attendance rate" grad={t.grad2} icon={<Icon d={Icons.trend} />} delay={3} />
      </div>
      {records.length === 0 ? (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}><p style={{ fontSize: 48 }}>📅</p><p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Attendance Records</p></GlassCard>
      ) : (
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: t.grad1 }}>{['Date', 'Subject', 'Status'].map(h => <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 700 }}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="table-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '13px 20px', color: t.textSub }}>{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: t.text }}>{r.subject || '-'}</td>
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
// REPORTS PAGE
// ─────────────────────────────────────────────
const Reports = ({ selectedStudentId, studentName }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [marksData, setMarksData] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedStudentId) fetchData();
  }, [selectedStudentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      try {
        const marksRes = await api.get(`/marks/student/${selectedStudentId}`);
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
        const attRes = await api.get(`/attendance/student/${selectedStudentId}`);
        setAttendanceRecords(attRes.data || []);
      } catch (err) { console.error('Attendance error:', err); }

    } catch (error) { console.error('Error:', error); toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  const CustomTooltip = (props) => <ChartTooltip {...props} isDark={isDark} />;

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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><Spinner /></div>;

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 6 }}>{studentName}'s Reports</h2>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28 }}>Comprehensive performance analytics</p>

      {marksData.length === 0 ? (
        <GlassCard style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📊</p>
          <p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Report Data Available</p>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 8 }}>Reports will appear here once marks are added.</p>
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
// EDIT PROFILE PAGE
// ─────────────────────────────────────────────
const EditProfile = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{"name":"","email":""}'));
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '' });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profileImage || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setProfileImage(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = user._id || user.id;
      const formData = new FormData();
      Object.keys(form).forEach(key => { if (form[key]) formData.append(key, form[key]); });
      if (profileImage) formData.append('profileImage', profileImage);
      const res = await api.put(`/users/${userId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = { ...user, ...form, profileImage: res.data.profileImage || previewUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <div className="anim-fadeup">
      <div style={{ background: t.grad1, borderRadius: 20, padding: '28px 32px', marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>My Profile</h2>
      </div>
      <GlassCard style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: t.text }}>Personal Information</p>
          {!editing ? <button onClick={() => setEditing(true)} className="btn-primary" style={{ padding: '8px 18px', borderRadius: 10, background: t.grad1, color: '#fff' }}>Edit Profile</button> :
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(false)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 10, background: t.glass, color: t.textSub }}>Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 10, background: t.grad1, color: '#fff' }}>{loading ? 'Saving...' : 'Save'}</button>
            </div>}
        </div>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <CircleAvatar src={previewUrl || user.profileImage} name={user.name} size={96} />
          {editing && <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 10, background: t.grad2, color: '#fff', fontSize: 12 }}>Upload Photo</button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {['name', 'email', 'phone', 'address'].map(field => (
            <div key={field}><label style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>{field}</label>
              {editing ? <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: t.glass, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, marginTop: 6 }} /> :
                <p style={{ fontSize: 14, fontWeight: 600, color: t.text, padding: '10px 0', marginTop: 6 }}>{form[field] || 'Not set'}</p>}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// HOME DASHBOARD
// ─────────────────────────────────────────────
const HomeDashboard = ({ selectedStudent, studentDetails, marksSummary, subjectWiseMarks, studentAttendance, marksLoading, attendanceLoading, onViewDetails }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const attendancePercentage = studentAttendance?.total > 0 ? Math.round((studentAttendance.present / studentAttendance.total) * 100) : 0;
  const chartData = subjectWiseMarks.map(s => ({ name: s.subject.slice(0, isMobile ? 4 : 8), total: s.total }));

  return (
    <div>
      {/* Welcome Banner */}
      {/* Welcome Banner - FIXED VERSION */}
<div className="anim-fadeup" style={{ background: t.grad1, borderRadius: 20, padding: isMobile ? '20px' : '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
  <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
    <PassportPhoto src={selectedStudent?.profileImage} name={selectedStudent?.name} size={isMobile ? 80 : 100} />
    <div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 6 }}>Currently viewing</p>
      <h2 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{selectedStudent?.name}'s Performance</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 99, color: '#fff' }}>Roll: {selectedStudent?.rollNumber || 'N/A'}</span>
        <span style={{ fontSize: 11, padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 99, color: '#fff' }}>Grade: {selectedStudent?.grade || 'N/A'} • Sec: {selectedStudent?.section || 'A'}</span>
        <span style={{ fontSize: 11, padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 99, color: '#fff' }}>{selectedStudent?.programs || 'General'} Program</span>
      </div>
    </div>
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('View Details button clicked');
        onViewDetails();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      type="button"
      style={{ 
        marginLeft: 'auto', 
        padding: '10px 20px', 
        borderRadius: 10, 
        background: 'rgba(255,255,255,0.2)', 
        border: '1px solid rgba(255,255,255,0.3)', 
        color: '#fff', 
        cursor: 'pointer', 
        fontSize: 13, 
        fontWeight: 600,
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 10
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
    >
      View Details →
    </button>
  </div>
</div>
      
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <MetricCard label="Overall Average" value={`${marksSummary?.percentage || 0}%`} sub={`Grade ${marksSummary?.grade || 'N/A'}`} grad={t.grad1} icon={<Icon d={Icons.star} size={18} />} delay={1} />
        <MetricCard label="Attendance" value={`${attendancePercentage}%`} sub={`${studentAttendance?.present || 0} / ${studentAttendance?.total || 0} days`} grad={t.grad2} icon={<Icon d={Icons.calendar} size={18} />} delay={2} />
        <MetricCard label="Subjects" value={subjectWiseMarks.length} sub="Active courses" grad={t.grad3} icon={<Icon d={Icons.book} size={18} />} delay={3} />
        <MetricCard label="Status" value={marksSummary?.result || 'N/A'} sub="Academic standing" grad={t.grad4} icon={<Icon d={Icons.trend} size={18} />} delay={4} />
      </div>
      
      {/* Charts */}
      {!marksLoading && subjectWiseMarks.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <GlassCard className="anim-fadeup stagger-3" style={{ padding: isMobile ? 16 : 24 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 18 }}>Subject Performance</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={isMobile ? 20 : 30}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Bar dataKey="total" name="Total" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (<Cell key={i} fill={_.total >= 80 ? t.cyan : _.total >= 60 ? t.violet : t.rose} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
          
          <GlassCard className="anim-fadeup stagger-4" style={{ padding: isMobile ? 16 : 24 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 18 }}>Grade Distribution</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={[
                  { name: 'A+', value: subjectWiseMarks.filter(s => s.total >= 90).length },
                  { name: 'A', value: subjectWiseMarks.filter(s => s.total >= 80 && s.total < 90).length },
                  { name: 'B', value: subjectWiseMarks.filter(s => s.total >= 70 && s.total < 80).length },
                  { name: 'C', value: subjectWiseMarks.filter(s => s.total >= 60 && s.total < 70).length },
                  { name: 'F', value: subjectWiseMarks.filter(s => s.total < 60).length },
                ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={isMobile ? 40 : 60} outerRadius={isMobile ? 70 : 90} paddingAngle={4} dataKey="value">
                  {subjectWiseMarks.map((_, i) => (<Cell key={i} fill={[t.green, t.cyan, t.violet, t.amber, t.rose][i % 5]} />))}
                </Pie>
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 9 : 11, color: t.textMuted }} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      ) : !marksLoading && (
        <GlassCard style={{ padding: 48, textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📚</p>
          <p style={{ fontWeight: 700, fontSize: 18, color: t.text }}>No Academic Data Yet</p>
          <p style={{ fontSize: 13, color: t.textMuted }}>Marks will appear here once added by the teacher.</p>
        </GlassCard>
      )}
      
      {/* Attendance Section */}
      {!attendanceLoading && studentAttendance && studentAttendance.total > 0 && (
        <GlassCard style={{ padding: isMobile ? 20 : 24 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 16 }}>📋 Attendance Summary</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(34,213,166,0.1)', borderRadius: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: t.success }}>{studentAttendance.present}</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>Present Days</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(247,82,106,0.1)', borderRadius: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: t.danger }}>{studentAttendance.absent}</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>Absent Days</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(124,92,252,0.1)', borderRadius: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: t.violet }}>{attendancePercentage}%</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>Attendance Rate</div>
            </div>
          </div>
          {attendancePercentage < 75 && (
            <div style={{ padding: 12, background: 'rgba(245,166,35,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <p style={{ fontSize: 12, color: t.text, flex: 1 }}>Attendance is below 75%. Regular attendance is crucial for academic success.</p>
            </div>
          )}
        </GlassCard>
      )}
      
      {/* Marks Table */}
      {!marksLoading && subjectWiseMarks.length > 0 && (
        <GlassCard style={{ overflow: 'hidden', marginTop: 24 }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}` }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: t.text }}>📊 Detailed Marks Breakdown</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: t.grad1 }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700 }}>Subject</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700 }}>First Test (10)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700 }}>Mid Exam (20)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700 }}>Notebook (20)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700 }}>Final Exam (50)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700 }}>Total (100)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700 }}>Grade</th>
              </tr></thead>
              <tbody>
                {subjectWiseMarks.map((subject, idx) => {
                  let grade = subject.total >= 90 ? 'A+' : subject.total >= 80 ? 'A' : subject.total >= 70 ? 'B' : subject.total >= 60 ? 'C' : subject.total >= 50 ? 'D' : 'F';
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${t.border}` }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: t.text }}>{subject.subject}</td>
                      <td style={{ padding: '12px 16px', color: t.textSub }} className="mono">{subject.firstTest || 0}</td>
                      <td style={{ padding: '12px 16px', color: t.textSub }} className="mono">{subject.midExam || 0}</td>
                      <td style={{ padding: '12px 16px', color: t.textSub }} className="mono">{subject.notebook || 0}</td>
                      <td style={{ padding: '12px 16px', color: t.textSub }} className="mono">{subject.finalExam || 0}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: t.text }} className="mono">{subject.total}</td>
                      <td style={{ padding: '12px 16px' }}><StatusPill status={grade} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN PARENT DASHBOARD
// ─────────────────────────────────────────────
const ParentDashboard = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedChildDetails, setSelectedChildDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [subjectWiseMarks, setSubjectWiseMarks] = useState([]);
  const [marksSummary, setMarksSummary] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [marksLoading, setMarksLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggle = () => {
    setIsDark(prev => {
      localStorage.setItem('theme', !prev ? 'dark' : 'light');
      return !prev;
    });
  };
  
  const toggleCollapse = () => {
    if (!isMobile) {
      setSidebarCollapsed(prev => {
        localStorage.setItem('sidebarCollapsed', !prev);
        return !prev;
      });
    }
  };
  
  const t = tokens(isDark);
  
  useEffect(() => {
    fetchParentAndChildren();
  }, []);
  
  useEffect(() => {
    if (selectedChild) {
      fetchStudentMarks(selectedChild._id);
      fetchStudentAttendance(selectedChild._id);
    }
  }, [selectedChild]);
  
  const fetchParentAndChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }
      
      const profileRes = await api.get('/users/me/profile');
      setParent(profileRes.data);
      
      const allStudentsRes = await api.get('/users/role/student');
      const allStudents = allStudentsRes.data || [];
      
      const parentId = profileRes.data._id;
      const myChildren = allStudents.filter(student => 
        student.parents && student.parents.includes(parentId)
      );
      
      setChildren(myChildren);
      if (myChildren.length > 0) {
        setSelectedChild(myChildren[0]);
        setSelectedChildDetails(myChildren[0]);
      }
      
    } catch (error) {
      console.error('Error fetching parent data:', error);
      toast.error('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentMarks = async (studentId) => {
    setMarksLoading(true);
    try {
      const response = await api.get(`/marks/student/${studentId}`);
      const marks = response.data || [];
      
      const subjectsMap = new Map();
      marks.forEach(mark => {
        if (!subjectsMap.has(mark.subject)) {
          subjectsMap.set(mark.subject, {
            subject: mark.subject,
            firstTest: 0,
            midExam: 0,
            notebook: 0,
            finalExam: 0,
            total: 0
          });
        }
        const subjectData = subjectsMap.get(mark.subject);
        if (mark.examType === 'quiz') subjectData.firstTest = mark.score;
        else if (mark.examType === 'midterm') subjectData.midExam = mark.score;
        else if (mark.examType === 'assignment') subjectData.notebook = mark.score;
        else if (mark.examType === 'final') subjectData.finalExam = mark.score;
        subjectData.total = subjectData.firstTest + subjectData.midExam + subjectData.notebook + subjectData.finalExam;
      });
      
      const subjectsData = Array.from(subjectsMap.values());
      setSubjectWiseMarks(subjectsData);
      
      let overallAverage = 0;
      let result = 'N/A';
      let grade = 'N/A';
      
      if (subjectsData.length > 0) {
        const totalMarksSum = subjectsData.reduce((sum, subject) => sum + subject.total, 0);
        overallAverage = totalMarksSum / subjectsData.length;
        result = overallAverage >= 50 ? 'Pass' : 'Fail';
        
        if (overallAverage >= 90) grade = 'A+';
        else if (overallAverage >= 80) grade = 'A';
        else if (overallAverage >= 70) grade = 'B';
        else if (overallAverage >= 60) grade = 'C';
        else if (overallAverage >= 50) grade = 'D';
        else grade = 'F';
      }
      
      setMarksSummary({ 
        total: subjectsData.reduce((sum, subject) => sum + subject.total, 0), 
        percentage: overallAverage.toFixed(2), 
        result, 
        grade 
      });
      
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast.error('Failed to load marks data');
    } finally {
      setMarksLoading(false);
    }
  };
  
  const fetchStudentAttendance = async (studentId) => {
    setAttendanceLoading(true);
    try {
      const response = await api.get(`/attendance/student/${studentId}`);
      const attendance = response.data || [];
      
      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const total = attendance.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      setStudentAttendance({ present, absent, total, percentage });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };
  
  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };
  
  if (loading) {
    return (
      <ThemeContext.Provider value={{ isDark, toggle }}>
        <GlobalStyles />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: t.bg }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${t.violet}20`, borderTop: `3px solid ${t.violet}`, borderRadius: '50%', marginBottom: 16, animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: t.textMuted, fontSize: 14 }}>Loading your children's information...</p>
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }
  
  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <GlobalStyles />
      <div style={{ display: 'flex', height: '100vh', background: t.bg, overflow: 'hidden' }}>
        <Sidebar 
          user={parent} 
          studentDetails={selectedChildDetails}
          open={mobileSidebarOpen} 
          onClose={() => setMobileSidebarOpen(false)} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          overflow: 'hidden',
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 72 : 260),
          transition: 'margin-left .3s'
        }}>
          <Header 
            user={parent} 
            studentDetails={selectedChildDetails}
            onMobileMenuClick={() => setMobileSidebarOpen(true)}
            onToggleCollapse={toggleCollapse}
            collapsed={sidebarCollapsed}
          />
          
          <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '28px 32px' }}>
            {children.length === 0 ? (
              <GlassCard style={{ textAlign: 'center', padding: 60 }}>
                <p style={{ fontSize: 64, marginBottom: 16 }}>👨‍👩‍👧</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 8 }}>No Children Linked</h3>
                <p style={{ color: t.textMuted, fontSize: 14 }}>Your account is not linked to any students yet. Please contact the school administrator.</p>
              </GlassCard>
            ) : (
              <>
                {/* Child Selector Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: 16, 
                  marginBottom: 24 
                }}>
                  {children.map((child) => (
                    <div 
                      key={child._id} 
                      className="card-hover"
                      style={{ 
                        background: selectedChild?._id === child._id ? t.grad1 : t.card,
                        borderRadius: 20,
                        padding: 16,
                        cursor: 'pointer',
                        border: selectedChild?._id === child._id ? 'none' : `1px solid ${t.border}`,
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        setSelectedChild(child);
                        setSelectedChildDetails(child);
                      }}
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <PassportPhoto src={child.profileImage} name={child.name} size={70} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: 16, 
                            fontWeight: 700, 
                            color: selectedChild?._id === child._id ? '#fff' : t.text,
                            marginBottom: 4
                          }}>
                            {child.name}
                          </h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                            {child.rollNumber && (
                              <span style={{ 
                                fontSize: 10, 
                                padding: '2px 8px', 
                                borderRadius: 99, 
                                background: selectedChild?._id === child._id ? 'rgba(255,255,255,0.2)' : t.glass,
                                color: selectedChild?._id === child._id ? '#fff' : t.textSub
                              }}>
                                Roll: {child.rollNumber}
                              </span>
                            )}
                            {child.grade && (
                              <span style={{ 
                                fontSize: 10, 
                                padding: '2px 8px', 
                                borderRadius: 99, 
                                background: selectedChild?._id === child._id ? 'rgba(255,255,255,0.2)' : t.glass,
                                color: selectedChild?._id === child._id ? '#fff' : t.textSub
                              }}>
                                Grade {child.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Routes for different pages */}
                <Routes>
                  <Route path="/" element={
                    <HomeDashboard 
                      selectedStudent={selectedChild}
                      studentDetails={selectedChildDetails}
                      marksSummary={marksSummary}
                      subjectWiseMarks={subjectWiseMarks}
                      studentAttendance={studentAttendance}
                      marksLoading={marksLoading}
                      attendanceLoading={attendanceLoading}
                      onViewDetails={handleViewDetails}
                    />
                  } />
                  <Route path="/marks" element={
                    <ViewMarks selectedStudentId={selectedChild?._id} studentName={selectedChild?.name} />
                  } />
                  <Route path="/attendance" element={
                    <ViewAttendance selectedStudentId={selectedChild?._id} studentName={selectedChild?.name} />
                  } />
                  <Route path="/reports" element={
                    <Reports selectedStudentId={selectedChild?._id} studentName={selectedChild?.name} />
                  } />
                  <Route path="/profile" element={<EditProfile />} />
                </Routes>
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedChildDetails && (
        <StudentDetailModal 
          student={selectedChildDetails} 
          onClose={() => setShowDetailsModal(false)} 
          isDark={isDark}
        />
      )}
    </ThemeContext.Provider>
  );
};

export default ParentDashboard;