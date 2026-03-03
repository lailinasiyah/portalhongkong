
import React from 'react';

interface PortalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'outline' | 'blue';
}

const PortalButton: React.FC<PortalButtonProps> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseStyles = "px-6 py-1.5 text-xs md:text-sm transition-all duration-300 font-medium rounded shadow-sm";
  
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 active:scale-95",
    outline: "border-2 border-white text-white hover:bg-white/20 active:scale-95",
    blue: "bg-blue-700 text-white hover:bg-blue-800 active:scale-95"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default PortalButton;
