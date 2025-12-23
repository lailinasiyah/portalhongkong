
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useData } from '../DataContext';
import PreviewModal from './PreviewModal';

interface CandidateGridViewProps {
  onBack: () => void;
  categoryId: string | null;
}

const CandidateGridView: React.FC<CandidateGridViewProps> = ({ onBack, categoryId }) => {
  const { t, language } = useLanguage();
  const { candidates, categories } = useData();
  const [preview, setPreview] = useState<{ type: 'pdf' | 'video', url: string, title: string } | null>(null);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const filteredCandidates = candidates.filter(c => c.categoryId === categoryId);

  return (
    <div className="min-h-screen bg-[#0b1a2a] text-white font-sans selection:bg-blue-600 pb-20">
      <header className="py-12 px-4 border-b border-blue-900/50 bg-[#0d1e2e]">
        <div className="max-w-7xl mx-auto text-center">
          <button 
            onClick={onBack}
            className="mb-8 group flex items-center mx-auto text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 hover:text-white transition-all"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.backToHome}
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            <span className="text-white">
              {language === 'EN' ? selectedCategory?.titleEn : selectedCategory?.titleTr} 候補者一覧 - 
            </span>
            <span className="text-white ml-2">{t.listTitle}</span>
          </h1>
          <p className="text-blue-200 text-xs md:text-sm font-medium opacity-80 mb-2">
            日本語・特定技能資格持ち、応募可能の候補者一覧
          </p>
          <p className="text-blue-300 text-xs md:text-sm font-medium opacity-80">
            {t.listSub1}
          </p>
          <p className="text-white text-xs md:text-sm font-bold mt-2 tracking-wide uppercase opacity-90">
            {t.listSub2}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="border border-blue-500/30 bg-[#0d1e2e] p-6 rounded-lg mb-12 max-w-sm">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded bg-white/5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300">{t.jpResume}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded bg-white/5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300">{t.jpVideo}</span>
            </div>
          </div>
        </div>

        {filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-blue-900 border border-blue-700/50 rounded overflow-hidden flex flex-col group hover:border-blue-400 transition-all duration-300 shadow-xl">
                <div className="flex h-64 md:h-72">
                  <div className="w-[60%] border-r border-blue-800/50">
                    <img src={candidate.photoUrl} alt={candidate.nameEn} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-[40%] flex flex-col justify-center items-center py-4 space-y-8 bg-blue-900">
                    <button 
                      disabled={!candidate.resumeUrl}
                      onClick={() => setPreview({ type: 'pdf', url: candidate.resumeUrl, title: `${candidate.nameEn} - CV` })} 
                      className={`flex flex-col items-center group/btn ${!candidate.resumeUrl && 'opacity-20 cursor-not-allowed'}`}
                    >
                      <div className="p-2 mb-1 group-hover/btn:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-white tracking-widest">{t.jpCardResume}</span>
                    </button>
                    <button 
                      disabled={!candidate.videoUrl}
                      onClick={() => setPreview({ type: 'video', url: candidate.videoUrl, title: `${candidate.nameEn} - Intro Video` })} 
                      className={`flex flex-col items-center group/btn ${!candidate.videoUrl && 'opacity-20 cursor-not-allowed'}`}
                    >
                      <div className="p-2 mb-1 group-hover/btn:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-white tracking-widest">{t.jpCardVideo}</span>
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-blue-900 border-t border-blue-800/50 flex flex-col justify-center min-h-[100px]">
                  <p className="text-[10px] font-bold text-blue-300 mb-1">{candidate.code}</p>
                  <h4 className="text-[11px] font-bold text-white mb-0.5 uppercase tracking-wide">{candidate.nameLocal}</h4>
                  <p className="text-[10px] font-black text-blue-100 uppercase opacity-80">{candidate.nameEn}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-blue-900/20 rounded-xl border border-blue-800/50">
            <svg className="w-16 h-16 text-blue-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-blue-300 text-lg font-bold">No candidates available for this category yet.</p>
          </div>
        )}
      </main>
      <PreviewModal isOpen={!!preview} onClose={() => setPreview(null)} type={preview?.type || 'pdf'} url={preview?.url || ''} title={preview?.title || ''} />
    </div>
  );
};

export default CandidateGridView;
