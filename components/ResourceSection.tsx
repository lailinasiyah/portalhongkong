import React from "react";
import { useLanguage } from "../LanguageContext";

const ResourceSection: React.FC = () => {
  const { t } = useLanguage();

  const resources = [
    {
      id: 1,
      title: "Company Profile (PDF)",
      image: "assets/fix.webp",
      link: "https://drive.google.com/file/d/1Z3hDLruRXxQ1P1eDP7wiAQu-n7KqszPD/view?usp=sharing",
    },
    {
      id: 2,
      title: "Company Introduction (Video)",
      image: "assets/company-video.webp",
      link: "https://drive.google.com/file/d/1f9kuhV2dNW7C4447L8PFJJf-gMA_i37O/view?usp=sharing",
    },
  ];

  return (
    <section className="bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4">

        {/* Center Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {resources.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 max-w-sm w-full"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover"
              />

              {/* Content */}
              <div className="p-5 text-center">

                <h3 className="text-white font-semibold mb-4 text-lg">
                  {item.title}
                </h3>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-700 hover:bg-blue-800 text-white text-sm px-5 py-2 rounded-md transition"
                >
                  Click Here
                </a>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default ResourceSection;