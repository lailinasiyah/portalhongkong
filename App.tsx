import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { DataProvider } from './DataContext';
import { LanguageProvider } from './LanguageContext';
import MainRoutes from './MainRoutes';
import Loader from './components/Loader';
import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
   useEffect(() => {
    // tampilkan loader hanya sekali saat website pertama dibuka
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 2000); // ⏱️ atur durasi loader (ms)

    return () => clearTimeout(timer);
  }, []);

  if (isFirstLoad) {
    return <Loader />;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <BrowserRouter>
            <MainRoutes />
          </BrowserRouter>
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
