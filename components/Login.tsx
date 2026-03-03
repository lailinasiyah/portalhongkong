
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
    <div className="min-h-screen bg-diagonal-stripes flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-block bg-white p-3 rounded-full shadow-2xl border-4 border-red-600 w-28 h-28 mb-4">
            <img 
              src="assets/favicon.png" 
              alt="LPK MSS Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Portal Access</h2>
          <p className="text-red-600 text-xs font-black mt-1 uppercase tracking-[0.3em]">PT. Mitra Sinergi Sukses</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-red-600 h-2 w-full"></div>
          <form onSubmit={handleSubmit} className="p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black uppercase tracking-tight">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Username Access</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-sm font-bold"
                  placeholder="Masukkan username Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Security Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-sm font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-[0.3em] rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In Portal'}
                </button>
              </div>
            </div>
          </form>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
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
