// utils/computeCurrentGrade.js
export const computeCurrentGrade = (student, currentYear) => {
  if (!student) return null;
  
  // If student has a baseGrade property, use it
  let baseGrade = student.baseGrade;
  
  // If no baseGrade, try to extract from existing grade
  if (!baseGrade) {
    const existingGrade = student.grade || student.initialGrade || '';
    const gradeMatch = existingGrade.match(/\d+/);
    if (gradeMatch) {
      baseGrade = parseInt(gradeMatch[0]);
    } else {
      return existingGrade || 'N/A';
    }
  }
  
  // Get base academic year
  let baseYear = student.baseAcademicYear;
  if (!baseYear) {
    baseYear = student.academicYear || '2019/2020';
  }
  
  // Parse years
  const baseYearNum = parseInt(baseYear.split('/')[0]);
  const currentYearNum = parseInt(currentYear.split('/')[0]);
  
  // Calculate grade difference
  const yearDiff = currentYearNum - baseYearNum;
  const computedGrade = baseGrade + yearDiff;
  
  // Ensure grade doesn't exceed 12
  if (computedGrade > 12) return 'Graduated';
  if (computedGrade < 9) return computedGrade;
  
  return computedGrade;
};

export const getDisplayGrade = (student, selectedAcademicYear) => {
  if (!student) return '—';
  const computedGrade = computeCurrentGrade(student, selectedAcademicYear);
  if (computedGrade === 'Graduated') return 'Graduated';
  if (computedGrade !== null) return `Grade ${computedGrade}`;
  return student.grade || '—';
};