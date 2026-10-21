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
import {
  LayoutGrid, ClipboardCheck, PenSquare, Eye, Trophy, FileBarChart2,
  Newspaper, Users, UserRound, Sun, Moon, LogOut, Bell, ChevronsLeft,
  ChevronsRight, GraduationCap, BookMarked, Menu
} from 'lucide-react';

// ─── Import your existing sub-page components ───────────────────────────────
import NewsFeed from '../NewsFeed';
import ReportsViewer from './ReportsViewer';
import AttendanceManager from '../../pages/studentAttendance/StudentAttendanceTrack';
import GradeEntrySystem from '../../pages/studentMark/StudentMarkEntery';
import ViewMarksSystem from '../../pages/studentMark/TeacherMarkView';
import ClassRosterMarkList from '../../pages/studentMark/StudentRoster';
import StudentProfile from '../../pages/studentMark/StudentProfiel';

// ─────────────────────────────────────────────
// DESIGN SYSTEM — Sidebar Gradient Blue & Soft White
// ─────────────────────────────────────────────
const ThemeContext = createContext({ isDark: true, toggle: () => {} });

const tokens = (dark) => ({
  bg:          dark ? '#0F172A' : '#F8FAFC',
  surface:     dark ? '#1E293B' : '#FFFFFF',
  glass:       dark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.03)',
  glassBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(30,58,138,0.08)',
  sidebar:     'bg-gradient-to-br from-[#1565c0] to-[#0d47a1]', // Sidebar gradient
  card:        dark ? '#1E293B' : '#FFFFFF',

  blue:    '#1565c0',
  blueDk:  '#0d47a1',
  blueLt:  '#64b5f6',
  sky:     '#42a5f5',
  skyLt:   '#90caf9',
  teal:    '#06B6D4',
  indigo:  '#4F46E5',
  slate:   '#64748B',
  white:   '#F8FAFC',

  grad1: 'linear-gradient(135deg,#1565c0,#0d47a1)',
  grad2: 'linear-gradient(135deg,#42a5f5,#1565c0)',
  grad3: 'linear-gradient(135deg,#1565c0,#0d47a1)',
  grad4: 'linear-gradient(135deg,#0d47a1,#1565c0)',

  text:      dark ? '#F1F5F9' : '#0F172A',
  textSub:   dark ? '#CBD5E1' : '#334155',
  textMuted: dark ? '#94A3B8' : '#64748B',
  border:    dark ? 'rgba(255,255,255,0.08)' : 'rgba(30,58,138,0.09)',

  success: '#10B981',
  danger:  '#EF4444',
  warning: '#F59E0B',
  accent:  dark ? '#1565c0' : '#0d47a1',
});

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const id = 'td-global';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { height: 100%; width: 100%; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(21,101,192,0.35); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(21,101,192,0.55); }
      @keyframes fadeup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadein { from{opacity:0} to{opacity:1} }
      @keyframes slideright { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      .fadeup { animation: fadeup .5s cubic-bezier(.22,.61,.36,1) forwards; }
      .fadein { animation: fadein .35s ease forwards; }
      .slideright { animation: slideright .45s cubic-bezier(.22,.61,.36,1) forwards; }
      .pulse { animation: pulse 2.2s ease-in-out infinite; }
      .float { animation: float 3s ease-in-out infinite; }
      .s1{animation-delay:.04s} .s2{animation-delay:.08s} .s3{animation-delay:.12s}
      .s4{animation-delay:.16s} .s5{animation-delay:.2s} .s6{animation-delay:.24s}
      body { font-family: 'Inter', sans-serif; }
      a { color: inherit; text-decoration: none; }
      button { font-family: 'Inter', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
      .sidebar-gradient {
        background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
      }
      @media (prefers-reduced-motion: reduce) {
        .fadeup, .fadein, .slideright, .pulse, .float { animation: none !important; opacity: 1 !important; }
      }
    `;
    document.head.appendChild(s);
  }, []);
  return null;
};

// ─────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────
const GlassCard = ({ children, style, className = '' }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  return (
    <div className={className} style={{
      background: t.glass,
      border: `1px solid ${t.glassBorder}`,
      borderRadius: 14,
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s cubic-bezier(.22,.61,.36,1)',
      ...style
    }}>
      {children}
    </div>
  );
};

const GradText = ({ children, grad }) => (
  <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>{children}</span>
);

const MetricCard = ({ label, value, sub, grad, delay = 1 }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  return (
    <div className={`fadeup s${delay}`} style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: 14,
      padding: '22px 20px',
      position: 'relative',
      overflow: 'hidden',
      opacity: 0,
    }}>
      <div style={{ position:'absolute',top:0,left:0,bottom:0,width:4,background:grad }} />
      <p className="mono" style={{ fontSize:11,fontWeight:600,color:t.textMuted,marginBottom:10,letterSpacing:'.08em',textTransform:'uppercase',paddingLeft:8 }}>{label}</p>
      <p style={{ fontSize:34,fontWeight:700,color:t.text,lineHeight:1,marginBottom:8,paddingLeft:8 }}>{value}</p>
      {sub && <p style={{ fontSize:13,color:t.textSub,paddingLeft:8 }}>{sub}</p>}
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:t.surface,border:`1px solid ${t.border}`,borderRadius:10,padding:'12px 14px',boxShadow:'0 12px 32px rgba(0,0,0,.22)' }}>
      <p className="mono" style={{ fontSize:11,color:t.textMuted,marginBottom:6,fontWeight:600,letterSpacing:'.04em' }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} className="mono" style={{ fontSize:12,color:p.color,fontWeight:600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────
const navItems = [
  { path:'/teacher',             label:'Dashboard',      icon: LayoutGrid },
  { path:'/teacher/attendance',  label:'Attendance',     icon: ClipboardCheck },
  { path:'/teacher/marks-entry', label:'Enter Marks',    icon: PenSquare },
  { path:'/teacher/marks-view',  label:'View Marks',     icon: Eye },
  { path:'/teacher/reports',     label:'Reports',        icon: FileBarChart2 },
  { path:'/teacher/news',        label:'News Feed',      icon: Newspaper },
  { path:'/teacher/roster',      label:'Class Roster',   icon: Users },
  { path:'/teacher/profile',     label:'Student Profile',icon: UserRound },
];

// ─────────────────────────────────────────────
// SIDEBAR - With Blue Gradient
// ─────────────────────────────────────────────
const Sidebar = ({ user, open, onClose, collapsed, onToggleCollapse }) => {
  const { isDark, toggle } = useContext(ThemeContext);
  const t = tokens(isDark);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (p) => p === '/teacher' ? location.pathname === '/teacher' : location.pathname.startsWith(p);
  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:40,backdropFilter:'blur(4px)' }} className="fadein" />
      )}
      <aside style={{
        position:'fixed', top:0, left:0, bottom:0, width: collapsed ? 76 : 264,
        background: '#04395E',
        display:'flex', flexDirection:'column', zIndex:50,
        transition:'width .35s cubic-bezier(.22,.61,.36,1)',
        overflowY:'auto', overflowX:'hidden',
        fontFamily:"'Inter', sans-serif",
        boxShadow: '4px 0 20px rgba(13, 71, 161, 0.3)',
      }}>
        {/* Brand */}
        <div style={{ 
          padding: collapsed ? '22px 0' : '22px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.15)', 
          display:'flex', 
          alignItems:'center', 
          justifyContent: collapsed ? 'center' : 'space-between', 
          gap: 10 
        }}>
          <div className="fadeup" style={{ display:'flex', alignItems:'center', gap:12, opacity:0 }}>
            <div style={{
              width:38,height:38,borderRadius:'50%',
              background: 'rgba(255,255,255,0.2)',
              display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',
              boxShadow:'0 4px 16px rgba(0,0,0,0.2)',
              flexShrink:0,
              border: '2px solid rgba(255,255,255,0.3)',
            }}>
              <GraduationCap size={19} strokeWidth={2.2} />
            </div>
            {!collapsed && (
              <div>
                <p style={{ fontWeight:700,fontSize:16,color:'#FFFFFF',letterSpacing:'-.01em' }}>EduManage</p>
                <p className="mono" style={{ fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:600,marginTop:2,letterSpacing:'.06em',textTransform:'uppercase' }}>Teacher Desk</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button onClick={onToggleCollapse} style={{
          width: collapsed ? 32 : 'calc(100% - 40px)', 
          height:32, 
          margin: collapsed ? '14px auto 6px' : '14px 20px 6px',
          borderRadius:8, 
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.8)',
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .25s', 
          gap:6,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
        >
          {collapsed ? <ChevronsRight size={15} /> : <><ChevronsLeft size={15} /><span style={{fontSize:11,fontWeight:600}}>Collapse</span></>}
        </button>

   

        {/* Navigation */}
        <nav style={{ flex:1, padding: '14px 12px', display:'flex',flexDirection:'column',gap:2 }}>
          {!collapsed && <p className="mono" style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'.1em',textTransform:'uppercase',padding:'8px 10px 10px' }}>Menu</p>}
          {navItems.map((item, i) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} onClick={onClose} title={collapsed ? item.label : undefined}
                className={`fadeup s${Math.min(i+2,6)}`}
                style={{
                  display:'flex',alignItems:'center',gap: 12, justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '11px 0' : '10px 12px', borderRadius:9, textDecoration:'none',
                  background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                  fontWeight: active ? 700 : 500, 
                  fontSize: 13.5,
                  borderLeft: `3px solid ${active ? '#FFFFFF' : 'transparent'}`,
                  transition: 'all .2s ease',
                  cursor:'pointer', whiteSpace:'nowrap', opacity: 0, position:'relative',
                }}
                onMouseEnter={(e) => { if(!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { if(!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={17} strokeWidth={2} style={{ flexShrink:0 }} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div style={{ 
          padding: '12px', 
          borderTop: '1px solid rgba(255,255,255,0.15)', 
          display:'flex',
          flexDirection:'column',
          gap:6 
        }}>
          <button onClick={toggle}
            style={{
              display:'flex',alignItems:'center',gap: 12, justifyContent: collapsed ? 'center' : 'flex-start',
              width:'100%', padding: collapsed ? '11px 0' : '10px 12px', borderRadius:9,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button onClick={handleLogout}
            style={{
              display:'flex',alignItems:'center',gap:12,width:'100%',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '11px 0' : '10px 12px', borderRadius:9,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5',
              fontSize:13,fontWeight:600,cursor:'pointer',
              transition:'all .2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
          >
            <LogOut size={16} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────
// HEADER - Soft White Design
// ─────────────────────────────────────────────
const Header = ({ user, collapsed, onMenuToggle }) => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [showDrop, setShowDrop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = navItems.find(n => n.path === '/teacher' ? location.pathname === '/teacher' : location.pathname.startsWith(n.path));
  const pageName = activeItem?.label || 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };

  return (
    <header className="slideright" style={{
      position:'sticky',top:0,zIndex:30,
      background: isDark ? '#1E293B' : '#FFFFFF',
      boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
      borderBottom: `1px solid ${t.border}`,
      padding:'0 28px', height:76,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      fontFamily:"'Inter', sans-serif",
      // marginLeft: collapsed ? 76 : 264,
      transition: 'margin-left .35s cubic-bezier(.22,.61,.36,1)',
      opacity: 0,
    }}>
      <div style={{ display:'flex',alignItems:'center',gap:16 }}>
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuToggle}
          style={{
            display: 'none',
            alignItems:'center',
            justifyContent:'center',
            width:38,
            height:38,
            borderRadius:8,
            background: 'transparent',
            border: `1px solid ${t.border}`,
            color: t.textSub,
            cursor:'pointer',
            transition:'all .2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.blue; e.currentTarget.style.color = t.blue; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub; }}
          className="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>
        
        <div style={{ 
          width:40,
          height:40,
          borderRadius:10,
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          color:'#fff',
          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)'
        }}>
          <BookMarked size={18} />
        </div>
        <div>
          <p style={{ fontWeight:700,fontSize:21,color:t.text,lineHeight:1.2, marginLeft:0 }}>{pageName}</p>
          <p className="mono" style={{ fontSize:11,color:t.textMuted,marginTop:3,letterSpacing:'.02em' }}>{today}</p>
        </div>
      </div>

      <div style={{ display:'flex',alignItems:'center',gap:12 }}>
        <button style={{
          width:38,height:38,borderRadius:9,
          background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
          border: `1px solid ${t.border}`,
          color:t.textSub,
          display:'flex',alignItems:'center',justifyContent:'center',position:'relative',cursor:'pointer',transition:'all .25s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.blue; e.currentTarget.style.color = t.blue; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'; }}
        >
          <Bell size={16} />
          <span className="pulse" style={{ position:'absolute',top:8,right:8,width:7,height:7,borderRadius:'50%',background:t.danger }} />
        </button>

        <div style={{ position:'relative' }}>
          <button onClick={() => setShowDrop(!showDrop)}
            style={{
              display:'flex',alignItems:'center',gap:10,
              background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
              border: `1px solid ${t.border}`,
              borderRadius:10,
              padding:'6px 12px 6px 6px',
              cursor:'pointer',
              transition:'all .25s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.blue; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'; }}
          >
            <div style={{
              width:30,height:30,borderRadius:'50%',
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#fff',fontWeight:700,fontSize:13
            }}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize:13,fontWeight:600,color:t.text,maxWidth:100,overflow:'hidden',textOverflow:'ellipsis' }}>{user?.name?.split(' ')[0]}</span>
            <span style={{ color:t.textMuted,fontSize:10 }}>▾</span>
          </button>
          {showDrop && (
            <>
              <div onClick={() => setShowDrop(false)} style={{ position:'fixed',inset:0,zIndex:40 }} />
              <div className="fadeup" style={{ position:'absolute',top:'calc(100% + 10px)',right:0,width:220,borderRadius:12,zIndex:50,background:t.surface,border:`1px solid ${t.border}`,boxShadow:'0 16px 48px rgba(0,0,0,.18)',overflow:'hidden' }}>
                <div style={{ padding:'16px',borderBottom:`1px solid ${t.border}` }}>
                  <p style={{ fontWeight:700,fontSize:14,color:t.text }}>{user?.name}</p>
                  <p style={{ fontSize:12,color:t.textMuted,marginTop:4 }}>{user?.email}</p>
                  <span className="mono" style={{ display:'inline-block',marginTop:8,padding:'3px 10px',borderRadius:6,fontSize:10,fontWeight:700,background:'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',color:'#fff',letterSpacing:'.05em' }}>TEACHER</span>
                </div>
                <div style={{ padding:'8px' }}>
                  <button onClick={handleLogout}
                    style={{
                      display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:8,
                      background:'none',border:'none',color:t.danger,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `rgba(239,68,68,.1)`}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={14} /> Logout
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
// TEACHER HOME
// ─────────────────────────────────────────────
const TeacherHome = () => {
  const { isDark } = useContext(ThemeContext);
  const t = tokens(isDark);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marksData, setMarksData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/classes/my-classes');
        setClasses(res.data || []);

        try {
          const marksRes = await api.get('/marks/my-classes-marks');
          const marks = marksRes.data || [];
          const subjectMap = new Map();
          marks.forEach(m => {
            if (!subjectMap.has(m.subject)) subjectMap.set(m.subject, { subject: m.subject, firstTest: 0, midExam: 0, notebook: 0, finalExam: 0, total: 0 });
            const s = subjectMap.get(m.subject);
            if (m.examType === 'quiz') s.firstTest += m.score;
            else if (m.examType === 'midterm') s.midExam += m.score;
            else if (m.examType === 'assignment') s.notebook += m.score;
            else if (m.examType === 'final') s.finalExam += m.score;
            s.total = s.firstTest + s.midExam + s.notebook + s.finalExam;
          });
          setMarksData(Array.from(subjectMap.values()));
        } catch (err) { console.error('Marks fetch error:', err); }

        try {
          const attRes = await api.get('/attendance/my-classes-attendance');
          setAttendanceData(attRes.data || []);
        } catch (err) { console.error('Attendance fetch error:', err); }

      } catch {
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalStudents = classes.reduce((s, c) => s + (c.students?.length || 0), 0);

  const trendData = [
    { month: 'Jan', marks: marksData.length > 0 ? Math.round(marksData.reduce((s, m) => s + m.total, 0) / marksData.length) : 0, attendance: 85 },
    { month: 'Feb', marks: marksData.length > 0 ? Math.round(marksData.reduce((s, m) => s + m.total, 0) / marksData.length) + 2 : 0, attendance: 88 },
    { month: 'Mar', marks: marksData.length > 0 ? Math.round(marksData.reduce((s, m) => s + m.total, 0) / marksData.length) - 1 : 0, attendance: 82 },
    { month: 'Apr', marks: marksData.length > 0 ? Math.round(marksData.reduce((s, m) => s + m.total, 0) / marksData.length) + 4 : 0, attendance: 90 },
    { month: 'May', marks: marksData.length > 0 ? Math.round(marksData.reduce((s, m) => s + m.total, 0) / marksData.length) + 3 : 0, attendance: 87 },
    { month: 'Jun', marks: marksData.length > 0 ? Math.round(marksData.reduce((s, m) => s + m.total, 0) / marksData.length) + 1 : 0, attendance: 91 },
  ];

  const CustomTooltip = (props) => <ChartTooltip {...props} />;

  if (loading) {
    return (
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:320,gap:16 }}>
        <div style={{width:38,height:38,borderRadius:'50%',border:`3px solid ${t.border}`,borderTop:`3px solid ${t.blue}`}} className="float" />
        <p className="mono" style={{ fontSize:12,color:t.textMuted,letterSpacing:'.04em' }}>LOADING DASHBOARD…</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'Inter', sans-serif" }}>
      {/* Hero Banner */}
      <div className="fadeup" style={{
        background: '#04395E',
        borderRadius:16,
        padding:'34px 36px',
        marginBottom:28,
        position:'relative',
        overflow:'hidden',
        opacity:0,
        boxShadow: '0 8px 24px rgba(21, 101, 192, 0.3)',
      }}>
        <div style={{ position:'absolute',top:-10,right:30,width:2,height:'120%',background:'rgba(255,255,255,.15)' }} />
        <div style={{ position:'absolute',top:-10,right:60,width:2,height:'120%',background:'rgba(255,255,255,.1)' }} />
        <div style={{position:'relative',zIndex:1}}>
          <p className="mono" style={{ fontSize:11,color:'rgba(255,255,255,.85)',fontWeight:600,marginBottom:10,letterSpacing:'.1em',textTransform:'uppercase' }}>Welcome back</p>
          <h2 style={{ fontSize:30,fontWeight:700,color:'#FFFFFF',marginBottom:12,letterSpacing:'-.01em' }}>
            {JSON.parse(localStorage.getItem('user') || '{}')?.name?.split(' ')[0] || 'Teacher'}'s Dashboard
          </h2>
          <p style={{ fontSize:14,color:'rgba(255,255,255,.8)' }}>
            You have <strong style={{ color:'#FFFFFF' }}>{classes.length} active class{classes.length !== 1 ? 'es' : ''}</strong> with <strong style={{ color:'#FFFFFF' }}>{totalStudents} students</strong>
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:28 }}>
        <MetricCard label="Active Classes" value={classes.length} sub="Assigned to you" grad="linear-gradient(135deg, #1565c0, #0d47a1)" delay={1} />
        <MetricCard label="Total Students" value={totalStudents} sub="Across all classes" grad="linear-gradient(135deg, #42a5f5, #1565c0)" delay={2} />
        <MetricCard label="Today's Attendance" value="85%" sub="Estimated" grad="linear-gradient(135deg, #1565c0, #0d47a1)" delay={3} />
        <MetricCard label="Pending Reviews" value={classes.length * 2} sub="Awaiting action" grad="linear-gradient(135deg, #0d47a1, #1565c0)" delay={4} />
      </div>

      {/* Performance Charts */}
      {marksData.length > 0 && (
        <GlassCard style={{ padding: 28, marginBottom: 20 }} className="fadeup s3">
          <p style={{ fontWeight: 700, fontSize: 17, color: t.text, marginBottom: 22 }}>
            <GradText grad="linear-gradient(135deg, #1565c0, #0d47a1)">Performance Trend</GradText>
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendData}>
              <defs>
                <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565c0" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1565c0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: t.textMuted }} />
              <Area type="monotone" dataKey="marks" fill="url(#marksGrad)" stroke="#1565c0" strokeWidth={3} name="Avg Marks %" dot={{ fill: '#1565c0', r: 5, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="attendance" stroke="#42a5f5" strokeWidth={3} name="Attendance %" dot={{ fill: '#42a5f5', r: 5, strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Subject Breakdown */}
      {marksData.length > 0 && (
        <GlassCard style={{ padding: 28, marginBottom: 20 }} className="fadeup s4">
          <p style={{ fontWeight: 700, fontSize: 17, color: t.text, marginBottom: 22 }}>
            <GradText grad="linear-gradient(135deg, #42a5f5, #1565c0)">Subject Performance</GradText>
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marksData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis dataKey="subject" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="firstTest" fill="#0d47a1" name="First Test" radius={[5, 5, 0, 0]} barSize={16} />
              <Bar dataKey="midExam" fill="#1565c0" name="Mid Exam" radius={[5, 5, 0, 0]} barSize={16} />
              <Bar dataKey="notebook" fill="#42a5f5" name="Notebook" radius={[5, 5, 0, 0]} barSize={16} />
              <Bar dataKey="finalExam" fill="#64b5f6" name="Final" radius={[5, 5, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Classes Grid */}
      <GlassCard style={{ padding: 28 }} className="fadeup s5">
        <p style={{ fontWeight: 700, fontSize: 17, color: t.text, marginBottom: 22 }}>
          <GradText grad="linear-gradient(135deg, #1565c0, #0d47a1)">My Classes</GradText>
        </p>
        {classes.length === 0 ? (
          <div style={{ textAlign:'center',padding:'60px 0' }}>
            <BookMarked size={44} style={{ color: t.textMuted, marginBottom: 14 }} />
            <p style={{ color:t.textMuted,fontSize:15,fontWeight:600 }}>No classes assigned</p>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14 }}>
            {classes.map((cls, i) => (
              <div key={cls._id} className={`fadeup s${Math.min(i+1,6)}`}
                style={{
                  background: t.glass,
                  border:`1px solid ${t.border}`,
                  borderTop: '3px solid #1565c0',
                  borderRadius:12,
                  padding:'20px',
                  position:'relative',
                  transition:'all .25s',
                  opacity: 0,
                  cursor:'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#1565c0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.borderTopColor = '#1565c0'; }}
              >
                <div style={{ width:38,height:38,borderRadius:9,background:'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14,marginBottom:14 }}>G{cls.grade}</div>
                <p style={{ fontWeight:700,fontSize:16,color:t.text }}>Grade {cls.grade} — {cls.section}</p>
                <p style={{ fontSize:13,color:t.textSub,marginTop:6 }}>{cls.subject?.name || 'No subject'}</p>
                <div style={{ marginTop:14,display:'flex',alignItems:'center',gap:6,fontSize:12,color:t.textMuted,fontWeight:600 }}>
                  <Users size={13} /> {cls.students?.length || 0} students
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Quick Actions */}
      <GlassCard style={{ padding:28,marginTop:20 }} className="fadeup s6">
        <p style={{fontWeight:700,fontSize:17,color:t.text,marginBottom:20}}>Quick Actions</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12 }}>
          {[
            { to:'/teacher/attendance',  label:'Take Attendance', icon: ClipboardCheck },
            { to:'/teacher/marks-entry', label:'Enter Marks',     icon: PenSquare },
            { to:'/teacher/marks-view',  label:'View Marks',      icon: Eye },
            { to:'/teacher/reports',     label:'Reports',         icon: FileBarChart2 },
            { to:'/teacher/roster',      label:'Class Roster',    icon: Users },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              style={{
                display:'flex',alignItems:'center',gap:8,justifyContent:'center',padding:'14px 16px',borderRadius:10,
                background:'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                color:'#FFFFFF',fontWeight:600,fontSize:13,textDecoration:'none',
                transition:'all .25s',cursor:'pointer'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(21, 101, 192, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN TEACHER DASHBOARD
// ─────────────────────────────────────────────
const TeacherDashboard = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('teacherTheme') !== 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('teacherSidebarCollapsed') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{"name":"Teacher","email":"teacher@school.com"}'));

  const toggle = () => setIsDark(d => { localStorage.setItem('teacherTheme', !d ? 'dark' : 'light'); return !d; });
  const toggleCollapse = () => setSidebarCollapsed(prev => { localStorage.setItem('teacherSidebarCollapsed', !prev); return !prev; });
  const t = tokens(isDark);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Mobile menu toggle handler
  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);

  if (loading) {
    return (
      <ThemeContext.Provider value={{ isDark, toggle }}>
        <GlobalStyles />
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:t.bg,gap:18,fontFamily:"'Inter',sans-serif" }}>
          <div style={{ width:56,height:56,borderRadius:'50%',background:'#04395E',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:'0 8px 24px rgba(21, 101, 192, 0.3)' }} className="float">
            <GraduationCap size={26} strokeWidth={2.2} />
          </div>
          <div style={{width:36,height:36,borderRadius:'50%',border:`3px solid ${t.border}`,borderTop:`3px solid ${t.blue}`}} className="float" />
          <p className="mono" style={{ fontSize:12,color:t.textMuted,fontWeight:600,letterSpacing:'.04em' }}>LOADING EDUMANAGE…</p>
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <GlobalStyles />
      <div style={{ display:'flex',height:'100vh',background:t.bg,overflow:'hidden',fontFamily:"'Inter', sans-serif" }}>
        <Sidebar 
          user={user} 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={toggleCollapse} 
        />
        <div style={{ 
          display:'flex', 
          flexDirection:'column', 
          flex:1, 
          overflow:'hidden', 
          marginLeft: sidebarCollapsed ? 76 : 264, 
          transition: 'margin-left .35s cubic-bezier(.22,.61,.36,1)' 
        }}>
          <Header 
            user={user} 
            collapsed={sidebarCollapsed} 
            onMenuToggle={handleMenuToggle}
          />
          <main style={{ flex:1,overflowY:'auto',padding:'26px 32px 48px',background:t.bg }}>
            <Routes>
              <Route path="/"            element={<TeacherHome />} />
              <Route path="/attendance"  element={<AttendanceManager />} />
              <Route path="/marks-entry" element={<GradeEntrySystem />} />
              <Route path="/marks-view"  element={<ViewMarksSystem />} />
              <Route path="/reports"     element={<ReportsViewer />} />
              <Route path="/news"        element={<NewsFeed userRole="teacher" userId={user?._id} />} />
              <Route path="/roster"      element={<ClassRosterMarkList/>} />
              <Route path="/profile"     element={<StudentProfile />} />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default TeacherDashboard;