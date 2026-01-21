import React, { useMemo, useState } from "react";
import { useLanguage } from "../LanguageContext";
import { useData } from "../DataContext";
import PreviewModal from "./PreviewModal";
import { CandidateApi } from "../types"; // ← WAJIB
const VITE_API_URL = import.meta.env.VITE_API_BASE_URL;


interface CandidateGridViewProps {
  onBack: () => void;
  categoryId: string | null;
} 

const CandidateGridView: React.FC<CandidateGridViewProps> = ({
  onBack,
  categoryId,
}) => {
  const { t, language } = useLanguage();
  const { candidates, categories } = useData();

  const [preview, setPreview] = useState<{
    type: "pdf" | "video";
    url: string;
    title: string;
  } | null>(null);

  console.log("RAW API RESULT:", candidates);

  /* =========================
     FILTER YANG BENAR
  ========================= */
const filteredCandidates = useMemo(() => {
  if (!categoryId) return [];

  const cid = Number(categoryId);

  return candidates.filter(
    (c: CandidateApi) => Number(c.category_id) === cid
  );
}, [candidates, categoryId]);


console.log("CATEGORY ID (PROP):", categoryId);
console.log(
  "CATEGORY ID FROM DATA:",
  candidates.map((c: any) => c.category_id)
);



  console.log("FILTERED RESULT:", filteredCandidates);

  const selectedCategory = categories.find(
    (c: any) => String(c.id) === String(categoryId)
  );

  return (
    <div className="min-h-screen bg-[#0b1a2a] text-white pb-20">
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
      <main className="max-w-7xl mx-auto p-6">
        {filteredCandidates.length === 0 ? (
          <div className="text-center text-blue-400 mt-20">
            No candidates available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
           {filteredCandidates.map((candidate: any) => {
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
      {/* PHOTO */}
      <div className="h-56 bg-blue-800">
        {candidate.document?.photo?.available &&
        candidate.document.photo.file_url ? (
          <img
            src={encodeURI(candidate.document.photo.file_url)}
            alt={candidate.name}
            onError={(e) => {
    console.error("IMAGE LOAD FAILED:", candidate.document.photo.file_url);
    e.currentTarget.style.display = "none";
  }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs opacity-40">
            NO PHOTO
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-3 border-t border-blue-800/50">
        <p className="text-[10px] font-bold text-blue-300">
          ID: {candidate.id}
        </p>

        <h4 className="text-[11px] font-bold uppercase">
          {candidate.name}
        </h4>

        <p className="text-[10px] opacity-70">
          Sex: {candidate.sex}
        </p>

        <div className="flex justify-between mt-3">
          <button
            disabled={!candidate.document?.cv?.available}
            onClick={() =>
              setPreview({
                type: "pdf",
                url: `${VITE_API_URL}${candidate.document.cv.file_path}`,
                title: `${candidate.name} - CV`,
              })
            }
            className="text-[9px] bg-blue-700 px-2 py-1 rounded disabled:opacity-30"
          >
            CV
          </button>

          <button
            disabled={!candidate.document?.video?.available}
            onClick={() =>
              setPreview({
                type: "video",
                url: `${VITE_API_URL}${candidate.document.video.file_path}`,
                title: `${candidate.name} - Video`,
              })
            }
            className="text-[9px] bg-blue-700 px-2 py-1 rounded disabled:opacity-30"
          >
            VIDEO
          </button>
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
