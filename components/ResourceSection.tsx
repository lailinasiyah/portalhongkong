
import React, { useEffect, useState } from 'react';
import { useData } from '../DataContext';
import { useLanguage } from '../LanguageContext';

const ResourceSection: React.FC = () => {
  const { t, language } = useLanguage();

  // call api using use effect
  const api = process.env.VITE_API_URL;
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${api}/dashboard`);
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  console.log(data);

  // Calculate the max count to scale the bars proportionally
  const maxCount = Math.max(...data.map(s => s.count_cat), 1);

  return (
    <section className="bg-diagonal-stripes py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">
            {t.chartTitle}
          </h2>
          <div className="w-20 h-1.5 bg-red-600 mx-auto mb-6 rounded-full shadow-sm"></div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            {t.chartSub}
          </p>
        </div>

        {/* Custom Bar Chart Card with requested styling */}
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full border border-gray-100">
          <div className="p-8 md:p-14">
            <div className="flex items-end justify-between space-x-2 md:space-x-8 h-64 md:h-80 w-full mb-8 pt-10 px-4">
              {data.map((stat: any) => {
                const heightPercentage = (stat.count_cat / maxCount) * 100;
                return (
                  <div key={stat.id} className="flex-1 flex flex-col items-center group/bar relative h-full">
                    {/* Tooltip value */}
                    <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 bg-red-600 text-white text-[10px] font-black py-1.5 px-4 rounded-full shadow-xl whitespace-nowrap z-10">
                      {stat.count_cat} {t.candidateUnit}
                    </div>

                    {/* The Bar */}
                    <div
                      className="w-full max-w-[80px] bg-gradient-to-t from-red-700 to-red-500 rounded-lg shadow-md group-hover/bar:shadow-red-200 group-hover/bar:scale-105 transition-all duration-500 ease-out relative cursor-pointer"
                      style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-lg"></div>

                      {/* Inline count for mobile */}
                      <div className="md:hidden absolute -top-6 w-full text-center text-[10px] font-black text-red-600">
                        {stat.count_cat}
                      </div>
                    </div>

                    {/* Category name */}
                    <div className="mt-6 text-gray-900 font-black text-[10px] md:text-xs tracking-widest text-center uppercase leading-tight h-10 flex items-center justify-center">
                      {stat.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Axis Line */}
            <div className="h-0.5 bg-gray-100 w-full mb-6"></div>

            <div className="flex items-center justify-center">
              <span className="inline-flex items-center text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400">
                <span className="w-4 h-4 bg-red-600 rounded shadow-sm mr-3"></span>
                {t.annualPoolLabel}
              </span>
            </div>
          </div>

          {/* Bottom Accent Line */}
          <div className="h-2 bg-red-600 w-full mt-auto"></div>
        </div>
      </div>
    </section>
  );
};

export default ResourceSection;
