import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getApiBaseUrl } from '../utils/api';

const defaultForm = {
  status_reserved: 'Reserved',
  reserved_date: '2026-06-12',
  job_order_number: 'JO-2026-001',
  job_order_date: '2026-06-10',
  job_position: 'Care Worker',
  required_count: '5',
  company_name: 'ABC Care Service',
  work_location: 'Osaka, Jepang',
  hongkong_agency_name: 'XYZ Cooperative',
  interview_date: '2026-06-08',
  estimated_contract_date: '2026-06-25',
  reserved_notes: 'Kandidat telah dipilih employer dan menunggu penerbitan kontrak kerja.',
};

const ReservedDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [candidateName, setCandidateName] = useState('');
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !id) return;

    const fetchReserved = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/reserved/${id}`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (data.candidate?.name) {
          setCandidateName(data.candidate.name);
        }

        if (data.data) {
          setFormData({
            status_reserved: data.data.status_reserved || defaultForm.status_reserved,
            reserved_date: data.data.reserved_date || defaultForm.reserved_date,
            job_order_number: data.data.job_order_number || defaultForm.job_order_number,
            job_order_date: data.data.job_order_date || defaultForm.job_order_date,
            job_position: data.data.job_position || defaultForm.job_position,
            required_count: String(data.data.required_count || defaultForm.required_count),
            company_name: data.data.company_name || defaultForm.company_name,
            work_location: data.data.work_location || defaultForm.work_location,
            hongkong_agency_name: data.data.hongkong_agency_name || data.data.japan_agency_name || defaultForm.hongkong_agency_name,
            interview_date: data.data.interview_date || defaultForm.interview_date,
            estimated_contract_date: data.data.estimated_contract_date || defaultForm.estimated_contract_date,
            reserved_notes: data.data.reserved_notes || defaultForm.reserved_notes,
          });
        }
      } catch (error) {
        console.error(error);
        setMessage('Failed to load reserved data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReserved();
  }, [id, isAdmin]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/reserved/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          required_count: Number(formData.required_count || 0),
        }),
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }

      setMessage('Reserved data saved.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to save reserved data.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
          <p className="text-sm font-bold text-gray-700 mb-4">Admin access only.</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-red-600 text-white text-xs font-black rounded">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-blue-900">Reserved Candidate</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              {candidateName || `Candidate ID ${id}`}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">Status Reserved</h2>
            </div>

            <SelectField label="Status Reserved" value={formData.status_reserved} onChange={value => updateField('status_reserved', value)} options={['Reserved', 'Not Reserved']} />
            <InputField label="Tanggal Reserved" type="date" value={formData.reserved_date} onChange={value => updateField('reserved_date', value)} />

            <SectionTitle title="Informasi Job Order" />
            <InputField label="Nomor Job Order" value={formData.job_order_number} onChange={value => updateField('job_order_number', value)} />
            <InputField label="Tanggal Job Order" type="date" value={formData.job_order_date} onChange={value => updateField('job_order_date', value)} />
            <InputField label="Posisi Pekerjaan" value={formData.job_position} onChange={value => updateField('job_position', value)} />
            <InputField label="Jumlah Kebutuhan" type="number" value={formData.required_count} onChange={value => updateField('required_count', value)} />

            <SectionTitle title="Informasi Employer" />
            <InputField label="Nama Perusahaan" value={formData.company_name} onChange={value => updateField('company_name', value)} />
            <InputField label="Lokasi Kerja" value={formData.work_location} onChange={value => updateField('work_location', value)} />
            <InputField label="Nama Agency Hongkong" value={formData.hongkong_agency_name} onChange={value => updateField('hongkong_agency_name', value)} />

            <SectionTitle title="Proses Selanjutnya" />
            <InputField label="Tanggal Interview" type="date" value={formData.interview_date} onChange={value => updateField('interview_date', value)} />
            <InputField label="Estimasi Kontrak Terbit" type="date" value={formData.estimated_contract_date} onChange={value => updateField('estimated_contract_date', value)} />

            <SectionTitle title="Keterangan" />
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Catatan Reserved</label>
              <textarea
                value={formData.reserved_notes}
                onChange={event => updateField('reserved_notes', event.target.value)}
                rows={5}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className={`text-xs font-bold ${message?.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {loading ? 'Loading reserved data...' : message}
            </p>
            <button
              type="submit"
              disabled={saving || loading}
              className="bg-blue-900 text-white px-8 py-2.5 rounded text-xs font-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Reserved'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <div className="md:col-span-2 pt-3 border-t border-gray-100">
    <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">{title}</h2>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{label}</label>
    <input
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <div>
    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{label}</label>
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

export default ReservedDetail;
