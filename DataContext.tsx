
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, CategoryItem } from './types';
import { MOCK_CANDIDATES, CATEGORIES } from './constants';

interface DataContextType {
  candidates: Candidate[];
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
    return data ? JSON.parse(data) : CATEGORIES;
  },
  saveCandidates: (data: Candidate[]) => {
    localStorage.setItem('mss_portal_candidates_v2', JSON.stringify(data));
  },
  saveCategories: (data: CategoryItem[]) => {
    localStorage.setItem('mss_portal_categories_v2', JSON.stringify(data));
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data from persistent storage
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(r => setTimeout(r, 600));
      setCandidates(dbStore.fetchCandidates());
      setCategories(dbStore.fetchCategories());
      setLoading(false);
    };
    initData();
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

  const addCategory = async (title: string) => {
    const id = title.toLowerCase().replace(/\s+/g, '-');
    const newCat: CategoryItem = {
      id,
      titleEn: title,
      titleTr: title,
      imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=500&auto=format&fit=crop',
      link: '#'
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    dbStore.saveCategories(updated);
  };

  return (
    <DataContext.Provider value={{ candidates, categories, addCandidate, updateCandidate, deleteCandidate, addCategory, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
