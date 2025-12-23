
import React from 'react';
import { useLanguage } from '../LanguageContext';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'pdf' | 'video';
  url: string;
  title: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, type, url, title }) => {
  if (!isOpen) return null;

  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 truncate">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow bg-gray-100">
          {type === 'pdf' ? (
            <iframe 
              src={`${url}#toolbar=0`} 
              className="w-full h-full border-none"
              title="PDF Preview"
            ></iframe>
          ) : (
            <video 
              src={url} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            ></video>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
