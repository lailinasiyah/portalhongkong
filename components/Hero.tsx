import React, { useRef } from "react";
import { useLanguage } from "../LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[85vh] md:h-[95vh] w-full flex items-center justify-center overflow-hidden"
    >

      {/* Parallax Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 scale-110"
      >
      <div
        className="w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/bidangkerja.webp')"
        }}
      />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70"></div>

      {/* Hero Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-5xl mx-auto px-8 py-12 text-center rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
      >

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
          <span className="bg-gradient-to-r from-white via-red-400 to-white bg-clip-text text-transparent animate-gradient">
            PT. MITRA SINERGI SUKSES
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl md:text-3xl font-semibold uppercase tracking-[0.25em] text-red-500 mb-8">
          {t.orgSub}
        </h2>

        {/* Divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-[1px] bg-white/40"></div>
          <div className="w-10 h-[4px] bg-red-600 mx-3 rounded-full"></div>
          <div className="w-16 h-[1px] bg-white/40"></div>
        </div>

        {/* Description */}
        <p className="text-sm md:text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
          {t.subWelcome}
        </p>

      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>

    </section>
  );
};

export default Hero;