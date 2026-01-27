
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full h-full rounded-none shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-black text-white border-b border-white/10">
          <h3 className="text-lg font-bold truncate pr-4">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow bg-black">
          {type === 'pdf' ? (
              <iframe
                src={`${encodeURI(url)}#toolbar=0`}
                className="w-full h-full"
                title="PDF Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
              <div className="aspect-[9/16] h-full max-h-full max-w-full">
              <video
                src={encodeURI(url)}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black rounded-xl"
              />
              </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
