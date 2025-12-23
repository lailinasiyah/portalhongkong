
import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Candidate } from '../types';

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { candidates, categories, addCandidate, updateCandidate, deleteCandidate } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Candidate, 'id'>>({
    categoryId: 'housekeeper',
    code: '',
    nameEn: '',
    nameLocal: '',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=500&fit=crop',
    resumeUrl: '',
    videoUrl: '',
    sex: 'Female',
    age: 20,
    passportStatus: 'Ready',
    cvAvailable: true
  });

  const handleEdit = (c: Candidate) => {
    setEditingId(c.id);
    setFormData(c);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCandidate(editingId, formData);
      setEditingId(null);
    } else {
      addCandidate(formData);
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest text-blue-900">Admin Dashboard</h1>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="bg-red-600 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
        >
          Add New Candidate
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Name & Code</th>
                <th className="px-6 py-4">Sheet / Category</th>
                <th className="px-6 py-4">Links (CV/VID)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map(c => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <img src={c.photoUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{c.nameEn}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase">{c.code}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-500 uppercase">{c.categoryId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <span className={`w-3 h-3 rounded-full ${c.resumeUrl ? 'bg-green-500' : 'bg-gray-200'}`} title="CV Status"></span>
                      <span className={`w-3 h-3 rounded-full ${c.videoUrl ? 'bg-blue-500' : 'bg-gray-200'}`} title="Video Status"></span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Edit</button>
                    <button onClick={() => deleteCandidate(c.id)} className="text-red-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal for Add/Edit */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsAdding(false); setEditingId(null); }}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <form onSubmit={handleSubmit}>
              <div className="bg-blue-900 p-6 text-white">
                <h3 className="text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Full Name (English)</label>
                  <input type="text" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm" required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Code</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm" placeholder="JM-2405037" required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Local Name / Furigana</label>
                  <input type="text" value={formData.nameLocal} onChange={e => setFormData({...formData, nameLocal: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Sheet / Category</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.titleEn}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} className="w-full p-2 border border-gray-200 rounded text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Sex</label>
                  <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value as 'Male' | 'Female'})} className="w-full p-2 border border-gray-200 rounded text-sm">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">CV PDF URL (Dashboard Upload Simulation)</label>
                  <input type="url" value={formData.resumeUrl} onChange={e => setFormData({...formData, resumeUrl: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Intro Video URL</label>
                  <input type="url" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Photo URL</label>
                  <input type="url" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm" />
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:text-gray-700">Cancel</button>
                <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded text-xs font-black uppercase tracking-widest hover:bg-blue-800">Save Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
