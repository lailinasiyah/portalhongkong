
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import PortalButton from './PortalButton';

interface LoginProps {
  onSuccess: () => void;
  onBack?: () => void;
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
        setError('Login Gagal. Pastikan Username terdaftar dan Password benar.');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-diagonal-stripes flex items-start justify-center px-4 pt-1 pb-2 sm:pt-4 sm:pb-6">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-3 sm:mb-5 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-block w-14 h-14 mb-1 sm:w-24 sm:h-24 sm:mb-3">
            <img 
              src="assets/mitra.png" 
              alt="LPK MSS Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-blue-900 uppercase tracking-tighter">Portal Access</h2>
          <p className="text-red-600 text-[10px] sm:text-xs font-black mt-0.5 uppercase tracking-[0.24em] sm:tracking-[0.3em]">PT. Mitra Sinergi Sukses</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-red-600 h-1.5 sm:h-2 w-full"></div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-8">
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black uppercase tracking-tight">
                {error}
              </div>
            )}
            
            <div className="space-y-3 sm:space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 sm:mb-2 tracking-widest">Username Access</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-sm font-bold"
                  placeholder="Masukkan username Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 sm:mb-2 tracking-widest">Security Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-sm font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-1 sm:pt-3">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-[0.3em] rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In Portal'}
                </button>
              </div>
            </div>
          </form>
          
          <div className="p-3 sm:p-5 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
