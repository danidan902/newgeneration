// AdminDashboard.js - COMPLETE WITH LARGE FULL-SIZE IFRAME
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  ComposedChart
} from 'recharts';

// ===== IMPORTS =====
import ManageStudents from '../student/ManageStudent.js';
import ManageClasses from '../../pages/ManageClass.js';
import ManageTeachers from '../teacher/ManageTeachers.js';
import ManageParents from '../parent/ManageParents.js';
import SystemSettings from '../SystemSitting.js';
import SendNews from './SendNews.js';
import NewsFeed from '../NewsFeed.js';
import SuperAdminRanking from './SuperAdminRanking.js';
import SuperAdminReports from './SuperAdminReport.js';
import StudentQrCode from '../../script/StudentIDCard.js';
import ArchiveManagement from '../Achived/ArchiveManagement.js';
import StudentReportCard from '../Achived/AchiveStudentReportCard.js';
import AchiveStudentReportCard from '../Achived/AchiveStudentReportCard.js';
import StudentProfilePage from '../Achived/AchivedStudentProflie.js';
import FailedStudent from './FailedStudentList.js';
import StudentPaymentFlow from './PaymentGateWay.js';
import ClassCreation from '../../pages/class/ClassCreation.js';
import AssignStudentsModal from '../../pages/class/AssignStudentsModal.js';
import StudentProfileAdmin from './StudentProfileAdmin.js';
import SuperAdminRoster from './SuperAdminRoster.js';
import Exam from './Exam.js';
import EmploymentId from '../teacher/EmploymentId.js';

// ===== ICONS =====
import { 
  LayoutDashboard, Settings, BookOpen, Layers, Users, 
  Briefcase, Landmark, CreditCard, DollarSign, Calendar, 
  MessageSquare, Video, FileText, ChevronDown, Plus, 
  Search, Maximize, Mail, Bell, LogOut, ArrowUpRight,
  TrendingUp, BarChart2, PieChart as PieIcon, MoreHorizontal,
  ChevronLeft, ChevronRight, Menu, X, Sun, Moon, 
  Home, User, UserPlus, School, Award, BarChart3,
  GraduationCap, ClipboardList, Gift, AlertCircle, Archive,
  ExternalLink
} from 'lucide-react';

// ============================================
// 🕐 REAL-TIME ACTIVITY SERVICE
// ============================================
const ACTIVITY_TYPES = {
  TEACHER_ASSIGNED: 'teacher_assigned',
  CLASS_CREATED: 'class_created',
  STUDENT_ENROLLED: 'student_enrolled',
  TEACHER_ADDED: 'teacher_added',
  STUDENT_ADDED: 'student_added',
  PARENT_LINKED: 'parent_linked',
  NEWS_SENT: 'news_sent',
  CLASS_UPDATED: 'class_updated',
  STUDENT_REMOVED: 'student_removed',
  TEACHER_REMOVED: 'teacher_removed'
};

class ActivityService {
  constructor() {
    this.listeners = [];
    this.activities = [];
    this.isInitialized = false;
    this.ws = null;
  }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('🟢 Activity Service initialized');
    this.loadPastActivities();
    this.startSimulatedUpdates();
  }

  async loadPastActivities() {
    try {
      const saved = this.loadFromStorage();
      if (saved) {
        this.activities = saved;
        this.notifyListeners();
        return;
      }
      
      const now = new Date();
      this.activities = [
        {
          id: '1',
          type: ACTIVITY_TYPES.TEACHER_ASSIGNED,
          title: 'Teacher Assigned to Class',
          description: 'Dawit Girma → Mathematics, Grade 10A',
          user: 'Admin System',
          timestamp: new Date(now.getTime() - 2 * 60000),
          details: { teacherName: 'Dawit Girma', className: 'Grade 10A', subject: 'Mathematics' }
        },
        {
          id: '2',
          type: ACTIVITY_TYPES.CLASS_CREATED,
          title: 'New Class Created',
          description: 'Grade 11C — Natural Science',
          user: 'Dr. Alemayehu Tsegaye',
          timestamp: new Date(now.getTime() - 15 * 60000),
          details: { className: 'Grade 11C', program: 'Natural Science' }
        },
        {
          id: '3',
          type: ACTIVITY_TYPES.STUDENT_ENROLLED,
          title: 'Student Enrolled',
          description: 'Selamawit Tesfaye → Grade 8A',
          user: 'Registration Office',
          timestamp: new Date(now.getTime() - 45 * 60000),
          details: { studentName: 'Selamawit Tesfaye', className: 'Grade 8A' }
        }
      ];
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('recentActivities', JSON.stringify(this.activities.slice(0, 100)));
    } catch (e) {}
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('recentActivities');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(a => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
      }
    } catch (e) {}
    return null;
  }

  startSimulatedUpdates() {
    setInterval(() => {
      const newActivity = this.generateRandomActivity();
      this.addActivity(newActivity);
    }, 30000 + Math.random() * 60000);
  }

  generateRandomActivity() {
    const types = [
      ACTIVITY_TYPES.TEACHER_ASSIGNED,
      ACTIVITY_TYPES.CLASS_CREATED,
      ACTIVITY_TYPES.STUDENT_ENROLLED,
      ACTIVITY_TYPES.TEACHER_ADDED,
      ACTIVITY_TYPES.STUDENT_ADDED,
      ACTIVITY_TYPES.NEWS_SENT
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const names = ['Abebe Kebede', 'Meron Tesfaye', 'Biruk Hailu', 'Hanna Wondimu', 'Samuel Getachew', 'Eden Assefa'];
    const classes = ['Grade 9A', 'Grade 10B', 'Grade 11A', 'Grade 12C', 'Grade 8B', 'Grade 7A'];
    const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History'];
    const users = ['Admin System', 'Principal Office', 'Registration Office', 'Academic Office'];
    
    let activity = {
      id: Date.now().toString(),
      type: type,
      timestamp: new Date(),
      user: users[Math.floor(Math.random() * users.length)]
    };

    switch(type) {
      case ACTIVITY_TYPES.TEACHER_ASSIGNED:
        return {
          ...activity,
          title: 'Teacher Assigned to Class',
          description: `${names[Math.floor(Math.random() * names.length)]} → ${subjects[Math.floor(Math.random() * subjects.length)]}, ${classes[Math.floor(Math.random() * classes.length)]}`,
          details: {
            teacherName: names[Math.floor(Math.random() * names.length)],
            className: classes[Math.floor(Math.random() * classes.length)],
            subject: subjects[Math.floor(Math.random() * subjects.length)]
          }
        };
      case ACTIVITY_TYPES.CLASS_CREATED:
        return {
          ...activity,
          title: 'New Class Created',
          description: `${classes[Math.floor(Math.random() * classes.length)]} — ${['Natural Science', 'Social Science', 'Mathematics', 'Language'][Math.floor(Math.random() * 4)]}`,
          details: {
            className: classes[Math.floor(Math.random() * classes.length)],
            program: ['Natural Science', 'Social Science', 'Mathematics', 'Language'][Math.floor(Math.random() * 4)]
          }
        };
      case ACTIVITY_TYPES.STUDENT_ENROLLED:
        return {
          ...activity,
          title: 'Student Enrolled',
          description: `${names[Math.floor(Math.random() * names.length)]} → ${classes[Math.floor(Math.random() * classes.length)]}`,
          details: {
            studentName: names[Math.floor(Math.random() * names.length)],
            className: classes[Math.floor(Math.random() * classes.length)]
          }
        };
      case ACTIVITY_TYPES.TEACHER_ADDED:
        return {
          ...activity,
          title: 'New Teacher Added',
          description: `${names[Math.floor(Math.random() * names.length)]} — ${subjects[Math.floor(Math.random() * subjects.length)]} Teacher`,
          details: {
            teacherName: names[Math.floor(Math.random() * names.length)],
            subject: subjects[Math.floor(Math.random() * subjects.length)]
          }
        };
      case ACTIVITY_TYPES.STUDENT_ADDED:
        return {
          ...activity,
          title: 'New Student Added',
          description: `${names[Math.floor(Math.random() * names.length)]} registered in ${classes[Math.floor(Math.random() * classes.length)]}`,
          details: {
            studentName: names[Math.floor(Math.random() * names.length)],
            className: classes[Math.floor(Math.random() * classes.length)]
          }
        };
      case ACTIVITY_TYPES.NEWS_SENT:
        return {
          ...activity,
          title: 'News Broadcast Sent',
          description: `${['Exam schedule', 'Parent meeting', 'Sports day', 'Academic update'][Math.floor(Math.random() * 4)]} published`,
          details: {
            newsType: ['Exam schedule', 'Parent meeting', 'Sports day', 'Academic update'][Math.floor(Math.random() * 4)]
          }
        };
      default:
        return activity;
    }
  }

  addActivity(activity) {
    const newActivity = {
      ...activity,
      id: activity.id || Date.now().toString(),
      timestamp: activity.timestamp || new Date()
    };
    
    this.activities = [newActivity, ...this.activities];
    this.saveToStorage();
    this.notifyListeners();
    
    toast.success(`📢 ${newActivity.title}`, {
      duration: 3000,
      position: 'top-right'
    });
    
    return newActivity;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.activities);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.activities));
  }

  getActivities() {
    return this.activities;
  }

  clearActivities() {
    this.activities = [];
    localStorage.removeItem('recentActivities');
    this.notifyListeners();
  }
}

const activityService = new ActivityService();
export { activityService, ACTIVITY_TYPES };

// ============================================
// 🎨 THEME TOKENS
// ============================================
const tokens = (dark) => ({
  bg: dark ? '#0B1120' : '#F0F2F5',
  surface: dark ? '#1A2332' : '#FFFFFF',
  glass: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
  glassBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.15)',
  sidebar: dark ? '#0F1729' : '#1E3A8A',
  card: dark ? '#111827' : '#FFFFFF',
  cyan: '#06E5C8',
  violet: '#7C5CFC',
  blue: '#4F8EF7',
  amber: '#F5A623',
  rose: '#F7526A',
  green: '#22D5A6',
  grad1: 'linear-gradient(135deg, #7C5CFC, #4F8EF7)',
  grad2: 'linear-gradient(135deg, #06E5C8, #4F8EF7)',
  grad3: 'linear-gradient(135deg, #F5A623, #F7526A)',
  grad4: 'linear-gradient(135deg, #22D5A6, #06E5C8)',
  text: dark ? '#EEF2FF' : '#0F172A',
  textSub: dark ? '#94A3CF' : '#475569',
  textMuted: dark ? '#4A5580' : '#94A3B8',
  border: dark ? 'rgba(79,142,247,0.12)' : 'rgba(99,102,241,0.12)',
  success: '#22D5A6',
  danger: '#F7526A',
  warning: '#F5A623',
  primary: '#1E3A8A',
  primaryLight: '#2563EB',
  accent: '#D91B24',
  primaryDark: '#0F2EC4',
  accentWarm: '#FF6B35',
  accentGold: '#F59E0B',
  surfaceMid: dark ? '#1A1F3A' : '#F8FAFC',
  surfaceLight: dark ? '#252D4A' : '#F1F5F9',
  surfaceLighter: dark ? '#3D4563' : '#E2E8F0',
  sidebarMid: dark ? '#161B22' : '#1E293B',
  sidebarSurface: dark ? '#1A2138' : '#16263A',
  sidebarBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.10)',
  sidebarText: '#E6EDF3',
  sidebarTextMuted: '#8B949E',
  sidebarTextSub: '#C9D1D9',
  sidebarHover: 'rgba(255,255,255,0.08)',
  topbar: dark ? '#141829' : '#FFFFFF',
  borderDark: dark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(148, 163, 184, 0.8)',
  textDim: dark ? '#484F58' : '#94A3B8',
  gradientBlue: 'linear-gradient(135deg, #1B4FFF 0%, #4F77FF 100%)',
  gradientGreen: 'linear-gradient(135deg, #00D4AA 0%, #10B981 100%)',
  gradientOrange: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%)',
  gradientPurple: 'linear-gradient(135deg, #BC8CFF 0%, #8B5CF6 100%)',
  sidebarActive: '#D91B24',
});

// ============================================
// 🔷 ICONS
// ============================================
const Icon = ({ icon: IconComponent, size = 18, className = "", ...props }) => (
  <IconComponent size={size} className={className} {...props} />
);

// ============================================
// REUSABLE COMPONENTS
// ============================================
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
      background: 'linear-gradient(135deg, #D91B24, #1E3A8A)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#fff',
      fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
      boxShadow: '0 4px 16px rgba(217,27,36,0.4)' }}>
      {initials}
    </div>
  );
};

const GlassCard = ({ children, style, className = '', hover = false }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const t = tokens(isDarkMode);
  return (
    <div className={`glass-card ${hover ? 'card-hover' : ''} ${className}`} 
      style={{ background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: 20, ...style }}>
      {children}
    </div>
  );
};

// ============================================
// 📊 ACTIVITY CHARTS
// ============================================
const ActivityCharts = ({ theme }) => {
  const [dailyActivity, setDailyActivity] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalActivities, setTotalActivities] = useState(0);

  useEffect(() => {
    fetchRealActivityData();
  }, []);

  const fetchRealActivityData = async () => {
    try {
      const [studentsRes, teachersRes, classesRes, adminsRes, parentsRes] = await Promise.all([
        api.get('/users/role/student'),
        api.get('/users/role/teacher'),
        api.get('/classes'),
        api.get('/users/role/admin'),
        api.get('/users/role/parent'),
      ]);

      const studentCount = studentsRes.data.length;
      const teacherCount = teachersRes.data.length;
      const classCount = classesRes.data.length;
      const adminCount = adminsRes.data.length;
      const parentCount = parentsRes.data?.length || 0;
      
      const total = studentCount + teacherCount + classCount + adminCount + parentCount;
      setTotalActivities(total);

      const distributionData = [];
      if (studentCount > 0) distributionData.push({ name: 'Students', value: studentCount, color: '#3FB950' });
      if (teacherCount > 0) distributionData.push({ name: 'Teachers', value: teacherCount, color: '#58A6FF' });
      if (classCount > 0) distributionData.push({ name: 'Classes', value: classCount, color: '#F5A623' });
      if (adminCount > 0) distributionData.push({ name: 'Admins', value: adminCount, color: '#FF6B35' });
      if (parentCount > 0) distributionData.push({ name: 'Parents', value: parentCount, color: '#BC8CFF' });
      
      setActivityData(distributionData);

      const dailyData = [];
      const now = new Date();
      
      const activityItems = [];
      studentsRes.data.forEach(() => activityItems.push({ type: 'student' }));
      teachersRes.data.forEach(() => activityItems.push({ type: 'teacher' }));
      classesRes.data.forEach(() => activityItems.push({ type: 'class' }));
      adminsRes.data.forEach(() => activityItems.push({ type: 'admin' }));
      parentsRes.data.forEach(() => activityItems.push({ type: 'parent' }));

      const totalItems = activityItems.length || 30;

      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dayTotal = Math.max(1, Math.floor(totalItems / 30) + Math.floor(Math.random() * 3));
        const studentDay = Math.floor(dayTotal * (studentCount / (totalItems || 1)));
        const teacherDay = Math.floor(dayTotal * (teacherCount / (totalItems || 1)));
        const classDay = Math.floor(dayTotal * (classCount / (totalItems || 1)));
        const adminDay = Math.floor(dayTotal * (adminCount / (totalItems || 1)));
        const parentDay = Math.floor(dayTotal * (parentCount / (totalItems || 1)));

        dailyData.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          total: dayTotal,
          student: Math.min(studentDay, 8),
          teacher: Math.min(teacherDay, 5),
          class: Math.min(classDay, 4),
          admin: Math.min(adminDay, 3),
          parent: Math.min(parentDay, 3),
        });
      }
      setDailyActivity(dailyData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(27,79,255,0.2)', borderTopColor: '#1B4FFF' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="edu-card rounded-3xl p-6 backdrop-blur-xl" style={{ background: theme.surface, borderColor: theme.border }}>
        <h3 className="font-bold text-base mb-6" style={{ color: theme.text }}>📈 Daily Activity Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dailyActivity}>
            <defs>
              <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B4FFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1B4FFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.borderDark} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: theme.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: theme.surface, border: `2px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 12 }}
              cursor={{ fill: 'rgba(27,79,255,0.06)' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: theme.textMuted }} />
            <Area type="monotone" dataKey="total" fill="url(#activityGrad)" stroke="#1B4FFF" strokeWidth={2.5} name="Total Activities" dot={{ fill: '#1B4FFF', r: 3, strokeWidth: 0 }} />
            <Line type="monotone" dataKey="student" stroke="#3FB950" strokeWidth={2} name="Students" dot={{ fill: '#3FB950', r: 2, strokeWidth: 0 }} />
            <Line type="monotone" dataKey="teacher" stroke="#58A6FF" strokeWidth={2} name="Teachers" dot={{ fill: '#58A6FF', r: 2, strokeWidth: 0 }} />
            <Line type="monotone" dataKey="class" stroke="#F5A623" strokeWidth={2} name="Classes" dot={{ fill: '#F5A623', r: 2, strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="edu-card rounded-3xl p-6 backdrop-blur-xl" style={{ background: theme.surface, borderColor: theme.border }}>
        <h3 className="font-bold text-base mb-6" style={{ color: theme.text }}>📊 Distribution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={theme.borderDark} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: theme.surface, border: `2px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 12 }}
                  cursor={{ fill: 'rgba(27,79,255,0.06)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {activityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: theme.textDim }}
                >
                  {activityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: theme.surface, border: `2px solid ${theme.border}`, borderRadius: 12, color: theme.text }}
                  formatter={(value, name) => [`${value} items`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {activityData.map((item) => (
            <div key={item.name} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: theme.bg }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-sm flex-1" style={{ color: theme.textSub }}>{item.name}</span>
              <span className="text-sm font-bold" style={{ color: theme.text }}>{item.value}</span>
              <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: theme.borderDark }}>
                <div className="h-full rounded-full" style={{ width: `${(item.value / totalActivities) * 100}%`, background: item.color }} />
              </div>
              <span className="text-xs w-12 text-right" style={{ color: theme.textMuted }}>
                {((item.value / totalActivities) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎨 STAT CARD
// ============================================
const StatCard = ({ label, value, icon: IconComponent, color, sub, theme }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
    red: { bg: 'bg-red-50', text: 'text-red-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500' },
  };
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5"
      style={{ background: theme.surface, borderColor: theme.border }}>
      <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}
        style={{ background: color === 'emerald' ? 'rgba(16,185,129,0.1)' : 
                color === 'blue' ? 'rgba(37,99,235,0.1)' :
                color === 'red' ? 'rgba(217,27,36,0.1)' :
                'rgba(245,158,11,0.1)' }}>
        <IconComponent className={`w-6 h-6 ${colors.text}`} 
          style={{ color: color === 'emerald' ? '#10B981' : 
                  color === 'blue' ? '#2563EB' :
                  color === 'red' ? '#D91B24' :
                  '#F59E0B' }} />
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-400 block tracking-wider uppercase"
          style={{ color: theme.textMuted }}>{label}</span>
        <span className="text-xl font-bold" style={{ color: theme.text }}>{value}</span>
      </div>
    </div>
  );
};

// ============================================
// 📅 CALENDAR WIDGET
// ============================================
const CalendarWidget = ({ theme }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weeks = [];
  let day = 1 - firstDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) { week.push(day >= 1 && day <= daysInMonth ? day : null); day++; }
    weeks.push(week);
  }

  return (
    <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
      style={{ background: theme.surface, borderColor: theme.border }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg" style={{ color: theme.text }}>Event Calendar</h3>
        <div className="flex items-center gap-1.5">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600"
            style={{ color: theme.textMuted }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600"
            style={{ color: theme.textMuted }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="font-bold text-sm mb-4" style={{ color: theme.primary }}>{monthName}</p>

      <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-semibold mb-1" style={{ color: theme.textMuted }}>{day}</div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const dayNum = i + 1;
          const isToday = dayNum === today.getDate();
          return (
            <div 
              key={i} 
              className={`p-2 rounded-lg font-medium cursor-pointer transition-all ${
                isToday ? 'text-white font-bold' : ''
              }`}
              style={{
                background: isToday ? '#D91B24' : 'transparent',
                color: isToday ? '#fff' : theme.text,
              }}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// 🌟 SUPER ADMIN HOME
// ============================================
const SuperAdminHome = ({ isSuperAdmin = false, theme, isDarkMode }) => {
  const [stats, setStats] = useState({ teachers: 0, students: 0, classes: 0, admins: 0, maleStudents: 0, femaleStudents: 0, parents: 0 });
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [programDistribution, setProgramDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentActivity, setStudentActivity] = useState([]);
  const [genderData, setGenderData] = useState({ male: 0, female: 0 });
  const [classData, setClassData] = useState([]);

  useEffect(() => {
    fetchStats();
    if (isSuperAdmin) {
      fetchGradeDistribution();
      fetchProgramDistribution();
      fetchStudentActivity();
      fetchGenderData();
      fetchClassData();
    }
  }, [isSuperAdmin]);

  const hour = new Date().getHours();
  let message = "";
  if (hour >= 5 && hour < 12) message = "Good Morning";
  else if (hour >= 12 && hour < 17) message = "Good Afternoon";
  else if (hour >= 17 && hour < 21) message = "Good Evening";
  else message = "Good Night";

  const fetchStats = async () => {
    try {
      const [teachers, students, classes, admins, parents] = await Promise.all([
        api.get('/users/role/teacher'),
        api.get('/users/role/student'),
        api.get('/classes'),
        api.get('/users/role/admin'),
        api.get('/users/role/parent'),
      ]);
      setStats({
        teachers: teachers.data.length,
        students: students.data.length,
        classes: classes.data.length,
        admins: admins.data.length,
        parents: parents.data?.length || 0,
        maleStudents: students.data.filter(s => s.sex === 'Male').length,
        femaleStudents: students.data.filter(s => s.sex === 'Female').length,
      });
    } catch { toast.error('Failed to load statistics'); }
  };

  const fetchGradeDistribution = async () => {
    try {
      const res = await api.get('/users/role/student');
      const map = {};
      res.data.forEach(s => { const g = s.grade || 'Unassigned'; map[g] = (map[g] || 0) + 1; });
      setGradeDistribution(Object.entries(map).map(([grade, count]) => ({ grade, count })).sort((a, b) => b.count - a.count));
    } catch { /* silent */ }
  };

  const fetchProgramDistribution = async () => {
    try {
      const res = await api.get('/users/role/student');
      const map = {};
      res.data.forEach(s => { const p = s.programs || 'Unassigned'; map[p] = (map[p] || 0) + 1; });
      setProgramDistribution(Object.entries(map).map(([program, count]) => ({ program, count })).sort((a, b) => b.count - a.count));
      setLoading(false);
    } catch { setLoading(false); }
  };

  const fetchStudentActivity = async () => {
    try {
      const res = await api.get('/users/role/student');
      const now = new Date();
      const activityData = [];
      const totalStudents = res.data.length || 50;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dayTotal = Math.max(2, Math.floor(totalStudents / 30) + Math.floor(Math.random() * 5));
        const activeStudents = Math.max(1, dayTotal - Math.floor(Math.random() * 3));
        const newStudents = Math.floor(Math.random() * 2);
        
        activityData.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          active: activeStudents,
          new: newStudents,
          total: dayTotal,
        });
      }
      setStudentActivity(activityData);
    } catch (error) {
      console.error('Error fetching student activity:', error);
    }
  };

  const fetchGenderData = async () => {
    try {
      const res = await api.get('/users/role/student');
      const male = res.data.filter(s => s.sex === 'Male').length;
      const female = res.data.filter(s => s.sex === 'Female').length;
      setGenderData({ male, female });
    } catch (error) {
      console.error('Error fetching gender data:', error);
    }
  };

  const fetchClassData = async () => {
    try {
      const res = await api.get('/classes');
      const data = res.data.map((cls, index) => ({
        name: cls.name || `Class ${index + 1}`,
        students: cls.students?.length || Math.floor(Math.random() * 30) + 10,
        grade: cls.grade || 'Unassigned',
      }));
      setClassData(data);
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const GRADE_COLORS = ['#1B4FFF','#00D4AA','#F5A623','#FF6B35','#BC8CFF','#58A6FF','#3FB950','#F85149','#4FC3F7','#81C784'];
  const PROGRAM_COLORS = ['#00D4AA','#BC8CFF','#F5A623','#FF6B35','#1B4FFF','#F85149','#58A6FF','#3FB950','#F06292','#FFB74D'];

  const maxActive = Math.max(...studentActivity.map(d => d.active), 1);
  const maxTotal = Math.max(...studentActivity.map(d => d.total), 1);
  const maxNew = Math.max(...studentActivity.map(d => d.new), 1);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-3 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(27,79,255,0.2)', borderTopColor: '#1B4FFF' }} />
        <p className="text-sm" style={{ color: theme.textMuted }}>Loading super admin dashboard...</p>
      </div>
    </div>
  );

  const totalStudents = stats.maleStudents + stats.femaleStudents;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
          {message}, Super Admin
        </h1>
        <div className="w-12 h-1 bg-[#D91B24] mt-1.5 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Students" value={stats.students} icon={Users} color="emerald" theme={theme} />
        <StatCard label="Teachers" value={stats.teachers} icon={Briefcase} color="blue" theme={theme} />
        <StatCard label="Classes" value={stats.classes} icon={BookOpen} color="red" theme={theme} />
        <StatCard label="Parents" value={stats.parents} icon={Users} color="amber" theme={theme} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: theme.text }}>Student Activity</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
          <div className="flex gap-6 text-xs mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
              <span className="text-gray-500">Active Students</span>
              <span className="font-bold text-gray-800">{stats.students}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="text-gray-500">New Enrollments</span>
              <span className="font-bold text-gray-800">{Math.floor(stats.students * 0.12)}</span>
            </div>
          </div>
          <div className="h-56 relative w-full border-b border-l border-gray-200 border-dashed flex items-end">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
              <path d={studentActivity.map((d, i) => {
                const x = (i / 29) * 400;
                const y = 150 - (d.active / maxTotal * 130);
                return `${i === 0 ? 'M' : 'L'}${x},${y}`;
              }).join(' ')} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
              <circle cx="400" cy={150 - (studentActivity[29]?.active / maxTotal * 130 || 20)} r="4" fill="#1d4ed8" />
              
              <path d={studentActivity.map((d, i) => {
                const x = (i / 29) * 400;
                const y = 150 - (d.new / maxTotal * 130);
                return `${i === 0 ? 'M' : 'L'}${x},${y}`;
              }).join(' ')} fill="none" stroke="#ef4444" strokeWidth="2.5" />
              <circle cx="400" cy={150 - (studentActivity[29]?.new / maxTotal * 130 || 5)} r="4" fill="#ef4444" />
            </svg>
            <div className="absolute left-1 bottom-0 right-0 flex justify-between text-[10px] text-gray-400 pt-1">
              {studentActivity.filter((_, i) => i % 4 === 0 || i === 29).map(d => (
                <span key={d.date}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: theme.text }}>Class Distribution</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 mb-6 border-b pb-2">
            <div>
              <p className="font-medium text-emerald-500">{Math.max(...classData.map(c => c.students), 0)}</p>
              <p className="text-[9px]">Largest</p>
            </div>
            <div>
              <p className="font-medium text-blue-600">{Math.floor(classData.reduce((sum, c) => sum + c.students, 0) / classData.length || 0)}</p>
              <p className="text-[9px]">Average</p>
            </div>
            <div>
              <p className="font-medium text-red-500">{Math.min(...classData.map(c => c.students), 0)}</p>
              <p className="text-[9px]">Smallest</p>
            </div>
          </div>
          <div className="h-44 flex items-end justify-around gap-2 px-4">
            {classData.slice(0, 8).map((cls, index) => (
              <div 
                key={index} 
                className="w-6 rounded-t-sm hover:opacity-90 transition-all"
                style={{ 
                  height: `${(cls.students / Math.max(...classData.map(c => c.students), 1)) * 100}%`,
                  background: index % 3 === 0 ? '#34d399' : index % 3 === 1 ? '#2563eb' : '#ef4444',
                }} 
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between"
          style={{ background: theme.surface, borderColor: theme.border }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: theme.text }}>Gender</h3>
              <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
            <div className="flex justify-center my-2">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path 
                    className="text-blue-600" 
                    strokeDasharray={`${totalStudents > 0 ? (genderData.male / totalStudents) * 100 : 0}, 100`} 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                  <path 
                    className="text-red-500" 
                    strokeDasharray={`${totalStudents > 0 ? (genderData.female / totalStudents) * 100 : 0}, 100`} 
                    strokeDashoffset={`-${totalStudents > 0 ? (genderData.male / totalStudents) * 100 : 0}`} 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 mt-2 text-xs">
            <div className="text-center">
              <p className="text-gray-400 font-medium">Male</p>
              <p className="font-bold text-gray-800">{genderData.male}</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-gray-400 font-medium">Female</p>
              <p className="font-bold text-gray-800">{genderData.female}</p>
            </div>
          </div>
        </div>
      </div>

      <ActivityCharts theme={theme} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="font-bold text-lg mb-6" style={{ color: theme.text }}>📊 Students by Grade</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={gradeDistribution} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={theme.borderDark} vertical={false} />
              <XAxis dataKey="grade" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: theme.surface, border: `2px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 12 }}
                cursor={{ fill: 'rgba(27,79,255,0.06)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {gradeDistribution.map((entry, index) => (
                  <Cell key={index} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="font-bold text-lg mb-6" style={{ color: theme.text }}>📊 Students by Program</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={programDistribution} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={theme.borderDark} vertical={false} />
              <XAxis dataKey="program" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: theme.surface, border: `2px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 12 }}
                cursor={{ fill: 'rgba(27,79,255,0.06)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {programDistribution.map((entry, index) => (
                  <Cell key={index} fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <CalendarWidget theme={theme} />
        
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between"
          style={{ background: theme.surface, borderColor: theme.border }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: theme.text }}>Reminders</h3>
              <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
            <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded-r-lg mb-4"
              style={{ background: 'rgba(6,229,200,0.08)', borderColor: '#06E5C8' }}>
              <span className="text-[10px] text-white font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: '#06E5C8' }}>
                16 June, 2021
              </span>
              <p className="text-sm mt-2 font-medium" style={{ color: theme.text }}>Staff Meeting</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textMuted }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
              </p>
            </div>
          </div>
          <div className="border border-dashed border-gray-200 rounded-lg p-3 text-center text-xs text-gray-400"
            style={{ borderColor: theme.border, color: theme.textMuted }}>
            + Add a new task reminder
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm"
        style={{ background: theme.surface, borderColor: theme.border }}>
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ color: theme.text }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'Add Student', color: '#10B981', href: '/admin/students' },
            { label: 'Add Teacher', color: '#2563EB', href: '/admin/teachers' },
            { label: 'Create Class', color: '#D91B24', href: '/admin/classes' },
            { label: 'Add Parent', color: '#8B5CF6', href: '/admin/parents' },
            { label: 'Send News', color: '#06E5C8', href: '/admin/send-news' },
            { label: 'View Reports', color: '#F59E0B', href: '/admin/reports' },
          ].map((action) => (
            <button key={action.label} onClick={() => window.location.href = action.href}
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl text-xs font-bold transition-all hover:scale-110 hover:shadow-lg"
              style={{
                background: `rgba(${action.color === '#10B981' ? '16,185,129' : 
                              action.color === '#2563EB' ? '37,99,235' :
                              action.color === '#D91B24' ? '217,27,36' :
                              action.color === '#8B5CF6' ? '139,92,246' :
                              action.color === '#06E5C8' ? '6,229,200' :
                              '245,158,11'}, 0.12)`,
                color: action.color,
                border: `2px solid rgba(${action.color === '#10B981' ? '16,185,129' : 
                              action.color === '#2563EB' ? '37,99,235' :
                              action.color === '#D91B24' ? '217,27,36' :
                              action.color === '#8B5CF6' ? '139,92,246' :
                              action.color === '#06E5C8' ? '6,229,200' :
                              '245,158,11'}, 0.25)`,
              }}>
              <span className="text-xl">+</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 👑 MANAGE ADMINS
// ============================================
const ManageAdmins = ({ theme }) => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/users/role/admin');
      setAdmins(res.data);
    } catch (err) {
      if (err.response?.status === 403) toast.error('Access denied');
      else if (err.response?.status === 401) { toast.error('Session expired'); localStorage.clear(); window.location.href = '/login'; }
      else toast.error('Failed to fetch admins');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return toast.error('Please fill all fields');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/users', { ...formData, role: 'admin' });
      toast.success('Admin created successfully');
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchAdmins();
    } catch (err) {
      if (err.response?.status === 409) toast.error('Email already exists');
      else toast.error(err.response?.data?.error || 'Failed to create admin');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    const current = JSON.parse(localStorage.getItem('user'));
    if (current?._id === id) return toast.error('Cannot delete your own account');
    const target = admins.find(a => a._id === id);
    if (target?.role === 'superadmin') return toast.error('Cannot delete Super Admin');
    if (!window.confirm(`Delete ${target?.name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Admin deleted');
      setAdmins(admins.filter(a => a._id !== id));
    } catch { toast.error('Failed to delete admin'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}> Administrators</h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Manage system administrator accounts</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setFormData({ name: '', email: '', password: '' }); }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{
            background: showForm ? 'rgba(248,81,73,0.15)' : 'rgba(27,79,255,0.15)',
            color: showForm ? '#F85149' : '#2563EB',
            border: showForm ? '2px solid rgba(248,81,73,0.3)' : '2px solid rgba(37,99,235,0.3)',
          }}>
          {showForm ? '✕ Cancel' : '+ Add Admin'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm" style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="font-bold mb-6" style={{ color: theme.text }}>Create New Administrator</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                { field: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { field: 'email', label: 'Email Address', type: 'email', placeholder: 'john@school.edu' },
                { field: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: theme.textMuted }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={formData[field]}
                    onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: theme.bg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text,
                    }}
                    required />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(63,185,80,0.15)', color: '#3FB950', border: '2px solid rgba(63,185,80,0.25)' }}>
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: theme.textMuted, border: `2px solid ${theme.border}` }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
        style={{ background: theme.surface, borderColor: theme.border }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: theme.border }}>
          <h3 className="font-bold text-sm" style={{ color: theme.textSub }}>
            {admins.length} Administrator{admins.length !== 1 ? 's' : ''}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: theme.bg }}>
                {['Name', 'Email', 'Role', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: theme.textDim }}>No administrators found</td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin._id} className="transition-colors hover:bg-white/[0.02] border-b" style={{ borderColor: theme.border }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg font-bold text-sm flex items-center justify-center flex-shrink-0"
                        style={{ background: admin.role === 'superadmin' ? 'rgba(188,140,255,0.15)' : 'rgba(27,79,255,0.15)', color: admin.role === 'superadmin' ? '#BC8CFF' : '#1B4FFF' }}>
                        {admin.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold" style={{ color: theme.text }}>{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs" style={{ color: theme.textMuted }}>{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{
                        background: admin.role === 'superadmin' ? 'rgba(188,140,255,0.2)' : 'rgba(27,79,255,0.2)',
                        color: admin.role === 'superadmin' ? '#BC8CFF' : '#1B4FFF',
                      }}>
                      {admin.role === 'superadmin' ? '⭐ Super Admin' : 'Admin'}
                    </span> 
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(admin._id)}
                      disabled={admin.role === 'superadmin'}
                      className="text-xs px-3 py-2 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'rgba(248,81,73,0.15)', color: '#F85149', border: '2px solid rgba(248,81,73,0.25)' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🏠 THEME CONTEXT
// ============================================
const ThemeContext = createContext({ isDarkMode: true, toggleTheme: () => {} });

// ============================================
// 📄 LARGE FULL-SIZE IFRAME PAGE COMPONENT
// ============================================
const IframePage = ({ title, description, url, icon: IconComponent }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Small Header - Just title and description */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold" style={{ color: tokens(false).text }}>{title}</h2>
              <p className="text-gray-500 text-sm">{description}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.open(url, '_blank')}
          className="px-4 py-2 bg-[#D91B24] text-white rounded-lg text-sm font-medium hover:bg-[#b0161e] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </button>
      </div>

      {/* LARGE FULL-SIZE IFRAME - Takes almost all available space */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative" style={{ minHeight: '80vh', height: 'calc(100vh - 180px)' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin" 
                   style={{ borderColor: 'rgba(217,27,36,0.3)', borderTopColor: '#D91B24' }} />
              <p className="text-gray-500 text-sm font-medium">Loading {title}...</p>
              <p className="text-gray-400 text-xs">Please wait while the page loads</p>
            </div>
          </div>
        )}
        
        <iframe
          src={url}
          title={title}
          className="w-full h-full"
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

// ============================================
// 📄 ONLINE ADMISSION PAGE COMPONENTS
// ============================================
const AdmissionPortalPage = () => (
  <IframePage 
    title="Admission Portal"
    description="Manage student admissions online"
    url="https://www.tuludimtuschool.com/admission-portal"
    icon={BookOpen}
  />
);

const AcademicDashboardPage = () => (
  <IframePage 
    title="Academic Dashboard"
    description="Academic management dashboard"
    url="https://www.tuludimtuschool.com/acadamics-dashboard"
    icon={GraduationCap}
  />
);

const SchoolContactPage = () => (
  <IframePage 
    title="School Contact"
    description="Contact information management dashboard"
    url="https://www.tuludimtuschool.com/contact-school-port"
    icon={School}
  />
);

const StudentCounselingPage = () => (
  <IframePage 
    title="Student Counseling"
    description="Student counseling services"
    url="https://www.tuludimtuschool.com/student-councle-port"
    icon={User}
  />
);

const SchoolVisitorPage = () => (
  <IframePage 
    title="School Visitor"
    description="Track school visitors"
    url="https://www.tuludimtuschool.com/dashbord-visitor"
    icon={Users}
  />
);

const DirectorNewsPage = () => (
  <IframePage 
    title="Director News"
    description="News and announcements from the director"
    url="https://www.tuludimtuschool.com/director-news"
    icon={MessageSquare}
  />
);

// ============================================
// 🏠 MAIN ADMIN DASHBOARD
// ============================================
const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [expandedMenus, setExpandedMenus] = useState({ 
    classes: false,
    onlineAdmission: false,
    archive: false
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const navigate = useNavigate();
  const location = useLocation();

  // ===== MOBILE SIDEBAR EFFECTS =====
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode activated`);
  };

  const t = tokens(isDarkMode);
  const isSuperAdmin = user?.role === 'superadmin';

  const toggleDropdown = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const closeDropdown = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: false
    }));
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    const handleResize = () => { if (window.innerWidth >= 1024) setMobileSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const notifications = [
    { id: 1, title: 'New student enrolled', detail: 'Abebe Kebede joined Grade 9B', time: '5m ago', color: '#3FB950' },
    { id: 2, title: 'Report ready', detail: 'Monthly attendance report generated', time: '1h ago', color: '#58A6FF' },
    { id: 3, title: 'Class schedule updated', detail: 'Grade 10A timetable changed', time: '3h ago', color: '#F5A623' },
  ];

  // ===== MENU ITEMS =====
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: "", hasSub: false },
    { name: 'Student Profile', icon: User, path: "profile", hasSub: true },
    
    {
      name: 'Manage Class',
      icon: BookOpen,
      path: null,
      hasSub: true,
      isDropdown: true,
      dropdownKey: 'classes',
      subItems: [
        { name: 'All Classes', path: "classes" },
        { name: 'Create Class', path: "class" },
      ]
    },
    
    {
      name: 'Online Admission',
      icon: BookOpen,
      path: null,
      hasSub: true,
      isDropdown: true,
      dropdownKey: 'onlineAdmission',
      subItems: [
        { name: 'Admission Portal', path: "admission-portal" },
        { name: 'Academic Dashboard', path: "academic-dashboard" },
        { name: 'School Contact', path: "school-contact" },
        { name: 'Student Counseling', path: "student-counseling" },
        { name: 'School Visitor', path: "school-visitor" },
        { name: 'Director News', path: "director-news" },
      ]
    },
    
    { name: 'Manage Student', icon: Users, path: "students", hasSub: true },
    { name: 'Manage Teachers', icon: Briefcase, path: "teachers", hasSub: true },
    { name: 'Manage Parents', icon: Users, path: "parents", hasSub: true },
    { name: 'Admins Management', icon: Layers, path: "admins", hasSub: true },
    { name: 'Employment ID', icon: User, path: "employmentId", hasSub: false },
    { name: 'Payment Management', icon: CreditCard, path: "payment", hasSub: true },
    { name: 'Exams Management', icon: FileText, path: "exam", hasSub: true },
    { name: 'Student Report Card', icon: Award, path: "ranking", hasSub: true },
    { name: 'Student ID Card', icon: Gift, path: "student-qr-codes", hasSub: false },
    { name: 'Class Roster', icon: Gift, path: "roster", hasSub: false },
    { name: 'Timetable', icon: Calendar, path: "timetable", hasSub: true },
    { name: 'Messaging', icon: MessageSquare, path: "send-news", hasSub: false },
    { name: 'Student Reports', icon: BarChart2, path: "reports", hasSub: true },
    
    {
      name: 'Archive Student',
      icon: Archive,
      path: null,
      hasSub: true,
      isDropdown: true,
      dropdownKey: 'archive',
      subItems: [
        { name: 'Archive Class', path: "achived" },
        { name: 'Student Report Card', path: "achive-student" },
        { name: 'Student Profile', path: "achive-profile" },
        { name: 'Failed Student', path: "failed-student" }
      ]
    },
    { name: 'General Settings', icon: Settings, path: "settings", hasSub: true },
  ];

  const filteredMenuItems = isSuperAdmin ? menuItems : menuItems.filter(item => 
    !['General Settings', 'Accounts', 'Fees', 'Salary', 'Reports', 'Ranking'].includes(item.name)
  );

  const isActive = (path) => {
    if (!path) return false;
    const base = '/admin';
    if (path === "") return location.pathname === base || location.pathname === `${base}/`;
    return location.pathname === `${base}/${path}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleLinkClick = () => { 
    if (window.innerWidth < 1024) setMobileSidebarOpen(false); 
  };

  const dashboardTheme = {
    primary: '#1E3A8A',
    primaryDark: '#0F2EC4',
    primaryLight: '#2563EB',
    accent: '#D91B24',
    accentWarm: '#FF6B35',
    accentGold: '#F59E0B',
    bg: t.bg,
    surface: t.surface,
    surfaceMid: t.surfaceMid,
    surfaceLight: t.surfaceLight,
    surfaceLighter: t.surfaceLighter,
    sidebar: t.sidebar,
    sidebarMid: t.sidebarMid,
    sidebarSurface: t.sidebarSurface,
    sidebarBorder: t.sidebarBorder,
    sidebarText: t.sidebarText,
    sidebarTextMuted: t.sidebarTextMuted,
    sidebarTextSub: t.sidebarTextSub,
    sidebarHover: t.sidebarHover,
    topbar: t.topbar,
    border: t.border,
    borderDark: t.borderDark,
    text: t.text,
    textSub: t.textSub,
    textMuted: t.textMuted,
    textDim: t.textDim,
    success: t.success,
    warning: t.warning,
    danger: t.danger,
    info: '#3B82F6',
    gradientBlue: t.gradientBlue,
    gradientGreen: t.gradientGreen,
    gradientOrange: t.gradientOrange,
    gradientPurple: t.gradientPurple,
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className="flex h-screen overflow-hidden" style={{ background: t.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

        {/* ===== MOBILE TOP BAR: LOGO LEFT · TOGGLE · HAMBURGER RIGHT ===== */}
        <div className="mobile-topbar">
          {/* School logo (LEFT) */}
          <div className="mobile-logo-wrap">
            <div className="mobile-logo-circle">🎓</div>
            <div className="mobile-logo-text">
              <span className="mobile-logo-title">New Generation</span>
              <span className="mobile-logo-sub">SCHOOL</span>
            </div>
          </div>

          {/* Right side: toggle + hamburger */}
          <div className="mobile-topbar-right">
            <button
              onClick={toggleTheme}
              className="mobile-theme-toggle"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              className={`hamburger-btn ${mobileSidebarOpen ? 'is-open' : ''}`}
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        {/* ===== MOBILE OVERLAY ===== */}
        <div
          className={`sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        <aside className={`
          admin-sidebar-mobile
          fixed lg:relative z-50 h-full flex flex-col flex-shrink-0
          transition-all duration-300 ease-out
          ${mobileSidebarOpen ? 'open' : ''}
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          lg:left-0
        `} style={{ background: t.sidebar, boxShadow: '4px 0 24px rgba(0,0,0,0.25)' }}>

          <div className="h-16 flex items-center px-4 justify-between" style={{ background: '#D91B24' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full border-2 border-white flex items-center justify-center font-bold text-red-600 text-lg shadow-inner">
                🎓
              </div>
              <div>
                <span className="text-white text-xs font-bold block uppercase leading-none">New Generation</span>
                <span className="text-white text-[10px] opacity-80 block tracking-wider">SCHOOL</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:opacity-80 hidden lg:block"
            >
              {sidebarCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-90"
              style={{ background: 'rgba(255,255,255,0.18)' }}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul>
              {filteredMenuItems.map((item) => {
                const active = isActive(item.path);
                const isDropdown = item.isDropdown;
                const isExpanded = isDropdown ? expandedMenus[item.dropdownKey] || false : false;
                
                const isSubActive = item.subItems?.some(sub => 
                  location.pathname === `/admin/${sub.path}`
                ) || false;
                
                return (
                  <li key={item.name}>
                    {isDropdown ? (
                      <div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (item.dropdownKey) {
                              toggleDropdown(item.dropdownKey);
                            }
                          }}
                          className={`flex items-center justify-between w-full px-6 py-3 text-sm transition-colors group ${
                            isSubActive
                              ? 'bg-[#1e293b]/30 text-white font-medium border-l-4 border-red-500' 
                              : 'text-gray-300 hover:bg-[#1E293B]/20 hover:text-white'
                          }`}
                          style={{
                            background: isSubActive ? 'rgba(30,41,59,0.3)' : 'transparent',
                            borderLeftColor: isSubActive ? '#D91B24' : 'transparent',
                            color: isSubActive ? '#fff' : t.sidebarTextMuted,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 ${isSubActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            {!sidebarCollapsed && <span>{item.name}</span>}
                          </div>
                          {!sidebarCollapsed && (
                            <Plus className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform duration-200 ${
                              isExpanded ? 'rotate-45' : ''
                            }`} />
                          )}
                        </button>
                        
                        {!sidebarCollapsed && isExpanded && (
                          <ul className="ml-6 mt-1 space-y-1 border-l border-gray-700/30 pl-3">
                            {item.subItems.map((subItem) => {
                              const isSubActive = location.pathname === `/admin/${subItem.path}`;
                              
                              return (
                                <li key={subItem.path}>
                                  <Link
                                    to={`/admin/${subItem.path}`}
                                    onClick={() => {
                                      if (window.innerWidth < 1024) {
                                        setMobileSidebarOpen(false);
                                      }
                                      if (item.dropdownKey) {
                                        closeDropdown(item.dropdownKey);
                                      }
                                    }}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                                      isSubActive
                                        ? 'bg-red-500/20 text-white font-medium'
                                        : 'text-gray-400 hover:bg-[#1E293B]/20 hover:text-white'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                    {subItem.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={`/admin/${item.path}`}
                        onClick={handleLinkClick}
                        className={`flex items-center justify-between px-6 py-3 text-sm transition-colors group ${
                          active 
                            ? 'bg-[#1e293b]/30 text-white font-medium border-l-4 border-red-500' 
                            : 'text-gray-300 hover:bg-[#1E293B]/20 hover:text-white'
                        }`}
                        style={{
                          background: active ? 'rgba(30,41,59,0.3)' : 'transparent',
                          borderLeftColor: active ? '#D91B24' : 'transparent',
                          color: active ? '#fff' : t.sidebarTextMuted,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                          {!sidebarCollapsed && <span>{item.name}</span>}
                        </div>
                        {!sidebarCollapsed && item.hasSub && (
                          <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="dashboard-content-wrap flex-1 flex flex-col overflow-hidden relative" style={{ background: t.bg }}>

          <header className="desktop-header h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20 flex-shrink-0"
            style={{ background: t.topbar, borderColor: t.border }}>
            <div className="flex items-center gap-6 w-96">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  style={{
                    background: t.bg,
                    borderColor: t.border,
                    color: t.text,
                  }}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button className="text-gray-400 hover:text-gray-600" style={{ color: t.textMuted }}>
                <Maximize className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-6 relative">
              <button className="relative hover:opacity-80" style={{ color: '#D91B24' }}>
                <Mail className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
              </button>
              
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative hover:opacity-80" 
                style={{ color: '#D91B24' }}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">5</span>
              </button>

              <span className="h-6 w-px bg-gray-200" style={{ background: t.border }}></span>

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg transition-all hover:scale-110"
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: isDarkMode ? '#FDB813' : '#1E3A8A',
                }}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                    alt="Admin profile"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showProfileDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-40"
                      style={{ background: t.surface, borderColor: t.border }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: t.border }}>
                        <p className="text-sm font-bold" style={{ color: t.text }}>{user?.name}</p>
                        <p className="text-xs" style={{ color: t.textMuted }}>{user?.email}</p>
                      </div>
                      <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5"
                        style={{ color: t.text }}
                        onClick={() => { setShowProfileDropdown(false); navigate('/admin/settings'); }}>
                        <Settings className="w-4 h-4 text-gray-500" />
                        Account Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 border-t border-gray-100"
                        style={{ color: '#D91B24', borderColor: t.border }}>
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute top-16 right-8 mt-2 w-80 rounded-xl z-40 overflow-hidden shadow-xl border"
                style={{ background: t.surface, borderColor: t.border }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: t.border }}>
                  <p className="font-bold text-sm" style={{ color: t.text }}>Notifications</p>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#D91B24', color: '#fff' }}>
                    {notifications.length} new
                  </span>
                </div>
                <div>
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-white/5" style={{ borderColor: t.border }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold" style={{ color: t.text }}>{n.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{n.detail}</p>
                      </div>
                      <span className="text-[10px] flex-shrink-0" style={{ color: t.textDim }}>{n.time}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 text-xs font-bold transition-colors hover:bg-white/5" style={{ color: '#D91B24' }}>
                  View all notifications
                </button>
              </div>
            </>
          )}

          <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <Routes>
              <Route path="/" element={<SuperAdminHome isSuperAdmin={isSuperAdmin} theme={dashboardTheme} isDarkMode={isDarkMode} />} />
              <Route path="teachers" element={<ManageTeachers isSuperAdmin={isSuperAdmin} />} />
              <Route path="students" element={<ManageStudents isSuperAdmin={isSuperAdmin} />} />
              <Route path="parents" element={<ManageParents isSuperAdmin={isSuperAdmin} userRole={user?.role} />} />
              <Route path="classes" element={<ManageClasses isSuperAdmin={isSuperAdmin} />} />
              <Route path="roster" element={<SuperAdminRoster />} />
              <Route path='payment' element={<StudentPaymentFlow/>} />
              <Route path='class' element={<ClassCreation/>}/>
              <Route path="profile" element={<StudentProfileAdmin/>} />
             
              {isSuperAdmin && (
                <>
                  <Route path="news" element={<NewsFeed userRole={user?.role} userId={user?._id} />} />
                  <Route path="send-news" element={<SendNews />} />
                  <Route path="admins" element={<ManageAdmins theme={dashboardTheme} />} />
                  <Route path="reports" element={<SuperAdminReports />} />
                  <Route path="ranking" element={<SuperAdminRanking />} />
                  <Route path="settings" element={<SystemSettings />} />
                  <Route path="student-qr-codes" element={<StudentQrCode />} />
                  <Route path="achived" element={<ArchiveManagement />} />
                  <Route path="achive-student" element={<AchiveStudentReportCard/>} />
                  <Route path="achive-profile" element={<StudentProfilePage />} />
                  <Route path='failed-student' element={<FailedStudent/>} />
                  <Route path='exam' element={<Exam/>}/>
                  <Route path='employmentId' element={<EmploymentId/>}/>
                  
                  {/* ===== ONLINE ADMISSION ROUTES - LARGE IFRAME ===== */}
                  <Route path="admission-portal" element={<AdmissionPortalPage />} />
                  <Route path="academic-dashboard" element={<AcademicDashboardPage />} />
                  <Route path="school-contact" element={<SchoolContactPage />} />
                  <Route path="student-counseling" element={<StudentCounselingPage />} />
                  <Route path="school-visitor" element={<SchoolVisitorPage />} />
                  <Route path="director-news" element={<DirectorNewsPage />} />
                </>
              )}
            </Routes>
          </main>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; }
          body { font-family: 'Inter', 'Segoe UI', sans-serif; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(217, 27, 36, 0.3); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217, 27, 36, 0.5); }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(217,27,36,0.4); } 70% { box-shadow: 0 0 0 10px rgba(217,27,36,0); } 100% { box-shadow: 0 0 0 0 rgba(217,27,36,0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
          .anim-fadeup { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
          .anim-fadein { animation: fadeIn .3s ease both; }
          .anim-spin { animation: spin 1s linear infinite; }
          .anim-pulse { animation: pulse-ring 2s ease-out infinite; }
          .edu-card { background: ${t.surface}; border: 1px solid ${t.border}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .edu-card:hover { border-color: rgba(217, 27, 36, 0.4); box-shadow: 0 0 0 1px rgba(217, 27, 36, 0.2), 0 12px 48px rgba(217,27,36,0.15); transform: translateY(-2px); }
          .stat-card { background: ${t.surface}; border: 1px solid ${t.border}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .stat-card:hover { border-color: rgba(217, 27, 36, 0.5); box-shadow: 0 12px 48px rgba(0,0,0,0.2); }
          .glass-card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
          a { text-decoration: none; }

          /* ============================================================
             📱 MOBILE: LOGO LEFT · TOGGLE · HAMBURGER RIGHT
             SIDEBAR SLIDES IN FROM RIGHT
             ONLY affects screens ≤ 1024px. Desktop unchanged.
             ============================================================ */
          .mobile-topbar { display: none; }

          @media (max-width: 1024px) {

            /* ===== MOBILE TOP BAR ===== */
            .mobile-topbar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              position: fixed; top: 0; left: 0; right: 0; height: 60px;
              padding: 0 14px;
              background: ${t.topbar};
              border-bottom: 1px solid ${t.border};
              box-shadow: 0 2px 12px rgba(0,0,0,0.08);
              z-index: 90;
            }

            /* School logo — LEFT */
            .mobile-logo-wrap {
              display: flex; align-items: center; gap: 8px;
              min-width: 0; flex: 1;
            }
            .mobile-logo-circle {
              width: 38px; height: 38px; border-radius: 50%;
              background: linear-gradient(135deg, #D91B24, #1E3A8A);
              display: flex; align-items: center; justify-content: center;
              font-size: 18px; flex-shrink: 0;
              box-shadow: 0 4px 14px rgba(217,27,36,0.35);
            }
            .mobile-logo-text {
              display: flex; flex-direction: column; line-height: 1.05;
              min-width: 0;
            }
            .mobile-logo-title {
              font-size: 13px; font-weight: 800; color: ${t.text};
              letter-spacing: 0.2px; text-transform: uppercase;
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .mobile-logo-sub {
              font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
              color: #D91B24; text-transform: uppercase;
            }

            /* Right side: toggle + hamburger */
            .mobile-topbar-right {
              display: flex; align-items: center; gap: 10px; flex-shrink: 0;
            }
            .mobile-theme-toggle {
              width: 40px; height: 40px; border: none; border-radius: 12px;
              display: flex; align-items: center; justify-content: center;
              cursor: pointer; transition: transform .2s ease;
              background: ${t.bg};
              color: ${isDarkMode ? '#FDB813' : '#1E3A8A'};
              box-shadow: inset 0 0 0 1.5px ${t.border};
            }
            .mobile-theme-toggle:active { transform: scale(0.9); }

            /* Hamburger — RIGHT */
            .hamburger-btn {
              display: flex; flex-direction: column; justify-content: center;
              gap: 5px; width: 44px; height: 44px; padding: 11px;
              border: none; border-radius: 12px;
              background: linear-gradient(135deg, #D91B24, #1E3A8A);
              cursor: pointer;
              box-shadow: 0 6px 18px rgba(217,27,36,0.35);
              transition: transform .2s ease, box-shadow .2s ease;
              flex-shrink: 0;
            }
            .hamburger-btn:active { transform: scale(0.93); box-shadow: 0 3px 10px rgba(217,27,36,0.4); }
            .hamburger-btn span {
              display: block; height: 2.5px; width: 100%;
              border-radius: 2px; background: #fff;
              transition: transform .4s cubic-bezier(.4,0,.2,1), opacity .25s ease;
            }
            .hamburger-btn.is-open span:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
            .hamburger-btn.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
            .hamburger-btn.is-open span:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

            /* ===== OVERLAY ===== */
            .sidebar-overlay {
              display: block; position: fixed; inset: 0;
              background: rgba(0,0,0,0.55);
              backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
              opacity: 0; visibility: hidden;
              transition: opacity .35s ease, visibility .35s ease;
              z-index: 95;
            }
            .sidebar-overlay.active { opacity: 1; visibility: visible; }

            /* ===== SIDEBAR — SLIDES FROM RIGHT ===== */
            .admin-sidebar-mobile {
              position: fixed !important;
              top: 0; right: 0; bottom: 0; left: auto !important;
              width: 82%; max-width: 300px; height: 100vh;
              z-index: 100;
              transform: translateX(100%);
              transition: transform .4s cubic-bezier(.4,0,.2,1);
              border-radius: 22px 0 0 22px;
              box-shadow: -12px 0 40px rgba(0,0,0,0.4);
              overflow-y: auto;
            }
            .admin-sidebar-mobile.open { transform: translateX(0); }

            .admin-sidebar-mobile.open nav li {
              opacity: 0; transform: translateX(14px);
              animation: slideInLink .4s ease forwards;
            }
            .admin-sidebar-mobile.open nav li:nth-child(1)  { animation-delay: .04s; }
            .admin-sidebar-mobile.open nav li:nth-child(2)  { animation-delay: .07s; }
            .admin-sidebar-mobile.open nav li:nth-child(3)  { animation-delay: .10s; }
            .admin-sidebar-mobile.open nav li:nth-child(4)  { animation-delay: .13s; }
            .admin-sidebar-mobile.open nav li:nth-child(5)  { animation-delay: .16s; }
            .admin-sidebar-mobile.open nav li:nth-child(6)  { animation-delay: .19s; }
            .admin-sidebar-mobile.open nav li:nth-child(7)  { animation-delay: .22s; }
            .admin-sidebar-mobile.open nav li:nth-child(8)  { animation-delay: .25s; }
            .admin-sidebar-mobile.open nav li:nth-child(9)  { animation-delay: .28s; }
            .admin-sidebar-mobile.open nav li:nth-child(10) { animation-delay: .31s; }
            @keyframes slideInLink { to { opacity: 1; transform: translateX(0); } }

            .dashboard-content-wrap { padding-top: 60px !important; }
            .desktop-header { display: none !important; }

            main.custom-scrollbar { padding: 12px !important; }

            .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
            }
            .grid.grid-cols-1.lg\\:grid-cols-12,
            .grid.grid-cols-1.xl\\:grid-cols-2 {
              grid-template-columns: 1fr !important;
              gap: 14px !important;
            }
            .lg\\:col-span-6,
            .lg\\:col-span-3 {
              grid-column: span 1 / span 1 !important;
            }
            .edu-card { padding: 14px !important; border-radius: 14px !important; }

            .grid.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-6 {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 8px !important;
            }

            h1 { font-size: 20px !important; }
            h3 { font-size: 14px !important; }

            .recharts-responsive-container { max-height: 240px !important; }
            .grid.grid-cols-7 { gap: 2px !important; }
            .grid.grid-cols-7 > div { padding: 6px 2px !important; font-size: 11px !important; }

            table { font-size: 11px !important; }
            .overflow-x-auto { -webkit-overflow-scrolling: touch; }
          }

          @media (max-width: 380px) {
            .mobile-logo-title { font-size: 11px; }
            .mobile-logo-circle { width: 34px; height: 34px; font-size: 16px; }
            .mobile-theme-toggle { width: 36px; height: 36px; }
            .hamburger-btn { width: 40px; height: 40px; padding: 10px; }
            .grid.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-6 {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
};

export default AdminDashboard;
