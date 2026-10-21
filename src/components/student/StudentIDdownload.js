import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../services/api.js';
import logo from '../../assets/signiture.png'


// Server URL - your backend runs on port 5000
const SERVER_URL = 'http://localhost:5000';

// Native (design) size of the ID card. We never change these numbers —
// on phones we just scale the whole card down visually, like zooming out,
// so the layout/design never reflows or breaks.
const CARD_WIDTH_PX = 750;
const CARD_HEIGHT_PX = 470;
const CARD_GAP_PX = 32; // matches Tailwind's gap-8 (2rem)
const SIDE_PADDING_PX = 24; // breathing room on very small screens

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

// Hook: figures out how much to scale the (fixed-size) ID card down so it
// fits on narrow / phone screens, without ever changing the card's own
// width/height or internal layout. Desktop/tablet gets scale = 1 (untouched).
const useCardScale = (nativeWidth = CARD_WIDTH_PX) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const available = window.innerWidth - SIDE_PADDING_PX * 2;
      if (available < nativeWidth) {
        setScale(Math.max(available / nativeWidth, 0.32)); // never shrink to unreadable
      } else {
        setScale(1);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    window.addEventListener('orientationchange', calculateScale);
    return () => {
      window.removeEventListener('resize', calculateScale);
      window.removeEventListener('orientationchange', calculateScale);
    };
  }, [nativeWidth]);

  return scale;
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
  
  // New state for student search
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Zoom-out scale used only on narrow/phone screens; 1 on desktop/tablet.
  const scale = useCardScale(CARD_WIDTH_PX);

  // Ref to the (front + back) card stack (used only to neutralize the phone
  // zoom transform before capture); separate refs for front/back faces so
  // each can be rendered onto its own PDF page.
  const cardStackRef = useRef(null);
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);
  const [downloadingCard, setDownloadingCard] = useState(false);

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

  // NEW FUNCTION: Search student by name, email, or ID
  const searchStudentByIdentity = async () => {
    if (!studentSearchInput.trim()) {
      toast.error('Please enter a name, email, or ID');
      return;
    }

    setSearchingStudent(true);
    setSearchError(null);
    setError(null);

    try {
      // First try to find student by ID (if the input looks like an ID)
      let studentData = null;
      
      // Try to search by ID if input length is reasonable for an ID
      if (studentSearchInput.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          const response = await api.get(`/users/${studentSearchInput}`);
          if (response.data && response.data.role === 'student') {
            studentData = response.data;
          }
        } catch (err) {
          // Not found by ID, continue to other search methods
        }
      }

      // If not found by ID, search through all students
      if (!studentData) {
        const response = await api.get('/users/role/student');
        const allStudents = response.data;
        
        // Search by name (case-insensitive) or email (case-insensitive)
        const searchLower = studentSearchInput.toLowerCase().trim();
        studentData = allStudents.find(student => 
          student.name?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower) ||
          student.rollNumber?.toString().toLowerCase().includes(searchLower)
        );
      }

      if (studentData) {
        // Format student data for ID card
        const formattedStudent = {
          name: studentData.name || '',
          sex: studentData.sex || '',
          grade: studentData.grade || '',
          section: studentData.section || '',
          phone: studentData.phone || '',
          rollNumber: studentData.rollNumber || '',
          studentId: studentData.studentId || '',
          profileImage: studentData.profileImage || null,
          createdAt: studentData.createdAt || new Date().toISOString(),
          _id: studentData._id || '',
          parentPhone: studentData.parentPhone || '',
          program: studentData.programs || 'Regular',
          className: `Grade ${studentData.grade || ''} ${studentData.section ? `- Section ${studentData.section}` : ''}`
        };
        
        setStudent(formattedStudent);
        setCurrentView('idcard');
        toast.success(`Found student: ${studentData.name}`);
      } else {
        setSearchError('No student found with that name, email, or ID');
        toast.error('Student not found');
      }
    } catch (error) {
      console.error('Error searching for student:', error);
      setSearchError('Failed to search for student. Please try again.');
      toast.error('Error searching for student');
    } finally {
      setSearchingStudent(false);
    }
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
        studentId: userData.studentId || '',
        profileImage: userData.profileImage || null,
        createdAt: userData.createdAt || new Date().toISOString(),
        _id: userData._id || '',
        parentPhone: userData.parentPhone || '',
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
        toast.error('No classes found');
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
        toast.error('No students found in this class');
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
      studentId: studentData.studentId || '',
      parentPhone: studentData.parentPhone || '',
      profileImage: studentData.profileImage || null,
      createdAt: studentData.createdAt || new Date().toISOString(),
      _id: studentData._id || '',
      parentPhone: studentData.parentPhone || '',
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

  // Go back to search screen
  const goBackToSearch = () => {
    setStudent(null);
    setCurrentView('class');
    setStudentSearchInput('');
    setSearchError(null);
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

  // Renders the front and back faces separately, then places each on its own
  // full A4 PDF page — centered, at true size, with generous margin/background
  // around it (like a printed page the card sits on), instead of a page that's
  // just the card image edge-to-edge. Uses html2canvas's onclone hook to
  // temporarily undo the phone "zoom out" transform on the cloned DOM, so the
  // PDF is always full resolution/quality no matter what scale the user is
  // currently viewing at.
  const handleDownloadIDCard = async () => {
    if (!frontCardRef.current || !backCardRef.current || !student) return;

    setDownloadingCard(true);
    try {
      const renderScale = 2; // sharper output than the screen's own pixel ratio
      const neutralizeZoom = (clonedDoc) => {
        const clonedStack = clonedDoc.querySelector('[data-idcard-stack]');
        if (clonedStack) {
          clonedStack.style.transform = 'none';
          clonedStack.style.marginBottom = '0px';
        }
      };
      const captureOpts = {
        backgroundColor: '#f8fafc',
        scale: renderScale,
        useCORS: true,
        logging: false,
        onclone: neutralizeZoom,
        allowTaint: true,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      };

      // Capture front and back cards with all styles preserved
      const [frontCanvas, backCanvas] = await Promise.all([
        html2canvas(frontCardRef.current, captureOpts),
        html2canvas(backCardRef.current, captureOpts),
      ]);

      const pxToMm = (px) => (px * 25.4) / 96;

      const PAGE_WIDTH_MM = 210; // A4 portrait
      const PAGE_HEIGHT_MM = 297;
      const MARGIN_MM = 20; // free space around the card so it "sits" on the page
      const PAGE_BG = [248, 250, 252]; // matches the card's own background (#f8fafc)

      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4',
        compress: true
      });

      const addCardPage = (canvas, isFirstPage) => {
        if (!isFirstPage) pdf.addPage();

        // Fill the whole page with a background so the card visibly "sits" on it
        pdf.setFillColor(...PAGE_BG);
        pdf.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');

        const cardWidthMm = pxToMm(canvas.width / renderScale);
        const cardHeightMm = pxToMm(canvas.height / renderScale);

        const maxWidth = PAGE_WIDTH_MM - MARGIN_MM * 2;
        const maxHeight = PAGE_HEIGHT_MM - MARGIN_MM * 2;
        const fitScale = Math.min(maxWidth / cardWidthMm, maxHeight / cardHeightMm, 1);

        const drawWidth = cardWidthMm * fitScale;
        const drawHeight = cardHeightMm * fitScale;
        const x = (PAGE_WIDTH_MM - drawWidth) / 2;
        const y = (PAGE_HEIGHT_MM - drawHeight) / 2;

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, drawWidth, drawHeight);
      };

      addCardPage(frontCanvas, true);
      addCardPage(backCanvas, false);

      const safeName = (student.name || 'student').trim().replace(/\s+/g, '_');
      pdf.save(`${safeName}_ID_Card.pdf`);

      toast.success('ID card downloaded as PDF');
    } catch (err) {
      console.error('Error downloading ID card:', err);
      toast.error('Failed to download ID card. Please try again.');
    } finally {
      setDownloadingCard(false);
    }
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



  // ========== RENDER ID CARD ==========
  const renderIDCard = () => {
    if (!student) return null;

    const fullName = student.name || 'Not Provided';
    const gender = student.sex || 'Not Specified';
    const college = "Tullu Dimtu School";
    const studyLevel = student.grade ? `${student.grade}` : 'Not Assigned';
    const admission = student.program || "Regular";
    const qrData = student.studentId || `ID:${student._id}`;
    const profileImageUrl = student.profileImage;
    const publicIdRaw = student.rollNumber || student.studentId?.split('@')[0] || 'std_unknown';
    const fanNumber = student.rollNumber || student._id?.slice(-6) || 'STD001';
    const parentPhone = student.parentPhone || student.parentPhone || 'N/A';
    const issuedDateStr = student.createdAt ? formatEthiopianDate(student.createdAt) : '1/1/2018 E.C';

    let expiryDate = new Date(student.createdAt || Date.now());
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);
    const expiryDateStr = formatEthiopianDate(expiryDate.toISOString());

    // Get student image URL
    const studentImageUrl = getImageUrl(profileImageUrl);
    const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Native, fixed design size — never changes. On phones the whole block
    // is visually scaled down (like zooming out) via CSS transform, so
    // nothing in the card's own layout ever reflows or breaks.
    const cardWidth = `${CARD_WIDTH_PX}px`;
    const cardHeight = `${CARD_HEIGHT_PX}px`;

    // Total height occupied by [front card] + [gap] + [back card], used to
    // collapse the extra empty space transform: scale() leaves behind.
    const stackHeight = CARD_HEIGHT_PX + CARD_GAP_PX + CARD_HEIGHT_PX;
    const collapsedMargin = scale < 1 ? -(stackHeight * (1 - scale)) : 0;

    // Uniform diamond SVG pattern - same size and color for front and back
    const diamondPattern = `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 4 L46 25 L25 46 L4 25 Z' fill='none' stroke='%23b86229' stroke-width='1.2'/%3E%3Ccircle cx='25' cy='25' r='8' fill='none' stroke='%23b86229' stroke-width='0.8'/%3E%3Cpath d='M12 12 L38 38 M12 38 L38 12' stroke='%23b86229' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E")`;

    return (
      <div
        className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-8 py-12 px-4"
        style={{ fontFamily: "'Inter', 'Poppins', system-ui, sans-serif", overflowX: 'hidden' }}
      >
        
      
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-[#021327]/90 backdrop-blur-sm text-white px-6 py-2 rounded-full text-center shadow-md border border-[#b86229]/30">
            <span className="font-semibold tracking-wide">
              {student.className || `${student.program || 'General'} - Grade ${student.grade}${student.section ? ` - Section ${student.section}` : ''}`}
            </span>
          </div>

          <button
            onClick={handleDownloadIDCard}
            disabled={downloadingCard}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#b86229] text-white font-semibold text-sm shadow-md hover:bg-[#a2521f] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloadingCard ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download as PDF
              </>
            )}
          </button>
        </div>

        {/* Scale wrapper: keeps the card's real design/size intact and just
            zooms the whole stack out to fit phone screens. On desktop/tablet
            scale is 1, so this wrapper is a no-op. This same node is what
            gets captured as the downloaded image (at full, unscaled quality). */}
        <div
          ref={cardStackRef}
          data-idcard-stack
          style={{
            width: cardWidth,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${CARD_GAP_PX}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            marginBottom: `${collapsedMargin}px`,
          }}
        >

        {/* FRONT OF CARD - with diamond pattern background like back */}
        <div ref={frontCardRef} className="id-card" style={{ width: cardWidth, background: '#f8fafc' }}>
          
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
              background-color: #e7e7e7;
              color: #021327;
              font-size: 19px;
              font-weight: 900;
              letter-spacing: 3px;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
              position: relative;
              z-index: 5;
              width: 100%;
              overflow: hidden;
            }
            /* Diamond pattern overlay specifically for the subtitle area - same size as back */
            .id-subtitle::before {
              content: "";
              position: absolute;
              inset: 0;
              z-index: -1;
              pointer-events: none;
              opacity: 0.06;
              background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 4 L46 25 L25 46 L4 25 Z' fill='none' stroke='%23b86229' stroke-width='1.2'/%3E%3Ccircle cx='25' cy='25' r='8' fill='none' stroke='%23b86229' stroke-width='0.8'/%3E%3Cpath d='M12 12 L38 38 M12 38 L38 12' stroke='%23b86229' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E");
              background-repeat: repeat;
              background-size: 50px;
            }
            .id-body {
              display: flex;
              flex-grow: 1;
              padding: 16px 20px;
              align-items: flex-start;
              justify-content: space-between;
              position: relative;
              // z-index: 5;
              width: 100%;
               background-color: #e7e7e7;
        
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
          
          {/* Diamond geometric accent pattern — covers the whole card, same as back */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              opacity: 0.08,
              pointerEvents: 'none',
              backgroundImage: diamondPattern,
              backgroundRepeat: 'repeat',
              backgroundSize: '50px 50px',
            }}
          />

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
                <div className="grid-label">StudentId</div>
                <div className="grid-value" style={{ fontWeight: 600, color: '#334155' }}>{qrData}</div>
              </div>
              <div className="grid-row">
                <div className="grid-label">Phone</div>
                <div className="grid-value" style={{ fontWeight: 600, color: '#334155' }}>{parentPhone}</div>
              </div>
              
              <div className="grid-row">
                <div className="grid-label">College</div>
                <div className="grid-value">{college}</div>
              </div>
              
              <div className="grid-row">
                <div className="grid-label">Study Level</div>
                <div className="grid-value">{studyLevel}</div>
              </div>
              
              {/* <div className="grid-row">
                <div className="grid-label">Admission</div>
                <div className="grid-value">{admission}</div>
              </div> */}
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
            <div className="footer-left-accent">NEW GENERATION</div>
            <div className="footer-main-dark">
              <div className="footer-qr-anchor"></div>
              <a href="https://www.newgenaration.com" className="footer-url" target="_blank" rel="noopener noreferrer">www.newgeneration.com</a>
            </div>
          </footer>
        </div>

        {/* BACK OF CARD - SAME HEIGHT AS FRONT */}
        <div ref={backCardRef} className="relative" style={{ width: cardWidth, height: cardHeight }}>
          <div className="bg-gradient-to-br from-[#fefaf5] to-[#f5efe8] rounded-2xl shadow-2xl overflow-hidden border border-[#b86229]/20 w-full h-full flex flex-col">
            
            {/* Diamond Background Pattern - Full Card Body - Same size and color as front */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{ 
                backgroundImage: diamondPattern,
                backgroundRepeat: 'repeat',
                backgroundSize: '50px 50px'
              }}></div>
            </div>

            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#021327] to-[#0a2a4e] px-3 py-2 flex items-center gap-4 border-b-2 border-[#b86229] relative z-10">
              <div className="header-logo">
              <img className="image-logo" src="/png.png" alt="Logo 2" onError={(e) => e.target.style.display = 'none'} />
            </div>
              <div>
                <h3 className="text-white font-bold text-xl tracking-wide">NEW GENERATION SECONDARY SCHOOL</h3>
                {/* <p className="text-[#df9b6d] text-sm font-semibold tracking-wide">Excellence in Education | Quality for Life</p> */}
              </div>
            </div>
  
              
            {/* Main Content */}
            <div className="flex-1 p-6 relative z-10 flex flex-col">
              {/* Information Block */}
              <div className="  p-5 border-l-4  ">
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
                  <div className=" flex items-center justify-center ">
                     <img 
                  src="/stamp.png" 
                  alt="Digital Stamp" 
                  className="digital-stamp1"
                  onError={(e) => e.target.style.display = 'none'}
                />
                  </div>

                  <div className="flex flex-col ml-36">
                    <img src={logo} className='w-36 h-20 absolute flex mb-8 ml-4'/>
                    <p className="text-black border-b border-gray-400 h-4 w-52 mt-12 "></p>
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

            {/* Footer Bar */}
         
          </div>
        </div>
        </div>
        {/* end scale wrapper */}
      </div>
    );
  };

  // ============ RENDER LOGIC ============
  
  if (userRole === 'student') {
    if (loading) {
      return (
        <div className="min-h-screen bg-neutral-800 flex justify-center items-center">
          <div className="bg-[#1a2332] px-8 py-4 rounded-xl shadow-xl text-white flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading your ID card...</span>
          </div>
        </div>
      );
    }
    if (error) return <div className="min-h-screen bg-neutral-800 flex items-center justify-center text-red-500">{error}</div>;
    if (!student) return null;
    return renderIDCard();
  }

  if (currentView === 'idcard') {
    if (loadingIDCard) {
      return (
        <div className="min-h-screen bg-neutral-800 flex justify-center items-center">
          <div className="bg-[#1a2332] px-8 py-4 rounded-xl shadow-xl text-white flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="min-h-screen bg-neutral-800 flex justify-center items-center">
          <div className="bg-[#1a2332] px-8 py-4 rounded-xl shadow-xl text-white flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading students...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <button 
              onClick={goBackToClasses}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← Back to Classes
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Select Student</h1>
              <p className="text-gray-300">
                {selectedClass?.program} - Grade {selectedClass?.grade} {selectedClass?.section && `- Section ${selectedClass.section}`}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white"
            />
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg text-center">
              <p>No students found in this class</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((studentItem) => (
                <div
                  key={studentItem._id}
                  className="border rounded-lg p-4 bg-white flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer"
                >
                  <Avatar name={studentItem.name} image={studentItem.profileImage} size={44} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{studentItem.name}</h3>
                    <p className="text-gray-600 text-sm">Roll No: {studentItem.rollNumber || 'N/A'}</p>
                  </div>
                  <button
                    onClick={(e) => handleViewIDClick(studentItem, e)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-semibold"
                  >
                    View ID
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Class List View with Search Option
  if (loadingClasses) {
    return (
      <div className="min-h-screen bg-neutral-800 flex justify-center items-center">
        <div className="bg-[#1a2332] px-8 py-4 rounded-xl shadow-xl text-white flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading classes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Student ID Cards</h1>
          <p className="text-gray-300">Select a class to view student ID cards or search for a student directly</p>
        </div>
        
        {/* NEW: Student Search Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Student Directly
          </h2>
          <p className="text-gray-300 text-sm mb-4">Enter student name, email address, or ID number to view their ID card</p>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g., John Doe, john@email.com, or ID number..."
              value={studentSearchInput}
              onChange={(e) => {
                setStudentSearchInput(e.target.value);
                setSearchError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchStudentByIdentity();
                }
              }}
              className="flex-1 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={searchStudentByIdentity}
              disabled={searchingStudent}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searchingStudent ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
          
          {searchError && (
            <div className="mt-3 text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {searchError}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-neutral-800 text-gray-400">OR</span>
          </div>
        </div>
        
        {/* Classes Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Select by Class</h2>
          <input
            type="text"
            placeholder="Search class by program, grade, or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white"
          />
        </div>
        
        {classes.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg text-center">
            <p className="font-semibold mb-2">No classes found!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map((cls) => (
              <div
                key={cls._id}
                onClick={() => handleClassSelect(cls)}
                className="border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all bg-white hover:scale-105"
              >
                <h3 className="font-semibold text-xl text-[#1a2332]">{cls.program || 'General'}</h3>
                <p className="text-gray-600 mt-1">
                  Grade {cls.grade} {cls.section && `- Section ${cls.section}`}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm text-gray-500">Students: {cls.students?.length || 0}</p>
                  <p className="text-xs text-blue-600">View Students →</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentIDCard;