import React, { useMemo, useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { useData } from "../DataContext";
import PreviewModal from "./PreviewModal";
import { CandidateApi } from "../types"; // ← WAJIB
import { VideoCameraIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
const VITE_API_URL = import.meta.env.VITE_API_URL;
import { getApiBaseUrl } from "../utils/api";


interface CandidateGridViewProps {
  onBack: () => void;
  categoryId: string | null;
}

const CandidateGridView: React.FC<CandidateGridViewProps> = ({
  onBack,
  categoryId,
}) => {
  const { t, language } = useLanguage();
  const { categories } = useData();

  const [preview, setPreview] = useState<{
    type: "pdf" | "video";
    url: string;
    title: string;
  } | null>(null);

  const labels = {
    cv: language === "TR" ? "Özgeçmiş" : "CV",
    video: language === "TR" ? "Tanıtım Videosu Aday" : "VIDEO",
    sex: language === "TR" ? "Cinsiyet" : "Sex",
    age: language === "TR" ? "Yaş" : "Age",
  };



  console.log("CATEGORY ID (PROP):", categoryId);

  // konstanta untuk hitung umur
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear();
    return age;
  };

  const selectedCategory = categories.find(
    (c: any) => String(c.id) === String(categoryId)
  );

  // use fetch to get data from api http://localhost/rekrutment-filemanager/applicant?category_id=4
  const [candidates, setCandidates] = useState<CandidateApi[]>([]);
  useEffect(() => {
    if (!categoryId) return;

    const fetchCandidates = async () => {
      const response = await fetch(
        `${getApiBaseUrl()}/applicant?category_id=${categoryId}`
      );
      const data = await response.json();
      setCandidates(data.data);
    };

    fetchCandidates();
  }, [categoryId]); // ✅


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#BA0021] via-[#C8102E] to-[#E10600] text-white pb-20">
      {/* HEADER */}
      <header className="py-8 px-4 bg-[#0d1e2e] border-b border-blue-900/50 text-center">
        <button
          onClick={onBack}
          className="mb-6 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white"
        >
          ← {t.backToHome}
        </button>

        <h1 className="text-xl font-black">
          {language === "EN"
            ? selectedCategory?.titleEn
            : selectedCategory?.titleTr}{" "}
          {t.listTitle}
        </h1>
      </header>
      {/* CONTENT */}
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="w-96 border border-white rounded overflow-hidden text-left">
          <div className="py-5 border-b border-white flex items-center gap-2 px-4">
            <DocumentTextIcon className="w-8 h-8 text-white" />
            <span className="text-[15px] mt-1 text-center">{labels.cv}</span>
          </div>

          <div className="py-5 flex items-center gap-2 px-4">
            <VideoCameraIcon className="w-8 h-8 text-white" />
            <span className="text-[15px] mt-1 text-center">{labels.video}</span>
          </div>
        </div>

        <br></br>
        {candidates.length === 0 ? (
          <div className="text-center text-blue-400 mt-20">
            No candidates available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {candidates.map((candidate: any) => {
              console.log(
                "PHOTO DEBUG:",
                candidate.name,
                candidate.document?.photo
              );

              return (
                <div
                  key={candidate.id}
                  className="bg-blue-900 border border-blue-700/50 rounded overflow-hidden"
                >
                  <div className="w-[210px] bg-blue-900 rounded overflow-hidden text-white">

                    {/* TOP : PHOTO + ICON */}
                    <div className="flex p-6 gap-6">

                      {/* PHOTO */}
                      <div className="w-32 h-[192px] border border-white/30 rounded overflow-hidden shrink-0 bg-black/20">

                        {candidate.document?.photo?.available &&
                          candidate.document.photo.file_path ? (
                          <img
                            src={`${VITE_API_URL}/document${candidate.document.photo.file_path}`}
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs opacity-40">
                            NO PHOTO
                          </div>
                        )}

                      </div>

                      {/* ICONS */}
                      <div className="flex flex-col justify-center gap-4 ml-auto">

                        <button
                          disabled={!candidate.document?.cv?.available}
                          onClick={() => {
                            const path = candidate.document.cv.file_path;
                            const parts = path.split("/").filter(Boolean);
                            const [applicantId, type, filename] = parts;

                            setPreview({
                              type: "pdf",
                              url: `${VITE_API_URL}/document/${applicantId}/${type}/${filename}`,
                              title: `${candidate.name} - CV`,
                            });
                          }}
                          className="disabled:opacity-30 flex flex-col items-center"
                        >
                          <DocumentTextIcon className="w-8 h-8 text-white" />
                        </button>

                        <button
                          disabled={!candidate.document?.video?.available}
                          onClick={() => {
                            const path = candidate.document.video.file_path;
                            const parts = path.split("/").filter(Boolean);
                            const [applicantId, type, filename] = parts;

                            setPreview({
                              type: "video",
                              url: `${VITE_API_URL}/document/${applicantId}/${type}/${filename}`,
                              title: `${candidate.name} - Video`,
                            });
                          }}
                          className="disabled:opacity-30 flex flex-col items-center"
                        >
                          <br></br>
                          <VideoCameraIcon className="w-8 h-8 text-white" />
                        </button>

                      </div>
                    </div>

                    {/* INFO */}
                    <div className="p-3 border-t border-blue-800/50">

                      <h4 className="text-[15px] font-bold uppercase leading-tight">
                        {candidate.name}
                      </h4>

                      <p className="text-[15px] font-bold text-blue-300 mt-1">
                        {labels.age}: {calculateAge(candidate.birth_date)}
                      </p>

                      <p className="text-[15px] opacity-70">
                        {labels.sex}: {candidate.sex}
                      </p>

                    </div>

                  </div>
                </div>

              );
            })}

          </div>
        )}
      </main>

      <PreviewModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        type={preview?.type || "pdf"}
        url={preview?.url || ""}
        title={preview?.title || ""}
      />
    </div>
  );
};

export default CandidateGridView;
