
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import { Candidate } from '../types';
import PreviewModal from './PreviewModal';

interface CandidateSpreadsheetViewProps {
  onBack: () => void;
  initialCategoryId: string | null;
}

const CandidateSpreadsheetView: React.FC<CandidateSpreadsheetViewProps> = ({ onBack, initialCategoryId }) => {
  const { t } = useLanguage();
  const { candidates, categories, addCategory, updateCandidate } = useData();
  const { isAuthenticated, user } = useAuth();
  const [activeSheetId, setActiveSheetId] = useState(initialCategoryId || categories[0]?.id || 'caregiving');
  const [preview, setPreview] = useState<{ type: 'pdf' | 'video', url: string, title: string } | null>(null);
  const [waCandidate, setWaCandidate] = useState<Candidate | null>(null);

  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Sync activeSheetId if initialCategoryId changes while component is mounted
  useEffect(() => {
    if (initialCategoryId) {
      setActiveSheetId(initialCategoryId);
    }
  }, [initialCategoryId]);

  const filteredCandidates = candidates.filter(c => c.categoryId === activeSheetId);

  const openWhatsApp = (number: string, candidateName: string) => {
    const message = t.waMessageTemplate.replace('{name}', candidateName);
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = number.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
    setWaCandidate(null);
  };

  const handleAddSheet = () => {
    const name = prompt('Enter name for the new Sheet (Category):');
    if (name) addCategory(name);
  };

  const toggleCvAvailability = (candidate: Candidate) => {
    if (!isAdmin) return;
    updateCandidate(candidate.id, { cvAvailable: !candidate.cvAvailable });
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
      {/* Spreadsheet Header Bar */}
      <div className="bg-white border-b border-gray-300 p-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-600 rounded">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-700 leading-tight">{t.spreadsheetTitle}</h2>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Interactive Sheets View • Admin Managed</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded hover:bg-red-700 transition-colors shadow-sm"
        >
          {t.backToHome}
        </button>
      </div>

      {/* Mock toolbar */}
      <div className="bg-[#f1f3f4] border-b border-gray-300 px-4 py-1.5 flex space-x-4 text-[10px] font-medium text-gray-600 flex-shrink-0">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Insert</span>
        <span>Format</span>
        <span>Data</span>
        {isAdmin && (
          <button onClick={handleAddSheet} className="text-green-700 font-bold">+ New Sheet</button>
        )}
      </div>

      <main className="flex-grow overflow-auto relative">
        <table className="w-full border-collapse min-w-[1200px] text-[11px]">
          <thead className="sticky top-0 z-10 bg-[#f8f9fa]">
            <tr className="bg-[#e8eaed]">
              <th className="border border-gray-300 p-1 w-10 text-center text-gray-400"></th>
              <th className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-600 uppercase tracking-tight">{t.colNo}</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-600 uppercase tracking-tight">{t.colName}</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-600 uppercase tracking-tight">{t.colSex}</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-600 uppercase tracking-tight">{t.colAge}</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-600 uppercase tracking-tight">{t.colPassport}</th>
              <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-600 uppercase tracking-tight">{t.colCvLink}</th>
              <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-600 uppercase tracking-tight">{t.colVideoLink}</th>
              <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-600 uppercase tracking-tight">{t.colCvStatus}</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-bold text-gray-600 uppercase tracking-tight">{t.colWhatsapp}</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredCandidates.map((candidate, idx) => (
              <tr key={candidate.id} className="hover:bg-[#f1f3f4] transition-colors group">
                <td className="border border-gray-300 p-2 text-center bg-[#f8f9fa] text-gray-400 font-bold">{idx + 1}</td>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">{idx + 1}</td>
                <td className="border border-gray-300 px-4 py-2">
                   <div className="flex flex-col">
                     <span className="font-bold text-blue-800">{candidate.nameLocal}</span>
                     <span className="text-[9px] text-gray-400 font-bold uppercase">{candidate.code}</span>
                   </div>
                </td>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                  {candidate.sex === 'Male' ? t.male : t.female}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-bold text-gray-800">{candidate.age}</td>
                <td className="border border-gray-300 px-4 py-2">
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight ${
                     candidate.passportStatus === 'Ready' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                     {candidate.passportStatus === 'Ready' ? t.passportReady : t.passportProcess}
                   </span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {candidate.resumeUrl ? (
                    <button 
                      onClick={() => setPreview({ type: 'pdf', url: candidate.resumeUrl, title: `${candidate.nameEn} - CV` })}
                      className="p-1.5 bg-gray-100 hover:bg-blue-600 text-gray-400 hover:text-white rounded transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  ) : <span className="text-gray-300">-</span>}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {candidate.videoUrl ? (
                    <button 
                      onClick={() => setPreview({ type: 'video', url: candidate.videoUrl, title: `${candidate.nameEn} - Video Preview` })}
                      className="p-1.5 bg-gray-100 hover:bg-red-600 text-gray-400 hover:text-white rounded transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  ) : <span className="text-gray-300">-</span>}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                   {isAdmin ? (
                     <button
                       onClick={() => toggleCvAvailability(candidate)}
                       className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                         candidate.cvAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                       }`}
                       title="Click to toggle availability (Admin only)"
                     >
                       {candidate.cvAvailable ? t.cvAvailable : t.cvNotAvailable}
                     </button>
                   ) : (
                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                       candidate.cvAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                     }`}>
                       {candidate.cvAvailable ? t.cvAvailable : t.cvNotAvailable}
                     </span>
                   )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                   <button 
                    onClick={() => setWaCandidate(candidate)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-all shadow-md active:scale-95"
                   >
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                     </svg>
                   </button>
                </td>
              </tr>
            ))}
            {/* Empty Rows Fill */}
            {[...Array(Math.max(0, 15 - filteredCandidates.length))].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-300 p-2 text-center bg-[#f8f9fa] text-gray-400 font-bold">{filteredCandidates.length + i + 1}</td>
                <td className="border border-gray-300 px-4 py-2" colSpan={9}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Spreadsheet Tabs Bottom Bar */}
      <div className="bg-[#f1f3f4] border-t border-gray-300 px-4 py-1 flex items-center space-x-1 flex-shrink-0">
        <button 
          onClick={handleAddSheet}
          className="p-1 hover:bg-gray-200 rounded text-gray-600"
          title="Add Sheet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </button>
        <div className="flex items-center space-x-0.5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveSheetId(cat.id)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-t transition-colors ${
                activeSheetId === cat.id 
                ? 'bg-white border-x border-t border-gray-300 text-blue-800' 
                : 'hover:bg-gray-200 text-gray-500'
              }`}
            >
              {cat.titleEn}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Selection Modal */}
      {waCandidate && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWaCandidate(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-900 p-6 text-white text-center">
              <h3 className="text-xl font-black uppercase tracking-widest mb-1">{t.waContactTitle}</h3>
              <p className="text-blue-200 text-xs font-medium opacity-80">Candidate: {waCandidate.nameEn}</p>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => openWhatsApp('+62 82271674145', waCandidate.nameEn)}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 hover:border-red-600 hover:bg-red-50 rounded-xl transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-black text-gray-900 group-hover:text-red-600">{t.waRani}</p>
                  <p className="text-[10px] text-gray-400 font-bold">+62 822-7167-4145</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
              </button>
              
              <button 
                onClick={() => openWhatsApp('+62 85749160443', waCandidate.nameEn)}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 hover:border-red-600 hover:bg-red-50 rounded-xl transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-black text-gray-900 group-hover:text-red-600">{t.waAlivia}</p>
                  <p className="text-[10px] text-gray-400 font-bold">+62 857-4916-0443</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
              </button>
            </div>
            <button 
              onClick={() => setWaCandidate(null)}
              className="w-full py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-100"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal 
        isOpen={!!preview} 
        onClose={() => setPreview(null)} 
        type={preview?.type || 'pdf'} 
        url={preview?.url || ''} 
        title={preview?.title || ''} 
      />
    </div>
  );
};

export default CandidateSpreadsheetView;
