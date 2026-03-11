
import React, { useEffect, useState } from 'react';
import { useData } from '../DataContext';
import { useLanguage } from '../LanguageContext';
import { getApiBaseUrl } from '../utils/api';

const ResourceSection: React.FC = () => {
  const { t, language } = useLanguage();

  // call api using use effect
  const api = getApiBaseUrl();
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
  const maxCount = Math.max(
  ...data.flatMap((s: any) => [s.female, s.male]),
  1
);

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
           <div className="flex items-end justify-between space-x-6 md:space-x-12 h-80 md:h-[420px] w-full mb-10 pt-10 px-6">
              {data.map((stat: any) => {
                const femaleHeight = (stat.female / maxCount) * 100;
                const maleHeight = (stat.male / maxCount) * 100;

                return (
                  <div key={stat.id} className="flex-1 flex flex-col items-center h-full">

                    <div className="flex items-end space-x-4 md:space-x-6 h-full">

                      {/* FEMALE */}
                      <div className="flex flex-col items-center justify-end h-full">
                        <div className="relative flex flex-col items-center justify-end h-full">
                            {/* angka mengikuti tinggi bar */}
                            <span
                              className="absolute text-sm md:text-base font-bold text-black-600"
                              style={{ bottom: `calc(${femaleHeight}% + 6px)` }}
                            >
                              {stat.female}
                            </span>

                            <div
                              className="w-14 md:w-16 bg-pink-500 rounded-lg"
                              style={{ height: `${Math.max(femaleHeight, 8)}%` }}
                            ></div>

                          </div>
                        <span className="text-[16px] mt-1 text-pink-600 font-bold">F</span>
                      </div>

                      {/* MALE */}
                      <div className="flex flex-col items-center justify-end h-full">
                        <div className="relative flex flex-col items-center justify-end h-full">

                          {/* angka mengikuti tinggi bar */}
                          <span
                            className="absolute text-sm md:text-base font-bold text-black-600"
                            style={{ bottom: `calc(${maleHeight}% + 6px)` }}
                          >
                            {stat.male}
                          </span>

                          <div
                            className="w-14 md:w-16 bg-blue-500 rounded-lg"
                            style={{ height: `${Math.max(maleHeight, 8)}%` }}
                          ></div>

                        </div>
                        <span className="text-[16px] mt-1 text-blue-600 font-bold">M</span>
                      </div>

                    </div>

                    {/* Category Name */}
                    <div className="mt-4 text-gray-900 font-black text-[12px] text-sm md:text-base text-center uppercase">
                      {stat.name}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Axis Line */}
            <div className="h-0.5 bg-gray-100 w-full mb-6"></div>

            <div className="flex items-center justify-center">
              <span className="inline-flex items-center text-[12px] text-sm md:text-base font-black uppercase tracking-[0.3em] text-gray-400">
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
