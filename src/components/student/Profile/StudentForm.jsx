// StudentForm.jsx
import React from 'react';
import { Icon } from '../ManageStudent';
import { ImageUpload } from './ImageUpload';
import { ICONS, COLORS } from './constants';

export const StudentForm = ({ 
  formData, 
  setFormData, 
  profileImage, 
  setProfileImage, 
  loading, 
  onSubmit, 
  onCancel,
}) => {
  return (
    <div className="neon-card" style={{ marginBottom: 20, padding: '24px', animation: 'slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)', borderLeft: '4px solid #2563eb', borderRadius: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: COLORS.text, fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon d={ICONS.plus} size={20} color="#2563eb" />
        Add New Student
        <span style={{ fontSize: 11.5, color: COLORS.textSecondary, fontWeight: 400, marginLeft: 6 }}>• Fill required fields</span>
      </h2>
      
      {/* Important Notice for Student ID */}
      <div style={{ 
        background: '#eff6ff', 
        border: '1px solid #bfdbfe', 
        borderRadius: 8, 
        padding: '12px 16px', 
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <Icon d="M12 14l9-5-9-5-9 5 9 5z" size={18} color="#2563eb" />
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>Student ID is required for login.</span>
          <span style={{ fontSize: 12, color: '#3b82f6', marginLeft: 6 }}>Students will use this ID to access their account.</span>
        </div>
      </div>
      
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile Photo</label>
          <ImageUpload value={profileImage} onChange={setProfileImage} disabled={loading} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {/* Student ID Field - REQUIRED (replaces email) */}
         
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Full Name <span style={{ color: COLORS.danger }}>*</span></label>
            <input 
              className="pi" 
              type="text" 
              placeholder="Enter student full name" 
              value={formData.name} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>

           <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>
              Student ID <span style={{ color: COLORS.danger }}>*</span>
            </label>
            <input 
              className="pi" 
              type="text" 
              placeholder="e.g., STU2024001" 
              value={formData.studentId} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, studentId: e.target.value})} 
              style={{ borderColor: formData.studentId ? '#10b981' : '#e2e8f0' }}
            />
           
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Password <span style={{ color: COLORS.danger }}>*</span></label>
            <input 
              className="pi" 
              type="text" 
              placeholder="Create password" 
              value={formData.password} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Parent Phone <span style={{ color: COLORS.danger }}>*</span></label>
            <input 
              className="pi" 
              type="text" 
              placeholder="Parent phone number" 
              value={formData.parentPhone} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Roll No <span style={{ color: COLORS.danger }}>*</span></label>
            <input 
              className="pi" 
              type="text" 
              placeholder="e.g., 2024001" 
              value={formData.rollNumber} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Section</label>
            <input 
              className="pi" 
              type="text" 
              placeholder="A, B, C..." 
              value={formData.section} 
              disabled={loading} 
              onChange={e => setFormData({ ...formData, section: e.target.value })} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Gender <span style={{ color: COLORS.danger }}>*</span></label>
            <select 
              className="ps" 
              value={formData.sex} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, sex: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Age</label>
            <input 
              className="pi" 
              type="number" 
              placeholder="e.g., 15" 
              value={formData.age} 
              disabled={loading} 
              onChange={e => setFormData({ ...formData, age: e.target.value })} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Starting Grade <span style={{ color: COLORS.danger }}>*</span></label>
            <select 
              className="ps" 
              value={formData.grade} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, grade: e.target.value })}
            >
              <option value="">Select Grade</option>
              {[9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Program <span style={{ color: COLORS.danger }}>*</span></label>
            <select 
              className="ps" 
              value={formData.programs} 
              disabled={loading} 
              required 
              onChange={e => setFormData({ ...formData, programs: e.target.value })}
            >
              <option value="">Select Program</option>
              <option value="Social Science">Social Science</option>
              <option value="Natural Science">Natural Science</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Academic Year</label>
            <select 
              className="ps" 
              value={formData.academicYear} 
              disabled={loading} 
              onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
            >
              <option value="2019/2020">2019/2020</option>
              <option value="2020/2021">2020/2021</option>
              <option value="2021/2022">2021/2022</option>
              <option value="2022/2023">2022/2023</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={onCancel} 
            style={{ background: '#fff', color: COLORS.text, border: '1.5px solid #cbd5e1' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rotate 0.6s linear infinite' }} />Creating...</>
            ) : (
              <><Icon d={ICONS.check} size={15} color="#fff" />Create Student</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
