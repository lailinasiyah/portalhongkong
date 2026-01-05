
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

// Simulated DB Utility (In a real scenario, this logic happens in PHP/Node/Python with MySQL)
const dbSim = {
  fetch: async (key: string, defaultVal: any) => {
    await new Promise(r => setTimeout(r, 500)); // Network delay simulation
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  },
  save: async (key: string, data: any) => {
    await new Promise(r => setTimeout(r, 300)); // IO delay simulation
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const fetchedCandidates = await dbSim.fetch('mss_candidates', MOCK_CANDIDATES);
      const fetchedCategories = await dbSim.fetch('mss_categories', CATEGORIES);
      setCandidates(fetchedCandidates);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    initData();
  }, []);

  const addCandidate = async (c: Omit<Candidate, 'id'>) => {
    const newCandidate = { ...c, id: `db_${Date.now()}` };
    const updated = [...candidates, newCandidate as Candidate];
    setCandidates(updated);
    await dbSim.save('mss_candidates', updated);
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    const updated = candidates.map(c => c.id === id ? { ...c, ...updates } : c);
    setCandidates(updated);
    await dbSim.save('mss_candidates', updated);
  };

  const deleteCandidate = async (id: string) => {
    const updated = candidates.filter(c => c.id !== id);
    setCandidates(updated);
    await dbSim.save('mss_candidates', updated);
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
    await dbSim.save('mss_categories', updated);
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
