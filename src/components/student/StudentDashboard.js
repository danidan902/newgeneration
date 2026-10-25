// StudentDashboard.jsx — Full Rewrite
// - Light mode (white) by default
// - Cloudinary image support with sanitization + fallback
// - Fully responsive via useWindowWidth hook

import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Label
} from 'recharts';
import StudentIDCard from './StudentIDdownload';
import StudentCertificate from './StudentCertficate';
import ChangePassword from './ChangePasswordStudent';
import StudentPayment from './StudentPayment';
import { Menu, X } from 'lucide-react';

// ─────────────────────────────────────────────
// IMAGE HELPERS
// ─────────────────────────────────────────────
const sanitizeImage = (url) => {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim().replace(/^["']|["']$/g, '');
  if (!u) return '';
  u = u.replace(/^http:\/\//i, 'https://');
  if (u.includes('res.cloudinary.com') && u.includes('/upload/')) {
    if (!/\/upload\/[^/]*(f_auto|q_auto)/.test(u)) {
      u = u.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }
  return u;
};

// ─────────────────────────────────────────────
// RESPONSIVE HOOK
// ─────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
};

// ─────────────────────────────────────────────
// ICONS (Lucide-style)
// ─────────────────────────────────────────────
const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  marks: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  attendance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  reports: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  news: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  idCard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  certificate: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  ),
  payment: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  sun: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

// ─────────────────────────────────────────────
// THEME CONTEXT
// ─────────────────────────────────────────────
const ThemeContext = createContext({ isDark: false, toggle: () => {} });

const tokens = (dark) => ({
  bg: dark ? '#0F1724' : '#FFFFFF',
  sidebar: dark ? '#1A2D3D' : '#244955',
  card: dark ? '#1E2D3D' : '#FFFFFF',
  cardBg: dark ? '#1A2D3D' : '#FFFFFF',
  text: dark ? '#EEF2FF' : '#1E293B',
  textSub: dark ? '#94A3CF' : '#475569',
  textMuted: dark ? '#4A5580' : '#94A3B8',
  border: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
  hover: dark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  active: '#D5E5EE',
  activeText: '#244955',
  primary: '#244955',
  success: '#22D5A6',
  danger: '#F7526A',
  warning: '#F5A623',
  cyan: '#06E5C8',
  violet: '#7C5CFC',
  blue: '#4F8EF7',
  amber: '#F5A623',
  rose: '#F7526A',
  green: '#22D5A6',
  grad1: 'linear-gradient(135deg, #244955, #3A6B7A)',
  grad2: 'linear-gradient(135deg, #06E5C8, #4F8EF7)',
  grad3: 'linear-gradient(135deg, #F5A623, #F7526A)',
  grad4: 'linear-gradient(135deg, #22D5A6, #06E5C8)',
});

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { height: 100%; font-family: 'Inter', -apple-system, sans-serif; background: #FFFFFF; color: #1E293B; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(36,73,85,0.4); border-radius: 4px; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      .anim-fadeup { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
      .anim-fadein { animation: fadeIn .3s ease both; }
      .anim-slidein { animation: slideIn .3s cubic-bezier(.22,1,.36,1) both; }
      .anim-spin { animation: spin 1s linear infinite; }
      .anim-float { animation: float 3s ease-in-out infinite; }
      .stagger-1 { animation-delay: .05s; }
      .stagger-2 { animation-delay: .10s; }
      .stagger-3 { animation-delay: .15s; }
      .stagger-4 { animation-delay: .20s; }
      .stagger-5 { animation-delay: .25s; }
      .stagger-6 { animation-delay: .30s; }
      .nav-link { transition: all .2s ease; }
      .nav-link:hover { transform: translateX(3px); }
      .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
      .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      .btn-primary { transition: all .2s ease; cursor: pointer; border: none; outline: none; }
      .btn-primary:hover { filter: brightness(1.05); }
      .btn-primary:active { transform: scale(0.98); }
      .table-row { transition: background .15s ease; }
      .table-row:hover { background: rgba(36,73,85,0.04); }
      .status-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: .02em; }
      .sidebar-curve-top { position: absolute; top: -16px; right: 0; width: 16px; height: 16px; background: #FFFFFF; }
      .sidebar-curve-top::before { content: ''; position: absolute; top: 0; right: 0; width: 16px; height: 16px; background: #244955; border-bottom-left-radius: 16px; }
      .sidebar-curve-bottom { position: absolute; bottom: -16px; right: 0; width: 16px; height: 16px; background: #FFFFFF; }
      .sidebar-curve-bottom::before { content: ''; position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; background: #244955; border-top-left-radius: 16px; }
      .table-container table { min-width: 600px; }
      .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      @media (max-width: 768px) {
        .sidebar-desktop { display: none; }
        .sidebar-mobile { display: flex; }
        .header-search { display: none; }
        .metrics-grid { grid-template-columns: 1fr 1fr !important; }
        .charts-grid { grid-template-columns: 1fr !important; }
        .profile-grid { grid-template-columns: 1fr !important; }
        .main-padding { padding: 16px !important; }
        .welcome-banner { padding: 20px !important; flex-direction: column !important; text-align: center; }
        .student-info-grid { grid-template-columns: 1fr !important; }
        .quick-actions-grid { grid-template-columns: 1fr 1fr !important; }
        .table-container th, .table-container td { padding: 8px 10px !important; }
        .student-details-card { flex-direction: column !important; align-items: center !important; text-align: center; }
        button, .btn-primary, .nav-link { min-height: 40px; }
        input, select, textarea { font-size: 16px !important; }
      }
      @media (max-width: 480px) {
        .metrics-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
        .quick-actions-grid { grid-template-columns: 1fr !important; }
        .header-user-name { display: none; }
        .student-name { font-size: 16px !important; }
        .page-title { font-size: 16px !important; }
        .main-padding { padding: 12px !important; }
        .metric-card { padding: 14px 16px !important; }
        .metric-value { font-size: 22px !important; }
        .welcome-banner h2 { font-size: 18px !important; }
        .action-buttons { flex-direction: column; width: 100%; }
        .action-buttons button { width: 100%; }
        .modal-box { width: calc(100vw - 24px) !important; max-height: 88vh !important; padding: 16px !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

// ─────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────
const Spinner = ({ color = '#244955' }) => (
  <div style={{ width: 36, height: 36, border: `3px solid ${color}20`, borderTop: `3px solid ${color}`, borderRadius: '50%' }} className="anim-spin" />
);

const PassportPhoto = ({ src, name, size = 80 }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [src]);

  const initials = name
    ? name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const imageSrc = sanitizeImage(src);

  if (imageSrc && !imgError) {
    return (
      <img
        src={imageSrc}
        alt={name || 'Student'}
        style={{
          width: size, height: size, borderRadius: 12, objectFit: 'cover',
          border: '3px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: 'linear-gradient(135deg, #244955, #3A6B7A)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.4,
      border: '3px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      {initials}
    </div>
  );
};

const CircleAvatar = ({ src, name, size = 40 }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [src]);

  const initials = name
    ? name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const imageSrc = sanitizeImage(src);

  if (imageSrc && !imgError) {
    return (
      <img
        src={imageSrc}
        alt={name || 'User'}
        style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0,
        }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #244955, #3A6B7A)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    Pass: ['#22D5A6', 'rgba(34,213,166,0.12)'],
    Fail: ['#F7526A', 'rgba(247,82,106,0.12)'],
    present: ['#22D5A6', 'rgba(34,213,166,0.10)'],
    absent: ['#F7526A', 'rgba(247,82,106,0.10)'],
    late: ['#F5A623', 'rgba(245,166,35,0.10)'],
    Delivered: ['#22D5A6', 'rgba(34,213,166,0.12)'],
    Cancelled: ['#F7526A', 'rgba(247,82,106,0.12)'],
  };
  const [color, bg] = map[status] || ['#94A3B8', 'rgba(148,163,184,0.1)'];
  return (
    <span className="status-pill" style={{ color, background: bg, border: `1px solid ${color}30` }}>
      {status}
    </span>
  );
};

const MetricCard = ({ label, value, sub, icon, delay = 0 }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const width = useWindowWidth();
  const isMobile = width <= 480;

  return (
    <div
      className={`card-hover anim-fadeup stagger-${delay} metric-card`}
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? '16px 18px' : '20px 24px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 4 : 8 }}>
        <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 500, color: t.textMuted, letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: t.textMuted, opacity: 0.6 }}>{icon}</span>
      </div>
      <p className="metric-value" style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: t.text, lineHeight: 1, marginBottom: isMobile ? 2 : 4 }}>{value}</p>
      {sub && <p style={{ fontSize: isMobile ? 10 : 12, color: t.textMuted }}>{sub}</p>}
    </div>
  );
};

const GlassCard = ({ children, style, className = '' }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const width = useWindowWidth();
  const isMobile = width <= 480;

  return (
    <div
      className={className}
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? 16 : 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const ChartTooltip = ({ active, payload, label, isDark }) => {
  const t = tokens(isDark);
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
const navItems = [
  { path: '/student', label: 'Dashboard', icon: Icons.dashboard },
  { path: '/student/marks', label: 'My Marks', icon: Icons.marks },
  { path: 'https://tuludimtuschool.com/studentstudy-dashboard', label: 'Digital Library', icon: Icons.moon },
  { path: 'https://www.tuludimtuschool.com/studentgetstudy-material', label: 'Teacher Upload', icon: Icons.certificate },
  { path: '/student/attendance', label: 'Attendance', icon: Icons.attendance },
  { path: '/student/reports', label: 'Reports', icon: Icons.reports },
  { path: '/student/news', label: 'News Feed', icon: Icons.news },
  { path: '/student/profile', label: 'Profile', icon: Icons.profile },
  { path: '/student/download', label: 'ID Card', icon: Icons.idCard },
  { path: '/student/certificate', label: 'Certificate', icon: Icons.certificate },
  { path: '/student/payment', label: 'Payment', icon: Icons.payment },
  { path: '/student/password', label: 'Security', icon: Icons.lock },
];

const Sidebar = ({ user, studentDetails, open, onClose, collapsed, onToggleCollapse }) => {
  const { isDark, toggle } = useContext(ThemeContext);
  const t = tokens(isDark);
  const location = useLocation();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const isActive = (p) => p === '/student' ? location.pathname === '/student' : location.pathname.startsWith(p);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('studentDetails');
    navigate('/login');
  };

  if (isMobile) {
    return (
      <>
        {open && (
          <div
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 40, backdropFilter: 'blur(4px)',
            }}
            className="anim-fadein"
          />
        )}
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
          background: t.sidebar, display: 'flex', flexDirection: 'column',
          zIndex: 50,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .3s cubic-bezier(.22,1,.36,1)',
          overflowY: 'auto', overflowX: 'hidden', color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
            >
              {Icons.close}
            </button>
          </div>

          <div style={{ padding: '0 20px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <PassportPhoto src={studentDetails?.profileImage || user?.profileImage} name={user?.name || studentDetails?.name} size={64} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
              {user?.name || 'Student'}
            </h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              {user?.studentId || '-'}
            </p>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px' }}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              const isExternal = item.path.startsWith('http');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="nav-link"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8, marginBottom: 2,
                    textDecoration: 'none',
                    background: active ? '#D5E5EE' : 'transparent',
                    color: active ? '#244955' : 'rgba(255,255,255,0.7)',
                    fontWeight: active ? 600 : 400, fontSize: 13,
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={toggle}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', marginBottom: 4,
              }}
              className="btn-primary"
            >
              {isDark ? Icons.sun : Icons.moon} {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 14px', borderRadius: 8, background: 'transparent',
                border: 'none', color: '#F7526A', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
              className="btn-primary"
            >
              {Icons.logout} Logout
            </button>
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: collapsed ? 72 : 240, background: t.sidebar,
      display: 'flex', flexDirection: 'column', zIndex: 50,
      transition: 'width .3s cubic-bezier(.22,1,.36,1)',
      overflowY: 'auto', overflowX: 'hidden', color: '#fff',
    }}>
      <div style={{
        padding: collapsed ? '16px 12px' : '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: collapsed ? 'center' : 'space-between',
        alignItems: 'center',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 16, color: '#fff',
            }}>E</div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>EduManage</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="btn-primary"
          style={{
            background: 'rgba(255,253,253,0.6)', border: 'none',
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0505', cursor: 'pointer', transition: 'transform .3s',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div>{collapsed ? <Menu size={20} /> : <X size={20} />}</div>
        </button>
      </div>

      <div style={{
        padding: collapsed ? '12px 8px' : '16px 20px 20px',
        textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ marginBottom: collapsed ? 8 : 12, display: 'flex', justifyContent: 'center' }}>
          <PassportPhoto
            src={studentDetails?.profileImage || user?.profileImage}
            name={user?.name || studentDetails?.name}
            size={collapsed ? 36 : 64}
          />
        </div>
        {!collapsed && (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
              {user?.name || 'Student'}
            </h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              {user?.studentId || '-'}
            </p>
            {studentDetails?.rollNumber && studentDetails.rollNumber !== 'Not assigned' && (
              <p style={{ fontSize: 10, color: 'rgba(6,229,200,0.8)', marginTop: 4 }}>
                Roll: {studentDetails.rollNumber}
              </p>
            )}
          </>
        )}
      </div>

      <nav style={{ flex: 1, padding: collapsed ? '8px 4px' : '16px 12px' }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          const isExternal = item.path.startsWith('http');
          return (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link"
              title={collapsed ? item.label : ''}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px' : '10px 14px', borderRadius: 8,
                marginBottom: 2, textDecoration: 'none',
                background: active ? '#D5E5EE' : 'transparent',
                color: active ? '#244955' : 'rgba(255,255,255,0.7)',
                fontWeight: active ? 600 : 400, fontSize: 13, position: 'relative',
              }}
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: collapsed ? '8px' : '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={toggle}
          style={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%', padding: collapsed ? '8px' : '8px 14px',
            borderRadius: 8, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', marginBottom: 4,
          }}
          className="btn-primary"
        >
          {isDark ? Icons.sun : Icons.moon} {!collapsed && (isDark ? 'Light Mode' : 'Dark Mode')}
        </button>
        {!collapsed && (
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 14px', borderRadius: 8, background: 'transparent',
              border: 'none', color: '#F7526A', fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
            }}
            className="btn-primary"
          >
            {Icons.logout} Logout
          </button>
        )}
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────
const Header = ({ user, studentDetails, onMobileMenuClick }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [showDrop, setShowDrop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 768;

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
      background: isDark ? 'rgba(15,23,36,0.9)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${t.border}`, padding: '0 16px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <button
            onClick={onMobileMenuClick}
            className="btn-primary"
            style={{
              width: 36, height: 36, borderRadius: 8, background: 'transparent',
              border: `1px solid ${t.border}`, color: t.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {Icons.menu}
          </button>
        )}
        <div>
          <h2 className="page-title" style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: t.text }}>
            {pageName}
          </h2>
          {!isMobile && <p style={{ fontSize: 12, color: t.textMuted }}>{today}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isMobile && (
          <div className="header-search" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                padding: '6px 14px 6px 36px', borderRadius: 20,
                border: `1px solid ${t.border}`,
                background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                fontSize: 12, outline: 'none', width: 160, color: t.text,
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
              {Icons.search}
            </span>
          </div>
        )}

        <button
          className="btn-primary"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
            border: `1px solid ${t.border}`, color: t.textSub,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative',
          }}
        >
          {Icons.bell}
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: '#F7526A', borderRadius: '50%' }} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDrop(!showDrop)}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
              border: `1px solid ${t.border}`, borderRadius: 8,
              padding: '3px 8px 3px 3px', cursor: 'pointer',
            }}
          >
            <CircleAvatar
              src={studentDetails?.profileImage || user?.profileImage}
              name={user?.name}
              size={28}
            />
            <span className="header-user-name" style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <span style={{ color: t.textMuted, fontSize: 10 }}>▼</span>
          </button>
          {showDrop && (
            <>
              <div onClick={() => setShowDrop(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div
                className="anim-fadeup"
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 200, borderRadius: 12, zIndex: 50, background: t.card,
                  border: `1px solid ${t.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: t.text }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: t.textMuted }}>{user?.studentId}</p>
                </div>
                <div style={{ padding: '4px' }}>
                  <Link to="/student/profile" onClick={() => setShowDrop(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: t.textSub, fontSize: 13 }}>
                    My Profile
                  </Link>
                  <Link to="/student/password" onClick={() => setShowDrop(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: t.textSub, fontSize: 13 }}>
                    Security
                  </Link>
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 6, background: 'none', border: 'none', color: '#F7526A', fontSize: 13, cursor: 'pointer' }}>
                    Logout
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
// STUDENT HOME
// ─────────────────────────────────────────────
const StudentHome = ({ linkedParents = [], attendanceSummary = null, latestMarks = [], studentDetails = null }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [user, setUser] = useState(null);
  const [marksSummary, setMarksSummary] = useState(null);
  const [subjectWiseMarks, setSubjectWiseMarks] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const width = useWindowWidth();
  const isMobile = width <= 480;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const message = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = userData._id || userData.id;
      if (!studentId) { setLoading(false); return; }

      let marks = [];
      try {
        const marksRes = await api.get(`/marks/student/${studentId}`);
        marks = marksRes.data || [];
      } catch (err) { /* silent */ }

      const subjectsMap = new Map();
      marks.forEach(mark => {
        if (!subjectsMap.has(mark.subject)) {
          subjectsMap.set(mark.subject, { subject: mark.subject, firstTest: 0, midExam: 0, notebook: 0, finalExam: 0, total: 0 });
        }
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
        if (overallAvg >= 90) grade = 'A+';
        else if (overallAvg >= 80) grade = 'A';
        else if (overallAvg >= 70) grade = 'B';
        else if (overallAvg >= 60) grade = 'C';
        else if (overallAvg >= 50) grade = 'D';
        else grade = 'F';
      }
      setMarksSummary({
        total: subjectsData.reduce((sum, s) => sum + s.total, 0),
        percentage: overallAvg.toFixed(2), result, grade,
      });

      if (attendanceSummary) {
        setAttendanceStats(attendanceSummary);
      } else {
        try {
          const attRes = await api.get(`/attendance/student/${studentId}`);
          const attendance = attRes.data || [];
          setAttendanceStats({
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.length - attendance.filter(a => a.status === 'present').length,
            total: attendance.length,
          });
        } catch (err) { /* silent */ }
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#666' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#333' }}>{value || '—'}</span>
    </div>
  );

  const attendancePercentage = attendanceStats.total > 0
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0;

  const chartData = subjectWiseMarks.map(s => ({ name: s.subject.slice(0, 4), total: s.total }));
  const CustomTooltip = (props) => <ChartTooltip {...props} isDark={isDark} />;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div
        className="anim-fadeup welcome-banner"
        style={{
          background: 'linear-gradient(135deg, #244955, #3A6B7A)',
          borderRadius: isMobile ? 12 : 16,
          padding: isMobile ? '16px 20px' : '24px 32px',
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <h2 className="student-name" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          {message}, {user?.name}!
        </h2>
        <p style={{ fontSize: isMobile ? 12 : 13, color: 'rgba(255,255,255,0.7)' }}>
          Your academic overview at a glance
        </p>
      </div>

      {studentDetails && (
        <GlassCard className="anim-fadeup stagger-1" style={{ padding: isMobile ? 16 : 24, marginBottom: isMobile ? 16 : 24 }}>
          <div
            className="student-details-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'center' : 'flex-start',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: isMobile ? 10 : 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16 }}>
              <PassportPhoto
                src={studentDetails?.profileImage || user?.profileImage}
                name={user?.name || studentDetails?.name}
                size={isMobile ? 60 : 80}
              />
              <div>
                <h3 style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: t.text }}>
                  {studentDetails.name || user?.name}
                </h3>
                <p style={{ fontSize: isMobile ? 11 : 13, color: t.textMuted }}>
                  Student • {studentDetails.rollNumber || 'N/A'}
                </p>
                {studentDetails.programs && (
                  <p style={{ fontSize: isMobile ? 10 : 12, color: t.textMuted }}>
                    {studentDetails.programs} • Grade {studentDetails.grade}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowDetails(true)}
              style={{
                padding: isMobile ? '4px 14px' : '6px 16px',
                background: '#244955', border: 'none', borderRadius: 6,
                color: '#fff', fontWeight: 500, cursor: 'pointer',
                fontSize: isMobile ? 11 : 12, whiteSpace: 'nowrap',
              }}
            >
              View Details →
            </button>
          </div>

          <div
            className="student-info-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: isMobile ? 8 : 12,
            }}
          >
            {studentDetails.sex && studentDetails.sex !== 'Not specified' && (
              <div>
                <p style={{ fontSize: isMobile ? 9 : 10, color: t.textMuted, textTransform: 'uppercase' }}>Gender</p>
                <p style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: t.text }}>{studentDetails.sex}</p>
              </div>
            )}
            {studentDetails.programs && studentDetails.programs !== 'Not specified' && (
              <div>
                <p style={{ fontSize: isMobile ? 9 : 10, color: t.textMuted, textTransform: 'uppercase' }}>Program</p>
                <p style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: t.text }}>{studentDetails.programs}</p>
              </div>
            )}
            {studentDetails.grade && studentDetails.grade !== 'Not specified' && (
              <div>
                <p style={{ fontSize: isMobile ? 9 : 10, color: t.textMuted, textTransform: 'uppercase' }}>Grade</p>
                <p style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: t.text }}>{studentDetails.grade}</p>
              </div>
            )}
            {studentDetails.section && studentDetails.section !== 'Not specified' && (
              <div>
                <p style={{ fontSize: isMobile ? 9 : 10, color: t.textMuted, textTransform: 'uppercase' }}>Section</p>
                <p style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: t.text }}>{studentDetails.section}</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {showDetails && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowDetails(false)}
        >
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{
              background: isDark ? '#1E2D3D' : '#fff',
              borderRadius: 16, maxWidth: 440, width: '100%', maxHeight: '80vh',
              overflow: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              padding: isMobile ? 20 : 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: t.text, margin: 0 }}>Full Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: t.textMuted }}
              >✕</button>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <PassportPhoto
                src={studentDetails?.profileImage || user?.profileImage}
                name={user?.name || studentDetails?.name}
                size={isMobile ? 80 : 100}
              />
            </div>

            <div style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: '12px 16px' }}>
              <DetailRow label="Full Name" value={studentDetails?.name} />
              <DetailRow label="Roll Number" value={studentDetails?.rollNumber} />
              <DetailRow label="Gender" value={studentDetails?.sex} />
              <DetailRow label="Program" value={studentDetails?.programs} />
              <DetailRow label="Grade" value={studentDetails?.grade} />
              <DetailRow label="Section" value={studentDetails?.section} />
              <DetailRow label="Student ID" value={user?.studentId || studentDetails?.studentId} />
              <DetailRow label="Parent Phone" value={studentDetails?.parentPhone} />
              {studentDetails?.address && <DetailRow label="Address" value={studentDetails.address} />}
              {studentDetails?.dob && <DetailRow label="Date of Birth" value={studentDetails.dob} />}
            </div>
          </div>
        </div>
      )}

      <div
        className="metrics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <MetricCard label="Average" value={`${marksSummary?.percentage || 0}%`} sub={`Grade ${marksSummary?.grade || 'N/A'}`} icon={Icons.dashboard} delay={1} />
        <MetricCard label="Attendance" value={`${attendancePercentage}%`} sub={`${attendanceStats.present} / ${attendanceStats.total} days`} icon={Icons.attendance} delay={2} />
        <MetricCard label="Subjects" value={subjectWiseMarks.length} sub="Active courses" icon={Icons.marks} delay={3} />
        <MetricCard label="Status" value={marksSummary?.result || 'N/A'} sub="Academic standing" icon={Icons.reports} delay={4} />
      </div>

      {linkedParents.length > 0 && (
        <GlassCard className="anim-fadeup stagger-2" style={{ padding: isMobile ? 16 : 24, marginBottom: isMobile ? 16 : 24 }}>
          <h4 style={{ fontWeight: 700, fontSize: isMobile ? 14 : 15, color: t.text, marginBottom: isMobile ? 12 : 16 }}>Linked Parents</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: isMobile ? 10 : 12,
          }}>
            {linkedParents.map((parent, idx) => (
              <div
                key={parent._id || idx}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                  borderRadius: 12, padding: isMobile ? 12 : 16,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CircleAvatar src={parent.profileImage} name={parent.name} size={isMobile ? 36 : 40} />
                  <div>
                    <p style={{ fontWeight: 600, color: t.text, fontSize: isMobile ? 12 : 13 }}>{parent.name}</p>
                    <p style={{ fontSize: isMobile ? 10 : 11, color: t.textMuted }}>{parent.relationship || 'Guardian'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {subjectWiseMarks.length > 0 ? (
        <>
          <div
            className="charts-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? 12 : 16,
              marginBottom: isMobile ? 16 : 20,
            }}
          >
            <GlassCard className="anim-fadeup stagger-3" style={{ padding: isMobile ? 14 : 20 }}>
              <h4 style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: t.text, marginBottom: isMobile ? 10 : 16 }}>
                Subject Performance
              </h4>
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                <BarChart data={chartData} barSize={isMobile ? 16 : 20}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={_.total >= 80 ? '#22D5A6' : _.total >= 60 ? '#7C5CFC' : '#F7526A'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="anim-fadeup stagger-4" style={{ padding: isMobile ? 14 : 20 }}>
              <h4 style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: t.text, marginBottom: isMobile ? 10 : 16 }}>
                Grade Distribution
              </h4>
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'A+', value: subjectWiseMarks.filter(s => s.total >= 90).length },
                      { name: 'A', value: subjectWiseMarks.filter(s => s.total >= 80 && s.total < 90).length },
                      { name: 'B', value: subjectWiseMarks.filter(s => s.total >= 70 && s.total < 80).length },
                      { name: 'C', value: subjectWiseMarks.filter(s => s.total >= 60 && s.total < 70).length },
                      { name: 'F', value: subjectWiseMarks.filter(s => s.total < 60).length },
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%"
                    innerRadius={isMobile ? 30 : 50}
                    outerRadius={isMobile ? 60 : 80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subjectWiseMarks.map((_, i) => (
                      <Cell key={i} fill={['#22D5A6', '#06E5C8', '#7C5CFC', '#F5A623', '#F7526A'][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          <GlassCard className="anim-fadeup stagger-5" style={{ padding: isMobile ? 14 : 20 }}>
            <h4 style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: t.text, marginBottom: isMobile ? 10 : 16 }}>
              Quick Actions
            </h4>
            <div
              className="quick-actions-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: isMobile ? 8 : 10,
              }}
            >
              {[
                { to: '/student/marks', label: 'View Marks' },
                { to: '/student/attendance', label: 'Attendance' },
                { to: '/student/reports', label: 'Reports' },
                { to: '/student/profile', label: 'Edit Profile' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: isMobile ? '8px 12px' : '10px 16px', borderRadius: 8,
                    background: '#244955', color: '#fff', fontWeight: 500,
                    fontSize: isMobile ? 11 : 12, textDecoration: 'none',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </GlassCard>
        </>
      ) : (
        <GlassCard style={{ padding: isMobile ? 32 : 48, textAlign: 'center' }}>
          <p style={{ fontSize: isMobile ? 32 : 48, marginBottom: 16 }}>📚</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: t.text }}>No Academic Data Yet</p>
          <p style={{ fontSize: isMobile ? 12 : 13, color: t.textMuted }}>Your marks will appear here once added by your teacher.</p>
        </GlassCard>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// VIEW MARKS
// ─────────────────────────────────────────────
const ViewMarks = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const width = useWindowWidth();
  const isMobile = width <= 480;

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
        if (!subjectsMap.has(mark.subject)) {
          subjectsMap.set(mark.subject, { subject: mark.subject, firstTest: 0, midExam: 0, notebook: 0, finalExam: 0 });
        }
        const s = subjectsMap.get(mark.subject);
        if (mark.examType === 'quiz') s.firstTest = mark.score;
        else if (mark.examType === 'midterm') s.midExam = mark.score;
        else if (mark.examType === 'assignment') s.notebook = mark.score;
        else if (mark.examType === 'final') s.finalExam = mark.score;
      });
      setMarksData(Array.from(subjectsMap.values()).map(s => {
        const total = s.firstTest + s.midExam + s.notebook + s.finalExam;
        let result = total >= 50 ? 'Pass' : 'Fail', grade = 'F';
        if (total >= 90) grade = 'A+';
        else if (total >= 80) grade = 'A';
        else if (total >= 70) grade = 'B';
        else if (total >= 60) grade = 'C';
        else if (total >= 50) grade = 'D';
        return { ...s, total, result, grade };
      }));
    } catch (err) {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><Spinner /></div>;
  }

  const avg = marksData.length > 0
    ? (marksData.reduce((s, m) => s + m.total, 0) / marksData.length).toFixed(1)
    : 0;

  const cols = ['Subject', 'First Test', 'Mid Exam', 'Notebook', 'Final', 'Total', 'Grade', 'Result'];

  return (
    <div className="anim-fadeup">
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: isMobile ? 14 : 20, flexWrap: 'wrap', gap: isMobile ? 8 : 12,
        }}
      >
        <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: t.text }}>Academic Marks</h2>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: isMobile ? 10 : 11, color: t.textMuted }}>Average</p>
          <p style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: '#244955' }}>{avg}%</p>
        </div>
      </div>

      {marksData.length === 0 ? (
        <GlassCard style={{ padding: isMobile ? 32 : 48, textAlign: 'center' }}>
          <p style={{ fontSize: isMobile ? 32 : 48 }}>📊</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: t.text }}>No Marks Available</p>
        </GlassCard>
      ) : (
        <GlassCard style={{ overflow: 'hidden', padding: 0 }}>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 10 : 13 }}>
              <thead>
                <tr style={{ background: '#244955' }}>
                  {cols.map(c => (
                    <th key={c} style={{ padding: isMobile ? '8px 10px' : '12px 16px', textAlign: 'left', color: '#fff', fontSize: isMobile ? 9 : 11, fontWeight: 600 }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marksData.map((m, i) => (
                  <tr key={i} className="table-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px', fontWeight: 600, color: t.text, fontSize: isMobile ? 10 : 13 }}>{m.subject}</td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px', color: t.textSub, fontSize: isMobile ? 10 : 13 }}>{m.firstTest}</td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px', color: t.textSub, fontSize: isMobile ? 10 : 13 }}>{m.midExam}</td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px', color: t.textSub, fontSize: isMobile ? 10 : 13 }}>{m.notebook}</td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px', color: t.textSub, fontSize: isMobile ? 10 : 13 }}>{m.finalExam}</td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px', fontWeight: 700, color: '#244955', fontSize: isMobile ? 10 : 13 }}>{m.total}</td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: isMobile ? 26 : 32, height: isMobile ? 26 : 32,
                        borderRadius: 6, background: 'rgba(36,73,85,0.1)',
                        color: '#244955', fontWeight: 700, fontSize: isMobile ? 10 : 13,
                      }}>{m.grade}</span>
                    </td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 16px' }}>
                      <StatusPill status={m.result} />
                    </td>
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
// VIEW ATTENDANCE
// ─────────────────────────────────────────────
const ViewAttendance = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const width = useWindowWidth();
  const isMobile = width <= 480;

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = userData._id || userData.id;
      if (!studentId) { setLoading(false); return; }
      const res = await api.get(`/attendance/student/${studentId}`);
      setRecords(res.data || []);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><Spinner /></div>;
  }

  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    total: records.length,
  };
  const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: t.text, marginBottom: isMobile ? 14 : 20 }}>
        Attendance Record
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: isMobile ? 8 : 16,
          marginBottom: isMobile ? 14 : 24,
        }}
      >
        <MetricCard label="Present" value={stats.present} sub="Days attended" icon={Icons.dashboard} delay={1} />
        <MetricCard label="Absent" value={stats.absent} sub="Days missed" icon={Icons.attendance} delay={2} />
        <MetricCard label="Rate" value={`${pct}%`} sub="Attendance rate" icon={Icons.reports} delay={3} />
      </div>

      {records.length === 0 ? (
        <GlassCard style={{ padding: isMobile ? 32 : 48, textAlign: 'center' }}>
          <p style={{ fontSize: isMobile ? 32 : 48 }}>📅</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: t.text }}>No Attendance Records</p>
        </GlassCard>
      ) : (
        <GlassCard style={{ overflow: 'hidden', padding: 0 }}>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 10 : 13 }}>
              <thead>
                <tr style={{ background: '#244955' }}>
                  {['Date', 'Subject', 'Status'].map(h => (
                    <th key={h} style={{ padding: isMobile ? '8px 10px' : '12px 20px', textAlign: 'left', color: '#fff', fontSize: isMobile ? 9 : 11, fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="table-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 20px', color: t.textSub, fontSize: isMobile ? 9 : 13 }}>
                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 20px', fontWeight: 600, color: t.text, fontSize: isMobile ? 10 : 13 }}>{r.subject || '-'}</td>
                    <td style={{ padding: isMobile ? '8px 10px' : '12px 20px' }}><StatusPill status={r.status} /></td>
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
// REPORTS
// ─────────────────────────────────────────────
const StudentReports = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [marksData, setMarksData] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const width = useWindowWidth();
  const isMobile = width <= 480;

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
          if (!map.has(m.subject)) {
            map.set(m.subject, { subject: m.subject, firstTest: 0, midExam: 0, notebook: 0, finalExam: 0, total: 0 });
          }
          const s = map.get(m.subject);
          if (m.examType === 'quiz') s.firstTest = m.score;
          else if (m.examType === 'midterm') s.midExam = m.score;
          else if (m.examType === 'assignment') s.notebook = m.score;
          else if (m.examType === 'final') s.finalExam = m.score;
          s.total = s.firstTest + s.midExam + s.notebook + s.finalExam;
        });
        setMarksData(Array.from(map.values()));
      } catch (err) { /* silent */ }

      try {
        const attRes = await api.get(`/attendance/student/${studentId}`);
        setAttendanceRecords(attRes.data || []);
      } catch (err) { /* silent */ }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
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

    const avgMark = marksData.length > 0
      ? marksData.reduce((s, m) => s + m.total, 0) / marksData.length
      : 0;

    return months.slice(0, 6).map(month => ({
      month,
      marks: avgMark,
      attendance: monthlyData[month]?.count > 0
        ? Math.round(monthlyData[month].attendance / monthlyData[month].count)
        : 0,
    }));
  };

  const trendData = getMonthlyPerformance();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><Spinner /></div>;
  }

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: t.text, marginBottom: 2 }}>Academic Reports</h2>
      <p style={{ fontSize: isMobile ? 12 : 13, color: t.textMuted, marginBottom: isMobile ? 16 : 24 }}>
        Comprehensive performance analytics
      </p>

      {marksData.length === 0 ? (
        <GlassCard style={{ padding: isMobile ? 32 : 48, textAlign: 'center' }}>
          <p style={{ fontSize: isMobile ? 32 : 48, marginBottom: 16 }}>📊</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: t.text }}>No Report Data Available</p>
        </GlassCard>
      ) : (
        <>
          <GlassCard style={{ padding: isMobile ? 14 : 20, marginBottom: isMobile ? 12 : 16 }}>
            <h4 style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: t.text, marginBottom: isMobile ? 10 : 16 }}>
              📈 Performance Trend
            </h4>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#244955" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#244955" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11, color: t.textMuted }} />
                <Area type="monotone" dataKey="marks" fill="url(#marksGrad)" stroke="#244955" strokeWidth={2} name="Marks %" dot={{ fill: '#244955', r: isMobile ? 3 : 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="attendance" stroke="#06E5C8" strokeWidth={2} name="Attendance %" dot={{ fill: '#06E5C8', r: isMobile ? 3 : 4, strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard style={{ padding: isMobile ? 14 : 20, marginBottom: isMobile ? 12 : 16 }}>
            <h4 style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: t.text, marginBottom: isMobile ? 10 : 16 }}>
              📊 Subject Breakdown
            </h4>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
              <BarChart data={marksData} barGap={isMobile ? 2 : 3} barSize={isMobile ? 12 : 16}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11, color: t.textMuted }} />
                <Bar dataKey="firstTest" fill="#7C5CFC" name="First Test" radius={[4, 4, 0, 0]} />
                <Bar dataKey="midExam" fill="#4F8EF7" name="Mid Exam" radius={[4, 4, 0, 0]} />
                <Bar dataKey="notebook" fill="#F5A623" name="Notebook" radius={[4, 4, 0, 0]} />
                <Bar dataKey="finalExam" fill="#06E5C8" name="Final" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard style={{ padding: isMobile ? 14 : 20 }}>
            <h4 style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: t.text, marginBottom: isMobile ? 10 : 16 }}>
              🎯 Proficiency Radar
            </h4>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
              <RadarChart data={marksData}>
                <PolarGrid stroke={t.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: t.textMuted, fontSize: isMobile ? 9 : 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: isMobile ? 8 : 9 }} />
                <Radar name="Score" dataKey="total" stroke="#244955" fill="#244955" fillOpacity={0.2} strokeWidth={2} />
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
// NEWS FEED
// ─────────────────────────────────────────────
const NewsFeedPage = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const width = useWindowWidth();
  const isMobile = width <= 480;

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get('/news');
      setNews(Array.isArray(res.data) ? res.data : res.data?.news || res.data?.data || []);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><Spinner /></div>;
  }

  return (
    <div className="anim-fadeup">
      <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: t.text, marginBottom: isMobile ? 14 : 20 }}>
        News Feed
      </h2>

      {news.length === 0 ? (
        <GlassCard style={{ padding: isMobile ? 32 : 48, textAlign: 'center' }}>
          <p style={{ fontSize: isMobile ? 32 : 48 }}>📰</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: t.text }}>No News</p>
        </GlassCard>
      ) : (
        news.map((n, i) => (
          <GlassCard
            key={n._id || i}
            className="card-hover"
            style={{ padding: isMobile ? '12px 16px' : '16px 20px', marginBottom: isMobile ? 10 : 12 }}
          >
            <span style={{
              fontSize: isMobile ? 9 : 10, fontWeight: 700, color: '#06E5C8',
              background: 'rgba(6,229,200,0.1)', padding: '2px 8px', borderRadius: 99,
            }}>
              {n.tag || 'NEWS'}
            </span>
            <p style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14, color: t.text, marginTop: isMobile ? 4 : 6 }}>
              {n.title}
            </p>
            <p style={{ fontSize: isMobile ? 11 : 12, color: t.textMuted, marginTop: isMobile ? 2 : 4 }}>
              {n.content || n.description}
            </p>
          </GlassCard>
        ))
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// EDIT PROFILE
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
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profileImage || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = user._id || user.id;
      const formData = new FormData();
      Object.keys(form).forEach(key => { if (form[key]) formData.append(key, form[key]); });
      if (profileImage) formData.append('profileImage', profileImage);
      const res = await api.put(`/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = { ...user, ...form, profileImage: res.data.profileImage || previewUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anim-fadeup">
      <GlassCard style={{ padding: isMobile ? 16 : 28 }}>
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: isMobile ? 16 : 24, flexWrap: 'wrap', gap: isMobile ? 8 : 12,
          }}
        >
          <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: t.text }}>My Profile</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary"
              style={{ padding: isMobile ? '6px 16px' : '8px 20px', borderRadius: 6, background: '#244955', color: '#fff', fontSize: isMobile ? 12 : 13 }}
            >
              Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: isMobile ? 6 : 8 }}>
              <button
                onClick={() => setEditing(false)}
                className="btn-primary"
                style={{ padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: 6, background: 'transparent', border: `1px solid ${t.border}`, color: t.textSub, fontSize: isMobile ? 12 : 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary"
                style={{ padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: 6, background: '#244955', color: '#fff', fontSize: isMobile ? 12 : 13 }}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 24, marginBottom: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
          <PassportPhoto src={previewUrl || user.profileImage} name={user.name} size={isMobile ? 64 : 80} />
          {editing && (
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
                style={{ padding: isMobile ? '4px 12px' : '6px 16px', borderRadius: 6, background: '#244955', color: '#fff', fontSize: isMobile ? 11 : 12 }}
              >
                Upload Photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          )}
        </div>

        <div
          className="profile-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 10 : 16,
          }}
        >
          {['name', 'email', 'phone', 'parentName', 'parentPhone', 'address'].map(field => (
            <div key={field}>
              <label style={{
                fontSize: isMobile ? 10 : 11, fontWeight: 600, color: t.textMuted,
                textTransform: 'uppercase', display: 'block', marginBottom: isMobile ? 2 : 4,
              }}>
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {editing ? (
                <input
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{
                    width: '100%', padding: isMobile ? '6px 10px' : '8px 12px',
                    borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                    border: `1px solid ${t.border}`, color: t.text,
                    fontSize: isMobile ? 12 : 13, outline: 'none',
                  }}
                />
              ) : (
                <p style={{ fontSize: isMobile ? 12 : 14, fontWeight: 500, color: t.text, padding: isMobile ? '4px 0' : '8px 0' }}>
                  {form[field] || 'Not set'}
                </p>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// STUDENT DASHBOARD (MAIN)
// ─────────────────────────────────────────────
const StudentDashboard = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [linkedParents] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [latestMarks, setLatestMarks] = useState([]);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const toggle = () => setIsDark(d => {
    const next = !d;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
  });

  const toggleCollapse = () => setSidebarCollapsed(prev => {
    const next = !prev;
    localStorage.setItem('sidebarCollapsed', next);
    return next;
  });

  const t = tokens(isDark);

  useEffect(() => {
    if (width > 768) setMobileSidebarOpen(false);
  }, [width]);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) { setLoading(false); return; }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      try {
        const res = await api.get('/users/me/profile');

        const profileImage =
          res.data.profileImage ||
          res.data.profileImageUrl ||
          res.data.avatar ||
          res.data.image ||
          '';

        const merged = { ...parsedUser, ...res.data, profileImage };
        setStudentDetails(merged);
        setUser(merged);
        localStorage.setItem('user', JSON.stringify(merged));
      } catch (err) {
        console.warn('Failed to fetch profile, using cached user:', err);
        setStudentDetails(parsedUser);
      }

      const studentId = parsedUser._id || parsedUser.id;
      try {
        const attRes = await api.get(`/attendance/student/${studentId}/summary`);
        if (attRes.data) setAttendanceSummary(attRes.data);
      } catch (err) { /* silent */ }

      try {
        const marksRes = await api.get(`/marks/student/${studentId}/latest`);
        if (marksRes.data) setLatestMarks(Array.isArray(marksRes.data) ? marksRes.data : [marksRes.data]);
      } catch (err) { /* silent */ }
    } catch (error) {
      console.error('Init error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemeContext.Provider value={{ isDark, toggle }}>
        <GlobalStyles />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', background: t.bg, gap: 16,
        }}>
          <div style={{
            width: isMobile ? 40 : 48, height: isMobile ? 40 : 48,
            borderRadius: 12, background: '#244955',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: isMobile ? 16 : 20,
          }} className="anim-float">E</div>
          <Spinner color="#244955" />
          <p style={{ fontSize: isMobile ? 12 : 13, color: t.textMuted }}>Loading your dashboard…</p>
        </div>
      </ThemeContext.Provider>
    );
  }

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 72 : 240);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <GlobalStyles />
      <div style={{ display: 'flex', minHeight: '100vh', background: t.bg }}>
        <Sidebar
          user={user}
          studentDetails={studentDetails}
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <div style={{
          flex: 1,
          marginLeft: sidebarWidth,
          transition: 'margin-left .3s cubic-bezier(.22,1,.36,1)',
          minWidth: 0,
        }}>
          <Header
            user={user}
            studentDetails={studentDetails}
            onMobileMenuClick={() => setMobileSidebarOpen(true)}
          />

          <main className="main-padding" style={{ padding: isMobile ? '16px 16px 32px' : '24px 28px 48px' }}>
            <Routes>
              <Route path="/" element={<StudentHome linkedParents={linkedParents} attendanceSummary={attendanceSummary} latestMarks={latestMarks} studentDetails={studentDetails} />} />
              <Route path="/marks" element={<ViewMarks />} />
              <Route path="/attendance" element={<ViewAttendance />} />
              <Route path="/reports" element={<StudentReports />} />
              <Route path="/news" element={<NewsFeedPage />} />
              <Route path="/profile" element={<EditProfile />} />
              <Route path="/download" element={<StudentIDCard />} />
              <Route path="/certificate" element={<StudentCertificate />} />
              <Route path="/password" element={<ChangePassword />} />
              <Route path="/payment" element={<StudentPayment />} />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default StudentDashboard;
