import React, { useMemo, useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { useData } from "../DataContext";
import PreviewModal from "./PreviewModal";
import { CandidateApi } from "../types";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { buildDocumentUrl, getApiBaseUrl } from "../utils/api";

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
    type: "pdf" | "video" | "file";
    url: string;
    title: string;
  } | null>(null);

  const [candidates, setCandidates] = useState<CandidateApi[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");

  const labels = {
    cv: language === "TR" ? "Ozgecmis" : "CV",
    video: language === "TR" ? "Tanitim Videosu Aday" : "VIDEO",
    sex: language === "TR" ? "Cinsiyet" : "Sex",
    age: language === "TR" ? "Yas" : "Age",
  };

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

  const selectedCategory = categories.find(
    (c: any) => String(c.id) === String(categoryId)
  );
  const categoryTitle =
    language === "EN" ? selectedCategory?.titleEn : selectedCategory?.titleTr;

  const normalizeGender = (sex?: string) => {
    const normalized = (sex || "").trim().toLowerCase();

    if (["m", "male", "l", "laki-laki", "pria"].includes(normalized)) {
      return "male";
    }

    if (["f", "female", "p", "perempuan", "wanita"].includes(normalized)) {
      return "female";
    }

    return normalized;
  };

  const filteredCandidates = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesName = candidate.name.toLowerCase().includes(keyword);
      const matchesGender =
        genderFilter === "all" || normalizeGender(candidate.sex) === genderFilter;

      return matchesName && matchesGender;
    });
  }, [candidates, genderFilter, searchTerm]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCandidates = async () => {
      const response = await fetch(
        `${getApiBaseUrl()}/applicant?category_id=${categoryId}`
      );
      const data = await response.json();
      setCandidates(data.data || []);
    };

    fetchCandidates();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-[#d3062d] text-white font-sans">
      <header className="h-[90px] bg-[#071d2f] flex flex-col items-center justify-center text-center px-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          {t.backToHome}
        </button>
        <h1 className="mt-2 text-lg md:text-xl font-black tracking-tight">
          {categoryTitle} {t.listTitle}
        </h1>
      </header>

      <main className="min-h-[calc(100vh-90px)] bg-[#d3062d] px-5 py-8 md:px-[70px] md:py-10">
        <section className="w-full max-w-6xl rounded-lg border border-white/20 bg-[#071d2f]/92 shadow-[0_24px_70px_rgba(7,29,47,0.28)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr]">
            <div className="border-b border-white/15 lg:border-b-0 lg:border-r">
              <div className="h-[58px] flex items-center gap-3 px-4 border-b border-white/20">
                <DocumentTextIcon className="w-8 h-8 shrink-0 text-[#7fb6ff]" />
                <span className="text-[15px] font-semibold">{labels.cv}</span>
              </div>
              <div className="h-[58px] flex items-center gap-3 px-4 border-b border-white/20 lg:border-b-0">
                <VideoCameraIcon className="w-8 h-8 shrink-0 text-[#7fb6ff]" />
                <span className="text-[15px] font-semibold">{labels.video}</span>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                  <label className="relative block w-full md:w-[320px]">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search trainee name"
                      className="h-11 w-full rounded-md border border-white/15 bg-white px-10 text-sm font-semibold text-[#071d2f] outline-none transition focus:border-[#7fb6ff] focus:ring-2 focus:ring-[#7fb6ff]/35"
                    />
                  </label>

                  <div className="flex h-11 items-center rounded-md border border-white/15 bg-white/10 p-1">
                    <FunnelIcon className="ml-2 mr-1 hidden w-4 h-4 text-[#7fb6ff] sm:block" />
                    {[
                      { id: "all", label: "All" },
                      { id: "male", label: "Male" },
                      { id: "female", label: "Female" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setGenderFilter(option.id as "all" | "male" | "female")}
                        className={`h-8 rounded px-3 text-xs font-black uppercase tracking-wide transition-colors ${
                          genderFilter === option.id
                            ? "bg-white text-[#071d2f]"
                            : "text-white/75 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        </section>

        {candidates.length === 0 ? (
          <div className="text-center text-white/75 mt-20 font-bold">
            No candidates available
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="mt-10 rounded-lg border border-white/20 bg-white/10 px-5 py-8 text-center text-sm font-bold text-white/85">
            No trainees match your search or gender filter.
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-5">
            {filteredCandidates.map((candidate: CandidateApi) => {
              const photoUrl =
                candidate.document?.photo?.available && candidate.document.photo.file_path
                  ? buildDocumentUrl(candidate.document.photo.file_path)
                  : "";
              const age = candidate.birth_date ? calculateAge(candidate.birth_date) : "-";

              return (
                <article
                  key={candidate.id}
                  className="w-full max-w-[210px] bg-[#233f91] rounded-[6px] px-4 pt-5 pb-[14px] text-white shadow-[0_18px_35px_rgba(7,29,47,0.28)] ring-1 ring-white/10 transition-transform hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(7,29,47,0.35)] sm:w-[210px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-[130px] aspect-[2/3] bg-[#1a316f] flex items-center justify-center overflow-hidden shrink-0">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-14 h-14 text-white/35" />
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 min-h-[195px] flex-1">
                      {candidate.document?.cv?.available ? (
                        <button
                          onClick={() =>
                            setPreview({
                              type: candidate.document!.cv!.file_path.toLowerCase().endsWith(".pdf") ? "pdf" : "file",
                              url: buildDocumentUrl(candidate.document!.cv!.file_path),
                              title: `${candidate.name} - CV`,
                            })
                          }
                          className="text-white hover:text-[#7fb6ff] transition-colors"
                          title="Preview CV"
                        >
                          <DocumentTextIcon className="w-8 h-8" />
                        </button>
                      ) : (
                        <span className="text-white/35" title="CV Not yet">
                          <DocumentTextIcon className="w-8 h-8" />
                        </span>
                      )}

                      {candidate.document?.video?.available ? (
                        <button
                          onClick={() =>
                            setPreview({
                              type: "video",
                              url: buildDocumentUrl(candidate.document!.video!.file_path),
                              title: `${candidate.name} - Video`,
                            })
                          }
                          className="text-white hover:text-[#7fb6ff] transition-colors"
                          title="Preview Video"
                        >
                          <VideoCameraIcon className="w-8 h-8" />
                        </button>
                      ) : (
                        <span className="text-white/35" title="Video Not yet">
                          <VideoCameraIcon className="w-8 h-8" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-white/40 my-3" />

                  <h2 className="text-[16px] font-bold uppercase leading-tight">
                    {candidate.name}
                  </h2>

                  <div className="mt-1 space-y-0.5 text-[14px] leading-snug">
                    <p>
                      <span className="text-[#7fb6ff] font-bold">{labels.age}: </span>
                      <span className="text-white font-bold">{age}</span>
                    </p>
                    <p>
                      <span className="text-[#7fb6ff] font-bold">{labels.sex}: </span>
                      <span className="text-white font-bold">{candidate.sex || "-"}</span>
                    </p>
                  </div>
                </article>
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
