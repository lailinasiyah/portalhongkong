import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, CategoryItem,CandidateApi } from './types';
import { MOCK_CANDIDATES, CATEGORIES } from './constants';
const VITE_API_URL = import.meta.env.VITE_API_URL;

interface DataContextType {
  candidates: CandidateApi[];
  categories: CategoryItem[];
  addCandidate: (c: Omit<Candidate, 'id'>) => Promise<void>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  addCategory: (title: string) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Persistent Storage Utility using LocalStorage
// This ensures data survives browser close and computer shutdown.
const dbStore = {
  fetchCandidates: (): Candidate[] => {
    const data = localStorage.getItem('mss_portal_candidates_v2');
    return data ? JSON.parse(data) : MOCK_CANDIDATES;
  },
  fetchCategories: (): CategoryItem[] => {
  const data = localStorage.getItem('mss_portal_categories_v2');
  return data ? JSON.parse(data) : [];
},
  saveCandidates: (data: Candidate[]) => {
    localStorage.setItem('mss_portal_candidates_v2', JSON.stringify(data));
  },
  saveCategories: (data: CategoryItem[]) => {
    localStorage.setItem('mss_portal_categories_v2', JSON.stringify(data));
  }
};

  const mapCategoryFromApi = (apiCat: any): CategoryItem => {
  const found = CATEGORIES.find(
    c => c.titleEn.toLowerCase() === apiCat.name.toLowerCase()
  );

  return {
    id: apiCat.id,
    titleEn: found?.titleEn ?? apiCat.name,
    titleTr: found?.titleTr ?? apiCat.name,
    imageUrl: found?.imageUrl ?? '/assets/default-category.jpg',
  };
};

const normalizeDocument = (doc: any) => {
  if (!doc) return { available: false };

  return {
    ...doc,
    available: Boolean(doc.available),
    file_path: doc.file_path ?? null,
    file_url: doc.file_path
      ? `${VITE_API_URL}${doc.file_path}`
      : null,
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data from persistent storage
useEffect(() => {
  const load = async () => {
    setLoading(true);

    const [appRes, catRes] = await Promise.all([
      fetch('/applicant?limit=100'),
      fetch('/ref/category?limit=100')
    ]);

    const appJson = await appRes.json();
    const catJson = await catRes.json();

    const mappedCandidates = appJson.data.map((c: any) => {
      const doc = c.document ?? {};

      return {
        ...c,
        document: {
          photo: normalizeDocument(doc.photo),
          passport: normalizeDocument(doc.passport),
          cv: normalizeDocument(doc.cv),
          video: normalizeDocument(doc.video),
          certificate: normalizeDocument(doc.certificate),
        },
      };
    });

    setCandidates(mappedCandidates);

    setCategories(
      catJson.data.map((c: any) => mapCategoryFromApi(c))
    );

    setLoading(false);
  };

  load();
}, []);





  const addCandidate = async (c: Omit<Candidate, 'id'>) => {
    const newCandidate = { ...c, id: `mss_${Date.now()}` };
    const updated = [...candidates, newCandidate as Candidate];
    setCandidates(updated);
    dbStore.saveCandidates(updated);
    // Simulate network delay for "Backend API" feel
    await new Promise(r => setTimeout(r, 500));
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    const updated = candidates.map(c => c.id === id ? { ...c, ...updates } : c);
    setCandidates(updated);
    dbStore.saveCandidates(updated);
    await new Promise(r => setTimeout(r, 300));
  };

  const deleteCandidate = async (id: string) => {
    const updated = candidates.filter(c => c.id !== id);
    setCandidates(updated);
    dbStore.saveCandidates(updated);
    await new Promise(r => setTimeout(r, 300));
  };


  return (
    <DataContext.Provider value={{ candidates, categories, addCandidate, updateCandidate, deleteCandidate,  loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};