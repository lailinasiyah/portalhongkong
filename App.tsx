
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
  const [view, setView] = useState<'home' | 'grid' | 'spreadsheet' | 'admin' | 'login'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { isAuthenticated } = useAuth();

  // Initial loader logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setAppLoading(false), 500); // Wait for fade animation to complete
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top when changing views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

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
    if (isAuthenticated) {
      setView('admin');
    } else {
      setView('login');
    }
  };

  return (
    <div className={`transition-opacity duration-500 ${isFadingOut && appLoading ? 'opacity-0' : 'opacity-100'}`}>
      {appLoading && <Loader />}
      
      {!appLoading && (
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
          {view === 'login' && (
            <Login 
              onSuccess={() => setView('admin')} 
              onBack={() => setView('home')} 
            />
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
            isAuthenticated ? (
              <AdminDashboard onBack={() => setView('home')} />
            ) : (
              <Login onSuccess={() => setView('admin')} onBack={() => setView('home')} />
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
