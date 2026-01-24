import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { DataProvider } from './DataContext';
import { LanguageProvider } from './LanguageContext';
import MainRoutes from './MainRoutes';
import React from 'react';

const App: React.FC = () => {
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
