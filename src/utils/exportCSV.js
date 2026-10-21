// utils/exportCSV.js
import Papa from 'papaparse';
import toast from 'react-hot-toast';

export const exportCSV = (data, filename = 'students') => {
  if (!data || data.length === 0) {
    toast.error('No data to export');
    return;
  }
  
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  toast.success('📄 CSV downloaded');
};