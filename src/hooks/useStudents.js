// hooks/useStudents.js
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { computeCurrentGrade } from '../utils/computeCurrentGrade';

export const useStudents = (isSuperAdmin = false) => {
  const [students, setStudents] = useState([]);
  const [graduatedStudents, setGraduatedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2019/2020');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(100);
  const [grades, setGrades] = useState([]);
  const [programs, setPrograms] = useState([]); // ← Make sure this is defined

  const fetchStudents = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/users/students-with-enrollment?academicYear=${selectedAcademicYear}`);
      
      if (response.data.success) {
        const active = response.data.students.filter(s => 
          s.grade !== 'Graduated' && 
          s.enrollmentStatus !== 'graduated'
        );
        
        const graduated = response.data.students.filter(s => 
          s.grade === 'Graduated' || 
          s.enrollmentStatus === 'graduated'
        );
        
        setStudents(active);
        setGraduatedStudents(graduated);
        
        const uniqueGrades = [...new Set(active.map(s => s.grade).filter(g => g && g !== 'Not Enrolled'))];
        const uniquePrograms = [...new Set(active.map(s => s.program).filter(p => p && p !== 'N/A'))];
        setGrades(uniqueGrades);
        setPrograms(uniquePrograms); // ← Make sure this is set
      } else {
        const fallbackResponse = await api.get('/users/role/student');
        const sorted = fallbackResponse.data.sort((a, b) => 
          new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
        );
        const studentsWithYear = sorted.map(s => ({
          ...s,
          academicYear: selectedAcademicYear,
          program: s.programs,
          baseGrade: s.baseGrade || parseInt(s.grade) || 9,
          baseAcademicYear: s.baseAcademicYear || selectedAcademicYear
        }));
        
        const active = studentsWithYear.filter(s => s.grade !== 'Graduated');
        const graduated = studentsWithYear.filter(s => s.grade === 'Graduated');
        
        setStudents(active);
        setGraduatedStudents(graduated);
        
        const uniqueGrades = [...new Set(active.map(s => s.grade).filter(Boolean))];
        const uniquePrograms = [...new Set(active.map(s => s.programs).filter(Boolean))];
        setGrades(uniqueGrades);
        setPrograms(uniquePrograms); // ← Make sure this is set
      }
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch students');
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedAcademicYear]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchTerm.toLowerCase();
      const computedGrade = computeCurrentGrade(s, selectedAcademicYear);
      
      const matchesSearch = !q ||
        (s.name?.toLowerCase().includes(q) ||
         s.email?.toLowerCase().includes(q) ||
         s.rollNumber?.toString().includes(q));
      
      const matchesGrade = !selectedGrade || computedGrade === parseInt(selectedGrade);
      const matchesProgram = !selectedProgram || (s.program === selectedProgram || s.programs === selectedProgram);
      
      return matchesSearch && matchesGrade && matchesProgram;
    });
  }, [students, searchTerm, selectedGrade, selectedProgram, selectedAcademicYear]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * studentsPerPage;
    return filteredStudents.slice(start, start + studentsPerPage);
  }, [filteredStudents, currentPage, studentsPerPage]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const stats = useMemo(() => ({
    total: students.length,
    male: students.filter(s => s.sex === 'Male').length,
    female: students.filter(s => s.sex === 'Female').length,
    grades: grades.length,
    graduated: graduatedStudents.length,
  }), [students, grades, graduatedStudents]);

  const getPromotionStats = () => {
    const stats = { grade9: 0, grade10: 0, grade11: 0, grade12: 0 };
    students.forEach(s => {
      const computedGrade = computeCurrentGrade(s, selectedAcademicYear);
      if (computedGrade === 9) stats.grade9++;
      else if (computedGrade === 10) stats.grade10++;
      else if (computedGrade === 11) stats.grade11++;
      else if (computedGrade === 12) stats.grade12++;
    });
    return stats;
  };

  // ← MAKE SURE ALL VALUES ARE RETURNED
  return {
    students,
    graduatedStudents,
    loading,
    setLoading,
    fetching,
    setFetching,
    promoting,
    setPromoting,
    searchTerm,
    setSearchTerm,
    selectedGrade,
    setSelectedGrade,
    selectedProgram,
    setSelectedProgram,
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentPage,
    setCurrentPage,
    studentsPerPage,
    setStudentsPerPage,
    grades,
    programs, // ← Make sure programs is included in the return
    filteredStudents,
    paginatedStudents,
    totalPages,
    stats,
    getPromotionStats,
    fetchStudents,
  };
};