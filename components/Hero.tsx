
import React from 'react';
import { useLanguage } from '../LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-center justify-center text-center px-4">
      {/* Background with optimized overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('https://portal.lpkmss.com/wp-content/uploads/2023/12/IMG_1234.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-white">
        <div className="inline-block bg-red-600 text-white text-[10px] md:text-sm font-bold px-4 py-1 rounded-full mb-6 tracking-widest uppercase animate-fade-in shadow-lg">
          {t.welcomeBadge}
        </div>
        <h1 className="text-4xl md:text-7xl lg:text-7xl font-black mb-4 drop-shadow-2xl tracking-tighter leading-none">
          PT. MITRA SINERGI SUKSES<br className="hidden md:block"/> 
        </h1>
        <h2 className="text-2xl md:text-5xl font-bold mb-8 drop-shadow-lg text-red-500 opacity-95">
          {t.orgSub}
        </h2>
        <div className="w-24 h-1.5 bg-red-600 mx-auto mb-8 rounded-full shadow-lg"></div>
        <p className="text-sm md:text-xl font-medium max-w-3xl mx-auto opacity-90 leading-relaxed drop-shadow-md">
          {t.subWelcome}
        </p>
      </div>
    </div>
  );
};

export default Hero;
