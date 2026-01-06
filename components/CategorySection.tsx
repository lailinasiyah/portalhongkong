
import React from 'react';
import { useData } from '../DataContext';
import PortalButton from './PortalButton';
import { useLanguage } from '../LanguageContext';

interface CategorySectionProps {
  onViewGrid: (categoryId: string) => void;
  onViewSpreadsheet: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onViewGrid, onViewSpreadsheet }) => {
  const { t, language } = useLanguage();
  const { categories } = useData();

  return (
    <section className="bg-slate-50 pb-24">
      {/* Banner / Divider */}
      <div className="bg-blue-900 text-white text-center py-8 px-4 mb-16 shadow-2xl border-b-8 border-red-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-10 rotate-45 transform translate-x-16 -translate-y-16"></div>
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">{t.candidatesTitle}</h3>
          <p className="text-sm md:text-lg opacity-90 mb-6 max-w-3xl mx-auto">
            {t.candidatesSub}
          </p>
          <div className="flex justify-center">
            <PortalButton 
              onClick={onViewSpreadsheet}
              variant="outline" 
              className="px-10 py-2 border-2 hover:bg-white hover:text-blue-900 transition-all"
            >
              {t.viewList}
            </PortalButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center">
        {/* Call to Action Box - Color matched to active buttons */}
        <div className="inline-block bg-white border-2 border-dashed border-red-200 rounded-2xl shadow-sm py-6 px-10 mb-16 max-w-4xl w-full md:w-auto">
           <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
             <span className="text-gray-900 font-bold text-lg md:text-xl">
               {t.candidatePrompt.split(',')[0]},
             </span>
             {/* Static label colored same as active buttons (blue-700) */}
             <div 
              className="px-6 py-1.5 text-xs md:text-sm font-medium rounded shadow-md bg-blue-700 text-white cursor-default whitespace-nowrap select-none"
            >
              {t.viewDetails}
            </div>
             <span className="text-gray-900 font-bold text-lg md:text-xl">
               {t.candidatePrompt.split(',').slice(1).join(',')}
             </span>
           </div>
        </div>

        {/* Category Grid - 2 columns per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {categories.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={language === 'EN' ? item.titleEn : item.titleTr} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 text-left">
                  <h4 className="text-white text-2xl font-black mb-1 uppercase tracking-tight">
                    {language === 'EN' ? item.titleEn : item.titleTr}
                  </h4>
                  <div className="w-12 h-1 bg-red-600 rounded-full group-hover:w-24 transition-all duration-300"></div>
                </div>
              </div>
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-500 text-sm font-medium italic">
                  {t.availableFor.replace('{category}', language === 'EN' ? item.titleEn : item.titleTr)}
                </p>
                <PortalButton 
                  onClick={() => onViewGrid(item.id)}
                  variant="blue" 
                  className="w-full md:w-auto px-8"
                >
                  {t.viewDetails}
                </PortalButton>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-24 pb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-red-200 to-transparent mb-12"></div>
          <p className="text-gray-800 text-xl md:text-2xl font-black mb-6 tracking-tight uppercase">{t.companyWebsite}</p>
          <PortalButton 
            onClick={() => window.open('https://turki.mitragroup.id/', '_blank')}
            variant="blue" 
            className="px-12 py-3 text-lg rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
             {t.visitWebsite}
          </PortalButton>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
