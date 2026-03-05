
import React from 'react';
import { useLanguage } from '../LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t-8 border-red-600">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start text-center md:text-left">
          
          {/* Address */}
          <div>
            <h4 className="text-xl font-bold mb-6 flex items-center justify-center md:justify-start">
              <span className="border-b-2 border-red-600 pb-1">{t.addressLabel}</span>
            </h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-start justify-center md:justify-start">
                <span className="mr-2">📍</span>
                <span>
                  〒 65134 <br />
                  Jl. Mayjen Sungkono No.77, <br />
                  Wonokoyo, Kec. Kedungkandang, <br />
                  Kota Malang, Jawa Timur, Indonesia
                </span>
              </p>
            </div>
          </div>

          {/* Logo & Org Name */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 rounded-full p-2 flex items-center justify-center shadow-2xl">
              <img 
                src="assets/favicon.png" 
                alt="LPK MSS Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <h5 className="font-bold text-sm md:text-base text-blue-500 uppercase tracking-wider">
                PT. MITRA SINERGI SUKSES
              </h5>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {t.orgSub}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-bold mb-6 flex items-center justify-center md:justify-start">
              <span className="border-b-2 border-red-600 pb-1">{t.contactLabel}</span>
            </h4>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-center justify-center md:justify-start">
                <span className="mr-3">📞</span>
                <span>+62 811-314-300</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                {/* <span className="mr-3">✉️</span> */}
                {/* <span>lpkmitrasaranasejahtera@gmail.com</span> */}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} PT. MITRA SINERGI SUKSES. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
