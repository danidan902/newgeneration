// Pagination.jsx
import React from 'react';
import { Icon } from '../ManageStudent';
import { ICONS } from './constants';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisible = 5;
  
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;
      if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div style={{ 
      display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center',
      padding: '16px 0', animation: 'fadeInUp 0.4s ease',
    }}>
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
      >
        <Icon d={ICONS.chevronLeft} size={16} />
      </button>
      
      {currentPage > Math.ceil(maxVisible / 2) + 1 && totalPages > maxVisible && (
        <>
          <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
          <span style={{ color: '#64748b', fontWeight: 600 }}>...</span>
        </>
      )}
      
      {getPageNumbers().map(page => (
        <button
          key={page}
          className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      {currentPage < totalPages - Math.floor(maxVisible / 2) && totalPages > maxVisible && (
        <>
          <span style={{ color: '#64748b', fontWeight: 600 }}>...</span>
          <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
      >
        <Icon d={ICONS.chevronRight} size={16} />
      </button>
      
      <div style={{ 
        marginLeft: 12, fontSize: 11, color: '#475569', fontWeight: 600,
        background: '#f1f5f9', padding: '6px 12px', borderRadius: 8,
      }}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};