import React from 'react';

const ProfessionalGlobalHealthIdCard = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-6 font-sans">
      {/* Outer Card Container */}
      <div className="relative w-[600px] h-[380px] bg-white rounded-[20px] border border-slate-200 shadow-xl overflow-hidden text-[#0B192C] select-none">

        {/* Lanyard Hole Slot */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-50 border border-slate-300 rounded-full z-40 shadow-inner"></div>

        {/* ================= BACKGROUND WATERMARK ================= */}
        <div className="absolute right-[-20px] top-[70px] w-80 h-80 opacity-[0.04] pointer-events-none z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#0B192C]">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 50,8 L 50,92 M 8,50 L 92,50" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="50" cy="50" rx="25" ry="42" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {/* ================= HEADER WITH GOLD ACCENT ================= */}
        <div className="absolute top-0 left-0 right-0 h-[88px] bg-[#0B192C] z-10 flex items-center justify-between px-6 pt-3">
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none"></div>

          {/* Top Left Logo & Title */}
          <div className="flex items-center space-x-3 z-10">
            {/* Logo Emblem */}
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="45" r="36" fill="none" stroke="#D4AF37" strokeWidth="3" />
                <path d="M 14,45 L 86,45 M 50,9 L 50,81" stroke="#D4AF37" strokeWidth="2" />
                <ellipse cx="50" cy="45" rx="20" ry="36" fill="none" stroke="#D4AF37" strokeWidth="2" />
                <line x1="50" y1="12" x2="50" y2="78" stroke="#ffffff" strokeWidth="4" />
                <circle cx="50" cy="12" r="4" fill="#ffffff" />
                <path d="M 38,25 Q 62,35 50,48 Q 38,60 62,70" fill="none" stroke="#ffffff" strokeWidth="3" />
                <path d="M 20,70 Q 35,85 50,75 Q 65,85 80,70 Q 50,95 20,70 Z" fill="#D4AF37" />
              </svg>
            </div>

            {/* Title Text */}
            <div className="flex flex-col">
              <h1 className="text-[17px] font-black text-white tracking-wider leading-none uppercase">
                GLOBAL HEALTH
              </h1>
              <span className="text-[11px] font-bold text-[#D4AF37] tracking-widest uppercase mt-0.5">
                INVESTMENT COMPANY
              </span>
              <span className="text-[8px] text-slate-300 tracking-tight mt-[2px] font-medium">
                Investing in Health, Building the Future
              </span>
            </div>
          </div>

          {/* Top Right Verified Shield Badge */}
          <div className="flex items-center space-x-2 bg-[#1E3E62]/40 border border-[#D4AF37]/40 px-2.5 py-1.5 rounded-lg z-10 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#D4AF37] fill-current">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black text-white leading-none tracking-wide">VERIFIED</span>
              <span className="text-[7.5px] font-bold text-slate-300 leading-none tracking-wide mt-[2px]">& SECURED</span>
            </div>
          </div>

          {/* Golden Bottom Divider */}
          <div className="absolute bottom-[-4px] left-0 right-0 h-[4px] bg-[#D4AF37]"></div>
        </div>

        {/* ================= LEFT COLUMN: PHOTO & EMPLOYEE ID ================= */}
        <div className="absolute top-[102px] left-5 z-20 flex flex-col items-center">
          {/* Photo Frame */}
          <div className="w-[155px] h-[180px] rounded-xl border-[2px] border-[#1E3E62] overflow-hidden bg-slate-100 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
              alt="Michael O. Anderson"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Employee ID Badge Section */}
          <div className="w-[170px] bg-[#0B192C] rounded-xl mt-2.5 p-2 text-center shadow-md border border-[#1E3E62]">
            <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase block">
              EMPLOYEE ID
            </span>
            <span className="text-[13px] font-black text-[#D4AF37] tracking-wider block my-0.5">
              GHIC-VCS-0027
            </span>

            {/* Barcode Strip */}
            <div className="bg-white rounded p-1 mt-1 flex justify-center items-center h-7">
              <svg viewBox="0 0 140 24" className="w-full h-full">
                <rect x="0" y="0" width="3" height="24" fill="#000" />
                <rect x="5" y="0" width="1" height="24" fill="#000" />
                <rect x="8" y="0" width="4" height="24" fill="#000" />
                <rect x="14" y="0" width="2" height="24" fill="#000" />
                <rect x="18" y="0" width="1" height="24" fill="#000" />
                <rect x="21" y="0" width="5" height="24" fill="#000" />
                <rect x="28" y="0" width="2" height="24" fill="#000" />
                <rect x="32" y="0" width="1" height="24" fill="#000" />
                <rect x="36" y="0" width="3" height="24" fill="#000" />
                <rect x="40" y="0" width="4" height="24" fill="#000" />
                <rect x="46" y="0" width="1" height="24" fill="#000" />
                <rect x="49" y="0" width="2" height="24" fill="#000" />
                <rect x="53" y="0" width="5" height="24" fill="#000" />
                <rect x="60" y="0" width="1" height="24" fill="#000" />
                <rect x="63" y="0" width="3" height="24" fill="#000" />
                <rect x="68" y="0" width="2" height="24" fill="#000" />
                <rect x="72" y="0" width="4" height="24" fill="#000" />
                <rect x="78" y="0" width="1" height="24" fill="#000" />
                <rect x="81" y="0" width="3" height="24" fill="#000" />
                <rect x="86" y="0" width="2" height="24" fill="#000" />
                <rect x="90" y="0" width="5" height="24" fill="#000" />
                <rect x="97" y="0" width="1" height="24" fill="#000" />
                <rect x="100" y="0" width="3" height="24" fill="#000" />
                <rect x="105" y="0" width="4" height="24" fill="#000" />
                <rect x="112" y="0" width="2" height="24" fill="#000" />
                <rect x="116" y="0" width="1" height="24" fill="#000" />
                <rect x="120" y="0" width="3" height="24" fill="#000" />
                <rect x="125" y="0" width="5" height="24" fill="#000" />
                <rect x="132" y="0" width="1" height="24" fill="#000" />
                <rect x="135" y="0" width="2" height="24" fill="#000" />
                <rect x="137" y="0" width="3" height="24" fill="#000" />
              </svg>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: EMPLOYEE DETAILS ================= */}
        <div className="absolute top-[102px] left-[202px] right-5 z-20">
          
          {/* Employee Name */}
          <h2 className="text-[20px] font-black text-[#0B192C] tracking-wide uppercase leading-tight">
            MICHAEL O. ANDERSON
          </h2>
          
          {/* Designation Title */}
          <h3 className="text-[12px] font-bold text-[#1E3E62] tracking-wider uppercase mt-0.5 pb-2 border-b border-slate-200">
            DIRECTOR – VCS BANKING OPERATIONS
          </h3>

          {/* Details List */}
          <div className="mt-2.5 space-y-2.5">
            
            {/* Department */}
            <div className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1E3E62] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-[#1E3E62] tracking-wider uppercase block">
                  DEPARTMENT
                </span>
                <span className="text-[10.5px] font-bold text-slate-700 leading-tight block">
                  Payment Authorization & Investor Relations
                </span>
              </div>
            </div>

            {/* Authority */}
            <div className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1E3E62] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-[#1E3E62] tracking-wider uppercase block">
                  AUTHORITY
                </span>
                <span className="text-[10px] font-bold text-slate-700 leading-tight block max-w-[340px]">
                  Approval of All Payments to All Investors with Trading Accounts on the GHIC Platform
                </span>
              </div>
            </div>

            {/* Access Level */}
            <div className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1E3E62] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13H19v6h-2.8z" />
                </svg>
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-[#1E3E62] tracking-wider uppercase block">
                  ACCESS LEVEL
                </span>
                <span className="text-[10.5px] font-bold text-slate-700 leading-tight block">
                  Senior Executive – Payment Approval Division
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Section: Signature, Issue Date, QR Code */}
          <div className="mt-3 pt-2 flex items-end justify-between pr-1">
            
            {/* Signature Area */}
            <div className="flex flex-col items-center">
              <span className="font-[cursive] text-lg text-slate-900 select-none transform -rotate-2 -mb-1">
                J. Anderson
              </span>
              <div className="w-28 border-b border-slate-300 my-[1px]"></div>
              <span className="text-[8px] font-black text-slate-600 tracking-wider uppercase mt-0.5">
                AUTHORIZED SIGNATURE 
              </span>
            </div>

            {/* Issue Date */}
            <div className="flex flex-col items-center border-l border-slate-200 pl-3">
              <span className="text-[8px] font-black text-slate-600 tracking-wider uppercase">
                {/* ISSUE DATE issu date name of this name if local name if name  */}
              </span>
              <span className="text-[10px] font-bold text-slate-800 mt-0.5">
                28 MAY 2024
              </span>
            </div>

            {/* QR Code Block */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white p-1 rounded border border-slate-200 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-[#0B192C]">
                  <rect x="5" y="5" width="30" height="30" />
                  <rect x="10" y="10" width="20" height="20" fill="#fff" />
                  <rect x="15" y="15" width="10" height="10" />
                  <rect x="65" y="5" width="30" height="30" />
                  <rect x="70" y="10" width="20" height="20" fill="#fff" />
                  <rect x="75" y="15" width="10" height="10" />
                  <rect x="5" y="65" width="30" height="30" />
                  <rect x="10" y="70" width="20" height="20" fill="#fff" />
                  <rect x="15" y="75" width="10" height="10" />
                  <rect x="40" y="10" width="8" height="8" />
                  <rect x="50" y="5" width="8" height="15" />
                  <rect x="40" y="25" width="15" height="8" />
                  <rect x="10" y="42" width="15" height="15" />
                  <rect x="30" y="40" width="10" height="10" />
                  <rect x="45" y="45" width="12" height="12" />
                  <rect x="65" y="40" width="15" height="8" />
                  <rect x="85" y="45" width="10" height="15" />
                  <rect x="40" y="65" width="8" height="25" />
                  <rect x="55" y="70" width="15" height="8" />
                  <rect x="75" y="65" width="20" height="8" />
                  <rect x="70" y="80" width="10" height="12" />
                  <rect x="85" y="80" width="10" height="10" />
                </svg>
              </div>
              <span className="w-full bg-[#1E3E62] text-white text-[7.5px] font-bold tracking-wider uppercase text-center py-[2px] rounded-sm mt-1 shadow-xs">
                SCAN TO VERIFY  
          {/* <span>this name of name of local name of this if then name of local name of this this appro </span> */}
              </span>
            </div>

          </div>

        </div>

        {/* ================= FOOTER BAR ================= */}
        <div className="absolute bottom-0 left-0 right-0 h-[22px] bg-[#0B192C] text-slate-300 text-[8.5px] font-bold tracking-widest uppercase flex items-center justify-center space-x-6 z-30">
          <span>INTEGRITY</span>
          <span className="text-[#D4AF37]">•</span>
          <span>TRANSPARENCY</span>
          <span className="text-[#D4AF37]">•</span>
          <span>SECURITY</span>
          <span className="text-[#D4AF37]">•</span>
          <span>TRUST</span>
        </div>

      </div>
    </div>
  );
};

export default ProfessionalGlobalHealthIdCard;