import React, { useRef } from "react";
import { useLanguage } from "../LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex h-[85vh] w-full items-center justify-center overflow-hidden md:h-[95vh]"
    >
      {/* Parallax Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 scale-110"
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/bag.webp')",
          }}
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70"></div>

      {/* Hero Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl translate-y-8 flex-col items-center justify-center px-4 pb-6 pt-20 text-center sm:px-6 md:translate-y-12 md:px-8"
      >
        {/* Title */}
        <img
          src="/assets/tittle.png"
          alt="PT. Mitra Sinergi Sukses"
          className="mx-auto -mb-5 block w-[min(92vw,1120px)] max-w-none object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,1)] sm:-mb-6 md:-mb-8"
        />

        {/* Subtitle */}
        <h2 className="-mt-2 mb-0 text-lg font-semibold uppercase tracking-[0.18em] text-red-500 sm:-mt-3 sm:text-xl md:-mt-4 md:text-3xl md:tracking-[0.25em]">
          {t.orgSub}
        </h2>

        {/* Divider */}
        <div className="mt-4 mb-0 flex items-center justify-center md:mt-5">
          <div className="h-[1px] w-16 bg-white/40"></div>
          <div className="mx-3 h-[4px] w-10 rounded-full bg-red-600"></div>
          <div className="h-[1px] w-16 bg-white/40"></div>
        </div>

        {/* Description */}
        <img
          src="/assets/subtittlerev.png"
          alt="Indonesian Manpower Recruitment Agency"
          className="mx-auto -mt-3 mb-0 w-[min(90vw,980px)] max-w-none drop-shadow-[0_6px_25px_rgba(0,0,0,0.9)] sm:-mt-4 md:-mt-5"
        />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default Hero;