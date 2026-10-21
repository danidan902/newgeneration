// utils/exportExcel.js
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const exportExcel = (data, filename = 'students') => {
  if (!data || data.length === 0) {
    toast.error('No data to export');
    return;
  }
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success(`📊 Exported ${data.length} records`);
};