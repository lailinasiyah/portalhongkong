
import React from 'react';
import { useLanguage } from '../LanguageContext';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'pdf' | 'video' | 'file';
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
        <div className="flex-grow min-h-0 bg-black">
          {type === 'pdf' ? (
              <iframe
                src={`${url}#toolbar=0`}
                className="w-full h-full"
                title="PDF Preview"
              />
            ) : type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-black p-3 md:p-6">
                <video
                  src={url}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-full w-auto h-auto object-contain bg-black"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-950 p-6 text-center text-white">
                <div className="max-w-md rounded-lg border border-white/15 bg-white/10 p-6">
                  <h4 className="text-base font-black uppercase tracking-widest">Excel CV Ready</h4>
                  <p className="mt-3 text-sm text-white/75">
                    Browser tidak bisa menampilkan XLSX inline seperti PDF. Buka file untuk preview di Excel/WPS.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700"
                  >
                    Open CV
                  </a>
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
