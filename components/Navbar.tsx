
import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';

interface NavbarProps {
  onAdminClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAdminClick }) => {
  const { setLanguage, language, t } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="absolute top-0 left-0 w-full z-20 p-4 md:p-6 flex justify-between items-center md:items-start">
      <div className="flex items-center space-x-3">
        <div className="bg-white p-1 rounded-full shadow-lg border-2 border-red-600 overflow-hidden w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
           <img 
            src="https://portal.lpkmss.com/wp-content/uploads/2023/12/LOGO-LPK-MSS-BULAT-300x300.png" 
            alt="LPK MSS Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md flex space-x-1 border border-red-100">
          <button 
            onClick={() => setLanguage('EN')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${language === 'EN' ? 'bg-red-600 text-white scale-110 shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}
            title="English"
          >
            🇬🇧
          </button>
          <button 
            onClick={() => setLanguage('TR')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${language === 'TR' ? 'bg-red-600 text-white scale-110 shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Turkish"
          >
            🇹🇷
          </button>
        </div>

        <div className="hidden md:flex space-x-2">
          {isAuthenticated ? (
            <>
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-md border border-gray-200 flex items-center shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-gray-700 tracking-widest">{user?.username}</span>
              </div>
              <button 
                onClick={onAdminClick}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors text-sm shadow-md active:scale-95"
              >
                Dashboard
              </button>
              <button 
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors text-sm shadow-md active:scale-95"
              >
                {t.logout}
              </button>
            </>
          ) : (
            <button 
              onClick={onAdminClick}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors text-sm shadow-md active:scale-95"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
