
import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { Candidate } from '../types';

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { candidates, categories, addCandidate, updateCandidate, deleteCandidate } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Candidate, 'id'>>({
    categoryId: categories[0]?.id || 'house-keeper',
    nameEn: '',
    nameLocal: '',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=500&fit=crop',
    resumeUrl: '',
    videoUrl: '',
    certificateUrl: '',
    sex: 'Female',
    age: 20,
    passportStatus: 'Ready',
    cvAvailable: true
  });

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleEdit = (c: Candidate) => {
    setEditingId(c.id);
    setFormData(c);
    setIsAdding(false);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const validateForm = (): boolean => {
    if (!formData.nameEn.trim()) {
      showNotification('Name is required', 'error');
      return false;
    }
    if (formData.age < 15 || formData.age > 60) {
      showNotification('Age must be between 15 and 60', 'error');
      return false;
    }
    if (!formData.photoUrl.startsWith('http')) {
      showNotification('Please provide a valid Photo URL', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const finalData = {
        ...formData,
        nameLocal: formData.nameLocal || formData.nameEn
      };

      if (editingId) {
        await updateCandidate(editingId, finalData);
        showNotification('Candidate updated successfully!');
        setEditingId(null);
      } else {
        await addCandidate(finalData);
        showNotification('New candidate added successfully!');
        setIsAdding(false);
      }
    } catch (err) {
      showNotification('Failed to save data. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteCandidate(id);
      showNotification('Candidate deleted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-[1000] px-6 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right duration-300 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            <span className="font-bold text-xs uppercase tracking-widest">{notification.message}</span>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest text-blue-900">Admin Dashboard</h1>
        </div>
        <button 
          onClick={() => { 
            setIsAdding(true); 
            setEditingId(null);
            setFormData({
              categoryId: categories[0]?.id || 'house-keeper',
              nameEn: '',
              nameLocal: '',
              photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=500&fit=crop',
              resumeUrl: '',
              videoUrl: '',
              certificateUrl: '',
              sex: 'Female',
              age: 20,
              passportStatus: 'Ready',
              cvAvailable: true
            });
          }}
          className="bg-red-600 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-md active:scale-95"
        >
          Add New Candidate
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-6 py-4">Photo</th>
                  <th className="px-6 py-4">Candidate Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status Docs</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">No candidates found. Start by adding one.</td>
                  </tr>
                ) : (
                  candidates.map(c => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <img src={c.photoUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" alt="" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 leading-none mb-1">{c.nameEn}</p>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-tight">{c.sex}, {c.age} Years Old</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-widest">
                          {categories.find(cat => cat.id === c.categoryId)?.titleEn || c.categoryId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <div className="flex flex-col items-center">
                            <span className={`w-2.5 h-2.5 rounded-full mb-1 ${c.resumeUrl ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">CV</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-2.5 h-2.5 rounded-full mb-1 ${c.videoUrl ? 'bg-blue-500' : 'bg-gray-200'}`}></span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">VID</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-2.5 h-2.5 rounded-full mb-1 ${c.certificateUrl ? 'bg-yellow-500' : 'bg-gray-200'}`}></span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">CERT</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        <button onClick={() => handleEdit(c)} className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:text-blue-800 underline-offset-4 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(c.id, c.nameEn)} className="text-red-600 font-bold text-[10px] uppercase tracking-widest hover:text-red-800 underline-offset-4 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal for Add/Edit */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { if(!isSubmitting) { setIsAdding(false); setEditingId(null); } }}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300">
            <form onSubmit={handleSubmit}>
              <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-white/60 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Full Name (English) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.nameEn} 
                    onChange={e => setFormData({...formData, nameEn: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                    placeholder="Enter full name"
                    required 
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Sheet / Category</label>
                  <select 
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.titleEn}</option>)}
                  </select>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Age <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={formData.age} 
                    onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Sex</label>
                  <div className="flex space-x-4 mt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" checked={formData.sex === 'Male'} onChange={() => setFormData({...formData, sex: 'Male'})} className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" checked={formData.sex === 'Female'} onChange={() => setFormData({...formData, sex: 'Female'})} className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-gray-700">Female</span>
                    </label>
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Passport Status</label>
                  <select 
                    value={formData.passportStatus} 
                    onChange={e => setFormData({...formData, passportStatus: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  >
                    <option value="Ready">Ready</option>
                    <option value="In Process">In Process</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <div className="h-px bg-gray-100 w-full my-2"></div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">CV PDF URL</label>
                  <input 
                    type="url" 
                    value={formData.resumeUrl} 
                    onChange={e => setFormData({...formData, resumeUrl: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                    placeholder="https://example.com/cv.pdf" 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Intro Video URL</label>
                  <input 
                    type="url" 
                    value={formData.videoUrl} 
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                    placeholder="https://youtube.com/watch?v=..." 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Certificate URL</label>
                  <input 
                    type="url" 
                    value={formData.certificateUrl} 
                    onChange={e => setFormData({...formData, certificateUrl: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                    placeholder="https://example.com/certificate.pdf" 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Photo URL <span className="text-red-500">*</span></label>
                  <input 
                    type="url" 
                    value={formData.photoUrl} 
                    onChange={e => setFormData({...formData, photoUrl: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                  />
                </div>
              </div>
              
              <div className="p-8 bg-gray-50 flex justify-end space-x-4">
                <button 
                    type="button" 
                    disabled={isSubmitting}
                    onClick={() => { setIsAdding(false); setEditingId(null); }} 
                    className="px-6 py-2.5 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-gray-800 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-900 text-white px-10 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-800 shadow-xl active:scale-95 disabled:opacity-70 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Saving...
                    </>
                  ) : 'Save Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
