
import React from 'react';
import { CANDIDATE_STATS } from '../constants';
import { useLanguage } from '../LanguageContext';

const ResourceSection: React.FC = () => {
  const { t } = useLanguage();
  const maxCount = Math.max(...CANDIDATE_STATS.map(s => s.count));

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            {t.chartTitle}
          </h2>
          <div className="w-20 h-1.5 bg-red-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t.chartSub}
          </p>
        </div>

        {/* Custom Bar Chart */}
        <div className="bg-gray-50 p-6 md:p-12 rounded-3xl shadow-inner border border-gray-100">
          <div className="flex items-end justify-between space-x-2 md:space-x-8 h-64 md:h-80 w-full mb-6 pt-10 px-4">
            {CANDIDATE_STATS.map((stat, index) => {
              const heightPercentage = (stat.count / maxCount) * 100;
              return (
                <div key={stat.year} className="flex-1 flex flex-col items-center group relative h-full">
                  {/* Tooltip-like value */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded shadow-lg whitespace-nowrap z-10">
                    {stat.count} {t.candidateUnit}
                  </div>
                  
                  {/* The Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-red-700 to-red-500 rounded-t-lg shadow-md group-hover:shadow-red-200 group-hover:scale-105 transition-all duration-500 ease-out relative cursor-pointer"
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {/* Inline count for mobile */}
                    <div className="md:hidden absolute -top-5 w-full text-center text-[10px] font-bold text-red-600">
                      {stat.count}
                    </div>
                  </div>
                  
                  {/* Year Label */}
                  <div className="mt-4 text-gray-700 font-bold text-xs md:text-sm tracking-widest">
                    {stat.year}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Axis Line */}
          <div className="h-px bg-gray-300 w-full mb-4"></div>
          
          <div className="text-center">
            <span className="inline-flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">
              <span className="w-3 h-3 bg-red-600 rounded-sm mr-2"></span>
              Annual Candidate Pool
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourceSection;
