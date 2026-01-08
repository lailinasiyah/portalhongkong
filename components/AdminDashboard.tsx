
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../DataContext';
import { Candidate } from '../types';

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { candidates, categories, addCandidate, updateCandidate, deleteCandidate } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  // Refs for file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

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

  // Simulated Google Drive Upload Function
  const simulateFileUpload = async (file: File, field: keyof Omit<Candidate, 'id'>) => {
    setIsUploading(prev => ({ ...prev, [field]: true }));
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));

    // Simulation of progress
    const totalSteps = 20;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
      const progress = Math.round((i / totalSteps) * 100);
      setUploadProgress(prev => ({ ...prev, [field]: progress }));
    }

    // In a real production app, you would use gapi.client.drive.files.create here.
    // We'll generate a dummy Drive-like link for this demonstration.
    const mockDriveUrl = `https://drive.google.com/file/d/MOCK_ID_${Math.random().toString(36).substr(2, 9)}/view`;
    
    setFormData(prev => ({ ...prev, [field]: mockDriveUrl }));
    setIsUploading(prev => ({ ...prev, [field]: false }));
    showNotification(`${file.name} uploaded to Drive successfully!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Omit<Candidate, 'id'>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateFileUpload(file, field);
    }
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

  const FileUploadField = ({ 
    label, 
    field, 
    currentValue, 
    accept, 
    inputRef, 
    icon 
  }: { 
    label: string, 
    field: keyof Omit<Candidate, 'id'>, 
    currentValue: string, 
    accept: string, 
    inputRef: React.RefObject<HTMLInputElement>,
    icon: React.ReactNode
  }) => (
    <div className="col-span-2">
      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{label}</label>
      <div className="flex items-center space-x-3">
        <div className="flex-grow relative">
          <input 
            type="text" 
            value={currentValue} 
            readOnly
            className="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium truncate" 
            placeholder="No file uploaded to Drive yet..." 
          />
          {currentValue && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          accept={accept}
          onChange={(e) => handleFileChange(e, field)}
        />
        <button 
          type="button"
          disabled={isUploading[field]}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95 ${isUploading[field] ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {icon}
          <span>{isUploading[field] ? 'Uploading...' : 'Browse'}</span>
        </button>
      </div>
      {isUploading[field] && (
        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-red-600 h-full transition-all duration-300" 
            style={{ width: `${uploadProgress[field]}%` }}
          ></div>
        </div>
      )}
    </div>
  );

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
                  <div className="h-px bg-gray-100 w-full my-4"></div>
                  <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4">Drive File Uploads</h4>
                </div>

                {/* Photo Upload */}
                <FileUploadField 
                  label="Photo Candidate"
                  field="photoUrl"
                  currentValue={formData.photoUrl}
                  accept="image/*"
                  inputRef={photoInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />

                {/* CV PDF Upload */}
                <FileUploadField 
                  label="CV PDF (to Drive)"
                  field="resumeUrl"
                  currentValue={formData.resumeUrl}
                  accept=".pdf"
                  inputRef={resumeInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                />

                {/* Video Upload */}
                <FileUploadField 
                  label="Intro Video (to Drive)"
                  field="videoUrl"
                  currentValue={formData.videoUrl}
                  accept="video/*"
                  inputRef={videoInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                />

                {/* Certificate Upload */}
                <FileUploadField 
                  label="Certificate PDF (to Drive)"
                  field="certificateUrl"
                  currentValue={formData.certificateUrl}
                  accept=".pdf"
                  inputRef={certInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
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
                    disabled={isSubmitting || Object.values(isUploading).some(Boolean)}
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
