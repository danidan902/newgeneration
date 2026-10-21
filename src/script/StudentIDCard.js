import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Search, Award, BookOpen, User, Eye, Download, Settings, Calendar, Users, School, MapPin, GraduationCap, QrCode, Stamp, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api.js';
import logo from '../assets/signiture.png';

// Server URL - your backend runs on port 5000
const SERVER_URL = 'http://localhost:5000';

// ==================== AVATAR COMPONENT ====================
const Avatar = ({ name, image, size = 40 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      return `${SERVER_URL}${imagePath}`;
    }
    return `${SERVER_URL}/uploads/profile-images/${imagePath}`;
  };
  
  const imageUrl = getImageUrl(image);
  
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: !imageUrl || imgError ? 'linear-gradient(135deg, #b86229 0%, #dd8a52 100%)' : 'transparent',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 0 0 3px rgba(184,98,41,0.2), 0 4px 12px rgba(0,0,0,0.1)',
      }}>
        {imageUrl && !imgError ? (
          <img 
            src={imageUrl} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)} 
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: size * 0.35,
          }}>{initials}</div>
        )}
      </div>
    </div>
  );
};

const StudentIDCard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [student, setStudent] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingIDCard, setLoadingIDCard] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [currentView, setCurrentView] = useState('class');

  const getUserRole = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return '';
  };

  // Fetch student's own ID card
  const fetchOwnIDCard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/users/me/profile');
      const userData = response.data;
      
      const studentData = {
        name: userData.name || '',
        sex: userData.sex || '',
        grade: userData.grade || '',
        section: userData.section || '',
        phone: userData.phone || '',
        rollNumber: userData.rollNumber || '',
        email: userData.email || '',
        profileImage: userData.profileImage || null,
        createdAt: userData.createdAt || new Date().toISOString(),
        _id: userData._id || '',
        program: userData.programs || 'Regular',
        className: `Grade ${userData.grade || ''} ${userData.section ? `- Section ${userData.section}` : ''}`
      };
      
      setStudent(studentData);
      setCurrentView('idcard');
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load your ID card. Please try again.');
      setLoading(false);
      toast.error('Failed to load ID card');
    }
  };

  // Fetch classes for teachers/admins
  const fetchClasses = async () => {
    setLoadingClasses(true);
    setError(null);
    
    try {
      const role = getUserRole();
      setUserRole(role);
      
      let response;
      if (role === 'teacher') {
        response = await api.get('/classes/my-classes');
      } else {
        response = await api.get('/classes');
      }
      
      let classesData = [];
      if (Array.isArray(response.data)) {
        classesData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        classesData = response.data.data;
      } else if (response.data.classes && Array.isArray(response.data.classes)) {
        classesData = response.data.classes;
      }
      
      setClasses(classesData);
      
      if (classesData.length === 0) {
        toast.info('No classes found');
      } else {
        toast.success(`Found ${classesData.length} class(es)`);
      }
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes');
      toast.error('Failed to fetch classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Handle class selection
  const handleClassSelect = async (classObj) => {
    setLoadingStudents(true);
    setError(null);
    
    try {
      const response = await api.get(`/classes/${classObj._id}`);
      const classData = response.data;
      let students = classData.students || [];
      
      const studentsWithImages = await Promise.all(
        students.map(async (student) => {
          const studentId = student._id || student;
          try {
            const studentsResponse = await api.get('/users/role/student');
            const allStudents = studentsResponse.data;
            const fullStudent = allStudents.find(s => s._id === studentId);
            return fullStudent || student;
          } catch (err) {
            return student;
          }
        })
      );
      
      setStudentsList(studentsWithImages);
      setSelectedClass(classObj);
      setCurrentView('students');
      setSearchTerm('');
      
      if (studentsWithImages.length === 0) {
        toast.info('No students found in this class');
      } else {
        toast.success(`Found ${studentsWithImages.length} student(s)`);
      }
      
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle View ID button click
  const handleViewIDClick = (studentData, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    setLoadingIDCard(true);
    
    const idCardData = {
      name: studentData.name || '',
      sex: studentData.sex || '',
      grade: selectedClass?.grade || studentData.grade || '',
      section: selectedClass?.section || studentData.section || '',
      phone: studentData.phone || '',
      rollNumber: studentData.rollNumber || '',
      email: studentData.email || '',
      profileImage: studentData.profileImage || null,
      createdAt: studentData.createdAt || new Date().toISOString(),
      _id: studentData._id || '',
      program: selectedClass?.program || studentData.programs || 'Regular',
      className: selectedClass ? `${selectedClass.program || 'General'} - Grade ${selectedClass.grade}${selectedClass.section ? ` - Section ${selectedClass.section}` : ''}` : 'Student ID Card'
    };
    
    setStudent(idCardData);
    setCurrentView('idcard');
    setLoadingIDCard(false);
  };

  const goBackToStudents = () => {
    setStudent(null);
    setCurrentView('students');
  };

  const goBackToClasses = () => {
    setSelectedClass(null);
    setStudentsList([]);
    setStudent(null);
    setCurrentView('class');
  };

  const formatEthiopianDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let ecYear = year - 8;
    if (month < 9) ecYear -= 1;
    return `${day}/${month}/${ecYear} E.C`;
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      return `${SERVER_URL}${imagePath}`;
    }
    return `${SERVER_URL}/uploads/profile-images/${imagePath}`;
  };

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    
    if (role === 'student') {
      fetchOwnIDCard();
    } else {
      fetchClasses();
      setCurrentView('class');
    }
  }, []);

  const filteredClasses = classes.filter(cls => {
    const searchLower = searchTerm.toLowerCase();
    const program = (cls.program || '').toLowerCase();
    const grade = (cls.grade || '').toString().toLowerCase();
    const section = (cls.section || '').toLowerCase();
    
    return program.includes(searchLower) ||
           grade.includes(searchLower) ||
           section.includes(searchLower);
  });

  const filteredStudents = studentsList.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const name = (student.name || '').toLowerCase();
    const rollNumber = (student.rollNumber || '').toString().toLowerCase();
    
    return name.includes(searchLower) || rollNumber.includes(searchLower);
  });

  // ========== RENDER ID CARD - ORIGINAL DESIGN (BROWN/ORANGE) ==========
  const renderIDCard = () => {
    if (!student) return null;

    const fullName = student.name || 'Not Provided';
    const gender = student.sex || 'Not Specified';
    const college = "Tullu Dimtu School";
    const studyLevel = student.grade ? `Grade ${student.grade}` : 'Not Assigned';
    const admission = student.program || "Regular";
    const qrData = student.studentId || `ID:${student._id}`;
    const profileImageUrl = student.profileImage;
    const publicIdRaw = student.rollNumber || student.email?.split('@')[0] || 'std_unknown';
    const fanNumber = student.rollNumber || student._id?.slice(-6) || 'STD001';
    // const name = student.name || 'Unknown Student student name is not ';
    const issuedDateStr = student.createdAt ? formatEthiopianDate(student.createdAt) : '1/1/2018 E.C';
    let expiryDate = new Date(student.createdAt || Date.now());
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);
    const expiryDateStr = formatEthiopianDate(expiryDate.toISOString());

    const studentImageUrl = getImageUrl(profileImageUrl);
    const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const cardWidth = '750px';
    const cardHeight = '470px';

    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-8 py-12 px-4" style={{ fontFamily: "'Inter', 'Poppins', system-ui, sans-serif" }}>
        
        {userRole !== 'student' && (
          <button 
            onClick={goBackToStudents}
            className="self-start ml-4 px-5 py-2.5 bg-[#0e7490] text-white rounded-xl  transition-all duration-200 flex items-center gap-2 shadow-lg font-medium"
          >
            ← Back to Students
          </button>
        )}
        
        <div className="bg-[#0e7490] backdrop-blur-sm text-white px-6 py-2 rounded-full text-center shadow-md border border-[#b86229]/30">
          <span className="font-semibold tracking-wide">
            {student.className || `${student.program || 'General'} - Grade ${student.grade}${student.section ? ` - Section ${student.section}` : ''}`}
          </span>
        </div>

        {/* FRONT OF CARD */}
        <div className="id-card" style={{ width: cardWidth, maxWidth: '90vw' }}>
          
          <style>{`
            @keyframes fingerWaveScan {
              0% { left: -100%; opacity: 0; }
              30% { opacity: 1; }
              70% { opacity: 1; }
              100% { left: 100%; opacity: 0; }
            }
            @keyframes subtlePulse {
              0%, 100% { opacity: 0.6; transform: rotate(-5deg) scale(1); }
              50% { opacity: 0.9; transform: rotate(-3deg) scale(1.02); }
            }
            .id-card {
              background-color: #f8fafc;
              border-radius: 24px;
              position: relative;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              border: 1px solid #cbd5e1;
              height: ${cardHeight};
            }
            .id-card::before {
              content: "";
              position: absolute;
              top: 0;
              left: -100%;
              width: 80%;
              height: 100%;
              background: linear-gradient(115deg, transparent, rgba(184,98,41,0.12), rgba(221,138,82,0.08), transparent);
              transform: skewX(-12deg);
              animation: fingerWaveScan 7s infinite cubic-bezier(0.4, 0, 0.2, 1);
              pointer-events: none;
              z-index: 2;
              border-radius: 20px;
            }
            .id-card::after {
              content: "";
              position: absolute;
              top: 15px;
              left: 20px;
              right: 20px;
              bottom: 15px;
              background: repeating-linear-gradient(45deg, rgba(210, 180, 70, 0.1) 0px, rgba(210, 180, 70, 0.1) 2px, transparent 2px, transparent 8px);
              pointer-events: none;
              border-radius: 20px;
              z-index: 0;
            }
            .digital-stamp {
              position: absolute;
              width: 150px;
              height: 150px;
              right: 8px;
              z-index: 20;
              bottom: -70px;
              opacity: 0.7;
              pointer-events: none;
              filter: drop-shadow(2px 4px 8px rgba(0,0,0,0.2));
              animation: subtlePulse 4s ease-in-out infinite;
            }
            .digital-stamp1{
              width: 110px;
              height: 110px;
              bottom: -10px;
              left: 30px;
            }
            .id-header {
              background: linear-gradient(180deg, #062346 0%, #021327 100%);
              height: 95px;
              display: flex;
              align-items: center;
              
              justify-content: space-between;
              padding: 0 24px;
              color: #ffffff;
              border-bottom: 3px solid #b86229;
              position: relative;
              z-index: 5;
            }
            .header-titles {
              text-align: center;
              flex-grow: 1;
              padding: 0 15px;
            }
            .header-titles h2 {
              font-size: 19px;
              font-weight: 700;
              color: #e2e8f0;
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }
            .header-titles h1 {
              font-size: 15px;
              font-weight: 800;
              color: #df9b6d;
              letter-spacing: 1px;
            }
            .id-subtitle {
              text-align: center;
              background-color: #ffffff;
              color: #021327;
              font-size: 19px;
              font-weight: 900;
              letter-spacing: 3px;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
              position: relative;
              z-index: 5;
              width: 100%;
              background-image: repeating-linear-gradient(45deg, rgba(203, 161, 53, 0.12) 0px, rgba(203, 161, 53, 0.12) 2px, transparent 2px, transparent 12px),
                                repeating-linear-gradient(135deg, rgba(80, 60, 20, 0.05) 0px, rgba(80, 60, 20, 0.05) 1px, transparent 1px, transparent 10px);
            }
            .id-body {
              display: flex;
              flex-grow: 1;
              padding: 16px 20px;
              align-items: flex-start;
              justify-content: space-between;
              position: relative;
              z-index: 5;
              width: 100%;
              background-image: repeating-linear-gradient(45deg, rgba(203, 161, 53, 0.12) 0px, rgba(203, 161, 53, 0.12) 2px, transparent 2px, transparent 12px),
                                repeating-linear-gradient(135deg, rgba(80, 60, 20, 0.05) 0px, rgba(80, 60, 20, 0.05) 1px, transparent 1px, transparent 10px);
            }
            .info-grid {
              width: 62%;
              display: flex;
              flex-direction: column;
            }
            .grid-row {
              display: flex;
            }
            .grid-label {
              width: 32%;
              padding: 8px 12px;
              font-size: 13px;
              font-weight: 800;
              color: #021327;
              text-transform: uppercase;
              display: flex;
              align-items: center;
              font-family: 'Inter', system-ui;
              letter-spacing: 0.4px;
            }
            .grid-value {
              width: 68%;
              padding: 8px 8px 8px 0;
              font-size: 14px;
              font-weight: 700;
              color: #1e293b;
              font-family: 'Segoe UI', 'Poppins', system-ui;
              letter-spacing: -0.2px;
              display: flex;
              align-items: center;
              border-bottom: 1px dashed rgba(184,98,41,0.3);
            }
            .right-column {
              width: 34%;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              height: 100%;
              position: relative;
            }
            .photo-container {
              position: relative;
              margin-right: 35px;
            }
            .photo-frame {
              width: 150px;
              height: 185px;
              border: 2px solid #b86229;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              background-color: #cbd5e1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .photo-frame img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .side-badge {
              position: absolute;
              right: 0;
              top: -16px;
              width: 26px;
              height: 254px;
              background: linear-gradient(135deg, #b86229 0%, #dd8a52 50%, #b86229 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              border-bottom-left-radius: 6px;
            }
            .side-badge-text {
              transform: rotate(90deg);
              white-space: nowrap;
              color: #ffffff;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .id-footer {
              margin-top: auto;
              height: 45px;
              display: flex;
              border-top: 3px solid #b86229;
              position: relative;
              z-index: 5;
            }
            .footer-left-accent {
              width: 200px;
              background: linear-gradient(90deg, #b86229 0%, #a2521f 100%);
              color: #ffffff;
              display: flex;
              align-items: center;
              padding-left: 20px;
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.5px;
            }
            .footer-main-dark {
              flex-grow: 1;
              background-color: #021327;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 20px;
            }
            .footer-qr-anchor {
              width: 44px;
              height: 44px;
              background-color: #ffffff;
              border: 2px solid #021327;
              border-radius: 4px;
              margin-top: -20px;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 7px;
              font-weight: bold;
              box-shadow: 0 -2px 6px rgba(0,0,0,0.15);
            }
            .footer-url {
              color: #ffffff;
              text-decoration: none;
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 1px;
              margin-left: auto;
            }
            .image-logo {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
          `}</style>
          
          <header className="id-header">
            <div className="header-logo">
              <img className="image-logo" src="/png.png" alt="Logo 1" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div className="header-titles">
              <h2>MANA BARUMSAA SADARK 2FFAA DHALOOTA</h2>
              <h1>NEW GENERATION SECONDARY SCHOOL</h1>
            </div>
            <div className="header-logo">
              <img className="image-logo" src="/shagger.png" alt="Logo 2" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </header>

          <div className="id-subtitle">STUDENT'S IDENTIFICATION CARD</div>

          <div className="id-body">
            
            <div className="info-grid">
              <div className="grid-row">
                <div className="grid-label">Full Name</div>
                <div className="grid-value">{fullName}</div>
              </div>
              
              <div className="grid-row">
                <div className="grid-label">Gender</div>
                <div className="grid-value">{gender}</div>
              </div>
              
              <div className="grid-row">
                <div className="grid-label">Email</div>
                <div className="grid-value" style={{ fontWeight: 600, color: '#334155' }}>{qrData}</div>
              </div>
              
              <div className="grid-row">
                <div className="grid-label">College</div>
                <div className="grid-value">{college}</div>
              </div>
              
              <div className="grid-row">
                <div className="grid-label">Study Level</div>
                <div className="grid-value">{studyLevel}</div>
              </div>
              
              <div className="grid-row">
                <div className="grid-label">Admission</div>
                <div className="grid-value">{admission}</div>
              </div>
            </div>

            <div className="right-column">
              <div className="photo-container">
                <div className="photo-frame">
                  {studentImageUrl ? (
                    <img 
                      src={studentImageUrl} 
                      alt={fullName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #b86229, #dd8a52)';
                        e.target.parentElement.style.color = '#fff';
                        e.target.parentElement.style.fontWeight = 'bold';
                        e.target.parentElement.style.fontSize = '32px';
                        e.target.parentElement.innerText = initials;
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #b86229, #dd8a52)', color: '#fff', fontWeight: 'bold', fontSize: '32px' }}>
                      {initials}
                    </div>
                  )}
                </div>
                <img 
                  src="/stamp.png" 
                  alt="Digital Stamp" 
                  className="digital-stamp"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>

              <div className="side-badge">
                <div className="side-badge-text">Public ID {publicIdRaw.slice(-4)}</div>
              </div>
            </div>

          </div>

          <footer className="id-footer">
            <div className="footer-left-accent">NEW GENERATION SCHOOL</div>
            <div className="footer-main-dark">
              <div className="footer-qr-anchor"></div>
              <a href="https://www.newgeneration.com" className="footer-url" target="_blank" rel="noopener noreferrer">www.tuludimtuschool.com</a>
            </div>
          </footer>
        </div>

        {/* BACK OF CARD */}
        <div className="relative" style={{ width: cardWidth, maxWidth: '90vw', height: cardHeight }}>
          <div className="bg-gradient-to-br from-[#fefaf5] to-[#f5efe8] rounded-2xl shadow-2xl overflow-hidden border border-[#b86229]/20 w-full h-full flex flex-col">
            
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 30 L30 55 L5 30 Z' fill='none' stroke='%23b86229' stroke-width='0.8'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23b86229' stroke-width='0.6'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '40px' }}></div>
            </div>
            
            {/* Fingerprint Wave Watermark */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <svg width="500" height="300" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" stroke="#b86229" strokeWidth="3" d="M300,120 L300,80 M300,160 L300,200 M280,100 Q300,70 320,100 M265,125 Q300,85 335,125 M255,150 Q300,100 345,150 M248,175 Q300,115 352,175 M242,200 Q300,130 358,200 M238,225 Q300,145 362,225 M235,250 Q300,160 365,250 M232,275 Q300,170 368,275" strokeDasharray="6 8" opacity="0.5"/>
                <path d="M430,220 C400,280 360,340 300,360 C240,340 200,280 170,220" stroke="#b86229" strokeWidth="4" fill="none" opacity="0.3"/>
              </svg>
            </div>

            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#021327] to-[#0a2a4e] px-3 py-2 flex items-center gap-4 border-b-2 border-[#b86229] relative z-10">
              <div className="header-logo">
              <img className="image-logo" src="/png.png" alt="Logo 2" onError={(e) => e.target.style.display = 'none'} />
            </div>
              <div>
                <h3 className="text-white font-bold text-xl tracking-wide">NEW GENERATION SECONDARY SCHOOL</h3>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 relative z-10 flex flex-col">
              {/* Information Block */}
              <div className="p-5 border-l-4 border-[#b86229]">
                <h4 className="text-[#b86229] font-black text-xs tracking-wider uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#b86229] rounded-full"></span>
                  Student Official Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Full Name</span>
                    <span className="font-bold text-gray-800 text-base">{fullName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Student ID / Roll No</span>
                    <span className="font-bold text-gray-800 text-base">{fanNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Date of Issue</span>
                    <span className="font-bold text-gray-800">{issuedDateStr}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Expiry Date</span>
                    <span className="font-bold text-gray-800">{expiryDateStr}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Program / Admission</span>
                    <span className="font-bold text-gray-800">{admission}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Study Level</span>
                    <span className="font-bold text-gray-800">{studyLevel}</span>
                  </div>
                </div>
              </div>

              {/* Footer Info Row */}
              <div className="flex flex-wrap justify-between items-center gap-4 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center">
                     <img 
                  src="/stamp.png" 
                  alt="Digital Stamp" 
                  className="digital-stamp1"
                  onError={(e) => e.target.style.display = 'none'}
                />
                  </div>

                  <div className="flex flex-col ml-36">
                    <img src={logo} className='w-36 h-20 absolute flex mb-8 ml-4' alt="Signature" />
                    <p className="text-black border-b border-gray-400 h-4 w-52 mt-12"></p>
                    <p className="font-bold text-gray-800 text-lg ml-4 mb-8">Director Signature</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-20 h-20 bg-white border-2 border-[#b86229] rounded-xl flex items-center justify-center shadow-md">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`} 
                      alt="QR" 
                      className="w-full h-full p-1"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1 font-mono">Scan for verification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER LOGIC ============
  
  if (userRole === 'student') {
    if (loading) {
      return (
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="bg-[#f8fafc] px-8 py-4 rounded-xl shadow-xl text-[#0e7490] flex items-center gap-3 border border-[#0e7490]/10">
            <div className="w-5 h-5 border-2 border-[#0e7490]/30 border-t-[#0e7490] rounded-full animate-spin" />
            <span>Loading your ID card...</span>
          </div>
        </div>
      );
    }
    if (error) return <div className="min-h-screen bg-white flex items-center justify-center text-red-500">{error}</div>;
    if (!student) return null;
    return renderIDCard();
  }

  if (currentView === 'idcard') {
    if (loadingIDCard) {
      return (
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="bg-[#f8fafc] px-8 py-4 rounded-xl shadow-xl text-[#0e7490] flex items-center gap-3 border border-[#0e7490]/10">
            <div className="w-5 h-5 border-2 border-[#0e7490]/30 border-t-[#0e7490] rounded-full animate-spin" />
            <span>Loading ID card...</span>
          </div>
        </div>
      );
    }
    if (!student) return null;
    return renderIDCard();
  }

  if (currentView === 'students') {
    if (loadingStudents) {
      return (
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="bg-[#f8fafc] px-8 py-4 rounded-xl shadow-xl text-[#0e7490] flex items-center gap-3 border border-[#0e7490]/10">
            <div className="w-5 h-5 border-2 border-[#0e7490]/30 border-t-[#0e7490] rounded-full animate-spin" />
            <span>Loading students...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <button 
              onClick={goBackToClasses}
              className="px-4 py-2 bg-[#f8fafc] text-[#0e7490] rounded-lg hover:bg-[#e2e8f0] transition border border-[#0e7490]/20"
            >
              ← Back to Classes
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Select Student</h1>
              <p className="text-gray-500">
                {selectedClass?.program} - Grade {selectedClass?.grade} {selectedClass?.section && `- Section ${selectedClass.section}`}
              </p>
            </div>
            <div className="text-gray-400 text-sm">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#0e7490] focus:border-[#0e7490] outline-none"
              />
            </div>
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg text-center">
              <p>No students found in this class</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((studentItem) => (
                <div
                  key={studentItem._id}
                  className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col items-center gap-3 hover:shadow-lg transition-all cursor-pointer hover:border-[#0e7490]/30"
                >
                  <Avatar name={studentItem.name} image={studentItem.profileImage} size={60} />
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-gray-800">{studentItem.name}</h3>
                    <p className="text-gray-500 text-sm">Roll No: {studentItem.rollNumber || 'N/A'}</p>
                    <p className="text-gray-400 text-xs">Grade {selectedClass?.grade} - {selectedClass?.section}</p>
                  </div>
                  <button
                    onClick={(e) => handleViewIDClick(studentItem, e)}
                    className="w-full px-4 py-2 bg-[#0e7490] text-white rounded-lg text-sm hover:bg-[#0891b2] transition font-semibold"
                  >
                    <Eye size={16} className="inline mr-1" /> View ID Card
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Class List View - Matching the StudentReportCard design
  if (loadingClasses) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="bg-[#f8fafc] px-8 py-4 rounded-xl shadow-xl text-[#0e7490] flex items-center gap-3 border border-[#0e7490]/10">
          <div className="w-5 h-5 border-2 border-[#0e7490]/30 border-t-[#0e7490] rounded-full animate-spin" />
          <span>Loading classes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        .class-selector-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hero-section {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 50px;
          border-radius: 15px;
          margin-bottom: 40px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .hero-title { 
          font-family: 'Playfair Display', serif; 
          font-size: 42px; 
          font-weight: 800; 
          margin-bottom: 15px; 
          letter-spacing: 1px; 
        }
        .hero-subtitle { font-size: 16px; opacity: 0.9; }
        .classes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .class-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
        }
        .class-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0e7490, #22d3ee);
        }
        .class-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(8, 145, 178, 0.15);
          border-color: #0891b2;
        }
        .class-icon { font-size: 48px; margin-bottom: 15px; }
        .class-title { font-size: 22px; font-weight: 700; color: #1a202c; margin-bottom: 10px; }
        .class-info { color: #64748b; font-size: 14px; margin-bottom: 15px; }
        .class-stats { display: flex; gap: 15px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
        .stat-item { flex: 1; text-align: center; }
        .stat-number { font-size: 18px; font-weight: 700; color: #0e7490; }
        .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .class-button {
          width: 100%;
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
          transition: all 0.3s;
        }
        .class-button:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3); }
        .search-box {
          background: white;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
        }
        .search-box input {
          width: 100%;
          padding: 14px 20px 14px 48px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          background: transparent;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="hero-section">
          <div className="flex justify-center mb-4">
            <Award size={48} />
          </div>
          <h2 className="hero-title">🎓 Student ID Cards</h2>
          <p className="hero-subtitle">Select a class to view student ID cards</p>
        </div>
        
        <div className="search-box">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by program, grade, or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {classes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg font-semibold text-gray-600">No classes found</p>
            <p className="text-sm text-gray-400 mt-2">Please add classes first</p>
            <button
              onClick={fetchClasses}
              className="mt-4 px-6 py-2 bg-[#0e7490] text-white rounded-lg hover:bg-[#0891b2] transition font-medium"
            >
              Refresh Classes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => (
              <div
                key={cls._id}
                onClick={() => handleClassSelect(cls)}
                className="class-card"
              >
                <div className="class-icon">📖</div>
                <h3 className="class-title">Grade {cls.grade}</h3>
                <p className="class-info">Section {cls.section}</p>
                {cls.program && (
                  <div className="inline-block bg-cyan-50 text-cyan-700 text-xs px-3 py-1 rounded-full border border-cyan-200">
                    {cls.program} Program
                  </div>
                )}
                <div className="class-stats">
                  <div className="stat-item">
                    <div className="stat-number">{cls.students?.length || 0}</div>
                    <div className="stat-label">Students</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{cls.subjects?.length || 0}</div>
                    <div className="stat-label">Subjects</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClassSelect(cls);
                  }}
                  className="class-button"
                >
                  View Students →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentIDCard;