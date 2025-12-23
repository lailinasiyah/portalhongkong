
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import PortalButton from './PortalButton';

interface LoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid username or password. (Hint: admin / admin123)');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-2 rounded-full shadow-md border-2 border-red-600 w-24 h-24 mb-4">
            <img 
              src="https://portal.lpkmss.com/wp-content/uploads/2023/12/LOGO-LPK-MSS-BULAT-300x300.png" 
              alt="LPK MSS Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-black text-blue-900 uppercase tracking-widest">Admin Access</h2>
          <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-tight">LPK Mitra Sarana Sejahtera</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-red-600 h-2 w-full"></div>
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2">
                <PortalButton 
                  variant="primary" 
                  className="w-full py-3 text-sm font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-red-200"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </PortalButton>
              </div>
            </div>
          </form>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
            <button 
              onClick={onBack}
              className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors tracking-widest"
            >
              Back to Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
