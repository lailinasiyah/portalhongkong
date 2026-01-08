
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      <style>
        {`
          @keyframes spin-custom {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .custom-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(220, 38, 38, 0.1);
            border-left-color: #dc2626;
            border-radius: 50%;
            animation: spin-custom 1s linear infinite;
            position: relative;
          }
          .custom-spinner::after {
            content: '';
            position: absolute;
            inset: 6px;
            border: 4px solid rgba(220, 38, 38, 0.05);
            border-right-color: #dc2626;
            border-radius: 50%;
            animation: spin-custom 2s linear infinite reverse;
          }
        `}
      </style>
      <div className="flex flex-col items-center">
        <div className="custom-spinner mb-6"></div>
        <div className="flex flex-col items-center">
            <h2 className="text-white text-xs font-black tracking-[0.5em] uppercase opacity-50 animate-pulse">
                PT. Mitra Sinergi Sukses
            </h2>
            <h2 className="text-white text-xs font-black tracking-[0.5em] uppercase opacity-20 animate-pulse">
               Hospitality and Spa Candidate's Portal
            </h2>
        </div>
      </div>
    </div>
  );
};

export default Loader;
