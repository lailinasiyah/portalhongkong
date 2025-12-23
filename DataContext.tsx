
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, CategoryItem } from './types';
import { MOCK_CANDIDATES, CATEGORIES } from './constants';

interface DataContextType {
  candidates: Candidate[];
  categories: CategoryItem[];
  addCandidate: (c: Omit<Candidate, 'id'>) => Promise<void>;
  updateCandidate: (id: string, c: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  addCategory: (title: string) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from MySQL via an API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // await fetch('/api/candidates').then(res => res.json()).then(data => setCandidates(data));
      
      const savedCandidates = localStorage.getItem('mss_candidates');
      const savedCategories = localStorage.getItem('mss_categories');
      
      setCandidates(savedCandidates ? JSON.parse(savedCandidates) : MOCK_CANDIDATES);
      setCategories(savedCategories ? JSON.parse(savedCategories) : CATEGORIES);
      
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('mss_candidates', JSON.stringify(candidates));
    }
  }, [candidates, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('mss_categories', JSON.stringify(categories));
    }
  }, [categories, loading]);

  const addCandidate = async (c: Omit<Candidate, 'id'>) => {
    // In a real app with MySQL:
    // const res = await fetch('/api/candidates', { method: 'POST', body: JSON.stringify(c) });
    // const newCandidate = await res.json();
    
    const newCandidate = { ...c, id: Date.now().toString() };
    setCandidates(prev => [...prev, newCandidate as Candidate]);
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    // In a real app with MySQL:
    // await fetch(`/api/candidates/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCandidate = async (id: string) => {
    // In a real app with MySQL:
    // await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
    
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const addCategory = async (title: string) => {
    // In a real app with MySQL:
    // await fetch('/api/categories', { method: 'POST', body: JSON.stringify({title}) });
    
    const id = title.toLowerCase().replace(/\s+/g, '-');
    const newCat: CategoryItem = {
      id,
      titleEn: title,
      titleTr: title,
      imageUrl: 'https://images.unsplash.com/photo-1454165833767-027ff33027ef?q=80&w=500&auto=format&fit=crop',
      link: '#'
    };
    setCategories(prev => [...prev, newCat]);
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
