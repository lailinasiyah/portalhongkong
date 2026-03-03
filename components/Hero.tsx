
import React from 'react';
import { useLanguage } from '../LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-center justify-center text-center px-4">
      {/* Background with Turkey-themed image (Cappadocia) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1542189412744-bfabf27522ee?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      >
        {/* Transparent Overlay - Not too thick, allows Turkey theme to show through */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60 backdrop-blur-[2px]"></div>
        
        {/* Subtle Red/White tint to match theme */}
        <div className="absolute inset-0 bg-red-900/10 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-white mt-12">
        <h1 className="text-4xl md:text-7xl lg:text-7xl font-black mb-4 drop-shadow-2xl tracking-tighter leading-none">
          PT. MITRA SINERGI SUKSES
        </h1>
        <h2 className="text-2xl md:text-5xl font-bold mb-8 drop-shadow-lg text-red-600 opacity-100 uppercase tracking-tight">
          {t.orgSub}
        </h2>
        <div className="w-24 h-1.5 bg-red-600 mx-auto mb-8 rounded-full shadow-lg"></div>
        <p className="text-sm md:text-xl font-medium max-w-3xl mx-auto opacity-90 leading-relaxed drop-shadow-md">
          {t.subWelcome}
        </p>
      </div>
      
      {/* Bottom fade for smoother transition to next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero;
