import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import { Candidate } from '../types';
import PreviewModal from './PreviewModal';
import { buildDocumentUrl, getApiBaseUrl } from '../utils/api';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

interface CandidateSpreadsheetViewProps {
  onBack: () => void;
  initialCategoryId: number | null;
}

const CandidateSpreadsheetView: React.FC<CandidateSpreadsheetViewProps> = ({
  onBack,
  initialCategoryId,
}) => {
  const { t } = useLanguage();
  const { addCategory, updateCandidate } = useData();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [refCategories, setRefCategories] = useState<any[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<number | null>(null);
  const [listCandidates, setListCandidates] = useState<any[]>([]);
  const [preview, setPreview] = useState<{
    type: 'pdf' | 'video';
    url: string;
    title: string;
  } | null>(null);

  // fungsi unutk menhitung umur dari yyyy-mm-dd
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // popup memilih wa
        const [waPopup, setWaPopup] = useState<{
        open: boolean;
        candidateName: string;
      } | null>(null);
  //

  // helper getdoc
  const getDoc = (candidate: any, type: string) =>
    candidate.document?.find((d: any) => d.typedoc === type);


  const isAdmin = isAuthenticated && user?.role === 'admin';
  const api = getApiBaseUrl();

  /* ===================== FETCH CATEGORY ===================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${api}/ref/category?page=1&limit=1000&sort=id&order=asc`
        );
        const json = await res.json();

        const cats = json.data.map((c: any) => ({
          ...c,
          id: Number(c.id),
        }));

        setRefCategories(cats);

        if (initialCategoryId !== null) {
          setActiveSheetId(initialCategoryId);
        } else if (cats.length > 0) {
          setActiveSheetId(cats[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchCategories();
  }, [api, initialCategoryId]);

  /* ===================== FETCH CANDIDATE ===================== */
  useEffect(() => {
    if (activeSheetId === null) return;

    const fetchCandidates = async () => {
      try {
        const res = await fetch(
          `${api}/applicant?category_id=${activeSheetId}`
        );
        const json = await res.json();

        setListCandidates(
          json.data.map((c: any) => ({
            ...c,
            id: Number(c.id),
            category_id: Number(c.category_id),
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };

    fetchCandidates();
  }, [api, activeSheetId]);

  const filteredCandidates = listCandidates;

const openWhatsApp = (
  phone: string,
  candidateName: string,
  contactName: string
) => {
  const message = `
Hello Ms. ${contactName},

I would like to contact you regarding a candidate.
Name: ${candidateName}

Thank you.
  `.trim();

  const url = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};



  //ADD FUNCTION DOWNLOAD SPREADSHEET 20260120

  const exportAllSheetsToExcel = async () => {
  if (!refCategories.length) return;

  const workbook = XLSX.utils.book_new();

  for (const category of refCategories) {
    try {
      // fetch candidates per category
      const res = await fetch(
        `${api}/applicant?category_id=${category.id}`
      );
      const json = await res.json();

      const candidates = json.data || [];

      const rows = candidates.map((c: any, index: number) => ({
        No: index + 1,
        Name: c.name,
        Sex: c.sex,
        Age: calculateAge(c.birth_date),

          Weight: c.weight,
          Height: c.height,
          Marital_Status: c.marital_status,
          Candidate_Status: c.candidate_status,
          Reserved: c.reserved,
        Passport: c.document?.passport?.available
          ? 'READY'
          : 'NOT READY',
        CV: c.document?.cv?.available
          ? 'AVAILABLE'
          : 'NOT AVAILABLE',
        Video: c.document?.video?.available
          ? 'AVAILABLE'
          : 'NOT AVAILABLE',
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        category.name.substring(0, 31) // Excel max sheet name
      );
    } catch (err) {
      console.error(`Failed export category ${category.name}`, err);
    }
  }

  XLSX.writeFile(workbook, 'All_Candidates.xlsx');
};



  //////////////////////////////////////////////

  const handleAddSheet = () => {
    const name = prompt('Enter name for the new Sheet (Category):');
    if (name) addCategory(name);
  };

  const toggleCvAvailability = (candidate: Candidate) => {
    if (!isAdmin) return;
    updateCandidate(candidate.id, {
      cvAvailable: !candidate.cvAvailable,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-300 p-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-600 rounded">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-700 leading-tight">
              {t.spreadsheetTitle}
            </h2>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              Interactive Sheets View • Admin Managed
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
        <button
          onClick={exportAllSheetsToExcel}
          className="flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-black rounded hover:bg-green-700 transition-colors shadow-sm"
        >
          Download Excel
        </button>

        <button
          onClick={onBack}
          className="flex items-center px-4 py-1.5 bg-red-600 text-white text-xs font-black rounded hover:bg-red-700 transition-colors shadow-sm"
        >
          {t.backToHome}
        </button>
      </div>


      </div>

      {/* TABLE */}
      <main className="flex-grow overflow-x-auto overflow-y-auto relative">
        <table className="w-full border-collapse min-w-[1450px] text-sm whitespace-nowrap">
          <thead className="bg-[#FFD8A8] text-sm font-bold text-gray-800">
            <tr className="bg-[#FFD8A8]">

              <th className="border px-4 py-2">{t.colNo}</th>
              <th className="border px-4 py-2">{t.colName}</th>
              <th className="border px-4 py-2">{t.colSex}</th>
              <th className="border px-4 py-2">{t.colAge}</th>
              <th className="border px-4 py-2">WEIGHT</th>
              <th className="border px-4 py-2">HEIGHT</th>
              <th className="border px-4 py-2">MARITAL</th>
              <th className="border px-4 py-2">LAST EDUCATION</th>
              <th className="border px-4 py-2">{t.colPassport}</th>
              <th className="border px-4 py-2">CANDIDATE STATUS</th>
              <th className="border px-4 py-2">RESERVED</th>
              <th className="border px-4 py-2">{t.colCvLink}</th>
              <th className="border px-4 py-2">{t.colVideoLink}</th>
              {/* <th className="border px-4 py-2">{t.colCvStatus}</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c, i) => (
              <tr key={c.id} className="hover:bg-gray-100 text-sm">
                <td className="border px-4">{i + 1}</td>
                <td className="border px-4 font-bold whitespace-nowrap min-w-[220px]">
                  {c.name}
                </td>
                <td className="border px-4">{c.sex}</td>
                <td className="border px-4">{calculateAge(c.birth_date)}</td>
                <td className="border px-4">
                  {c.weight ? `${c.weight} kg` : '-'}
                </td>

                <td className="border px-4">
                  {c.height ? `${c.height} cm` : '-'}
                </td>

                <td className="border px-4">
                  {c.marital_status
                    ? c.marital_status.toUpperCase()
                    : '-'}
                </td>

                <td className="border px-4">
                  {c.last_education
                    ? c.last_education.toUpperCase()
                    : '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {c.document?.passport?.available ? (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
                      AVAILABLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700">
                      NOT AVAILABLE
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700">
                    {c.candidate_status || 'Available for Application'}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {isAdmin && c.reserved === 'Available' ? (
                    <button
                      onClick={() => navigate(`/candidate/${c.id}/reserved`)}
                      className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                    >
                      {c.reserved}
                    </button>
                  ) : (
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${c.reserved === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      {c.reserved || 'Not Available'}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {c.document?.cv?.available ? (
                    <button
                      onClick={() =>
                        setPreview({
                          type: "pdf",
                          url: buildDocumentUrl(c.document.cv.file_path),
                          title: `${c.name} - CV`,
                        })
                      }
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-md transition-all shadow-sm text-xs font-semibold"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>

                      Ready
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs font-semibold">
                      Not yet
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {c.document?.video?.available ? (
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() =>
                          setPreview({
                            type: "video",
                            url: buildDocumentUrl(c.document.video.file_path),
                            title: `${c.name} - Video Preview`,
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-md transition-all shadow-sm text-xs font-semibold"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Ready
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center">
                      <span className="text-gray-400 text-xs font-semibold">
                        Not yet
                      </span>
                    </div>
                  )}
                </td>
                {/* <td className="border border-gray-300 px-4 py-2 text-center">
                  {c.document?.cv?.available ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-green-100 text-green-700">
                      AVAILABLE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-100 text-red-700">
                      NOT AVAILABLE
                    </span>
                  )}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* TABS */}
      <div className="bg-[#f1f3f4] border-t border-gray-300 px-4 py-1 flex items-center space-x-1 flex-shrink-0">
        <button
          onClick={handleAddSheet}
          className="p-1 hover:bg-gray-200 rounded text-gray-600"
          title="Add Sheet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <div className="flex items-center space-x-0.5">
          {refCategories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveSheetId(cat.id)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-tight rounded-t transition-colors ${activeSheetId === cat.id
                ? 'bg-white border-x border-t border-gray-300 text-blue-800'
                : 'hover:bg-gray-200 text-gray-500'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        type={preview?.type || 'pdf'}
        url={preview?.url || ''}
        title={preview?.title || ''}
      />


      {/*Preview modal whatsapp */}
            {/* Preview Modal */}
      <PreviewModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        type={preview?.type || 'pdf'}
        url={preview?.url || ''}
        title={preview?.title || ''}
      />

      {/* WhatsApp Popup */}
      {waPopup?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-[320px] p-4 text-gray-800">

            <h3 className="text-sm font-bold mb-3 text-center">
              Contact via WhatsApp
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  openWhatsApp(
                    '6282271674145',
                    waPopup.candidateName,
                    'Rani'
                  );
                  setWaPopup(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-[11px] font-bold"
              >
                Ms. Rani
              </button>
              <button
                onClick={() => {
                  openWhatsApp(
                    '6285749160443',
                    waPopup.candidateName,
                    'Alivia'
                  );
                  setWaPopup(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-[11px] font-bold"
              >
                Ms. Alivia
              </button>

            </div>

            <button
              onClick={() => setWaPopup(null)}
              className="mt-4 w-full text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateSpreadsheetView;
