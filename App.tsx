
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ResourceSection from './components/ResourceSection';
import CategorySection from './components/CategorySection';
import Footer from './components/Footer';
import CandidateGridView from './components/CandidateGridView';
import CandidateSpreadsheetView from './components/CandidateSpreadsheetView';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Loader from './components/Loader';
import { LanguageProvider } from './LanguageContext';
import { DataProvider } from './DataContext';
import { AuthProvider, useAuth } from './AuthContext';

const MainApp: React.FC = () => {
  const [view, setView] = useState<'home' | 'grid' | 'spreadsheet' | 'admin'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setAppLoading(false), 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Jika belum login dan loader sudah selesai, paksa ke halaman Login
  if (!appLoading && !isAuthenticated) {
    return (
      <LanguageProvider>
        <Login onSuccess={() => setView('home')} />
      </LanguageProvider>
    );
  }

  const handleViewGrid = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setView('grid');
  };

  const handleViewSpreadsheet = (categoryId?: string) => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
    setView('spreadsheet');
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setView('admin');
    }
  };

  return (
    <div className={`transition-opacity duration-500 ${isFadingOut && appLoading ? 'opacity-0' : 'opacity-100'}`}>
      {appLoading && <Loader />}
      
      {!appLoading && isAuthenticated && (
        <>
          {view === 'home' && (
            <div className="min-h-screen bg-white">
              <Navbar onAdminClick={handleAdminClick} />
              <main>
                <Hero />
                <ResourceSection />
                <CategorySection 
                  onViewGrid={handleViewGrid} 
                  onViewSpreadsheet={() => handleViewSpreadsheet()} 
                />
              </main>
              <Footer />
            </div>
          )}
          {view === 'grid' && (
            <CandidateGridView 
              categoryId={selectedCategoryId} 
              onBack={() => { setView('home'); setSelectedCategoryId(null); }} 
            />
          )}
          {view === 'spreadsheet' && (
            <CandidateSpreadsheetView 
              initialCategoryId={selectedCategoryId}
              onBack={() => { setView('home'); setSelectedCategoryId(null); }} 
            />
          )}
          {view === 'admin' && (
            isAdmin ? (
              <AdminDashboard onBack={() => setView('home')} />
            ) : (
              <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                  <h2 className="text-2xl font-black text-red-600 mb-2 uppercase">Access Denied</h2>
                  <p className="text-gray-500 mb-6">You do not have permission to view this page.</p>
                  <button onClick={() => setView('home')} className="px-6 py-2 bg-blue-900 text-white rounded font-bold uppercase text-xs">Return Home</button>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <MainApp />
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
