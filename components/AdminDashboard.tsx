
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../DataContext';
import { Candidate, CandidateApi, WorkExperienceItem } from '../types';
import { buildDocumentUrl, getApiBaseUrl } from '../utils/api';

const workActivityTemplates = [
  { key: 'houseCleaning', label: 'House Cleaning 清潔房屋' },
  { key: 'laundriesIroning', label: 'Doing the laundries 洗衫 & Ironing 熨衫' },
  { key: 'marketCooking', label: 'Go to market & Cooking 烹飪 - 煮菜' },
  { key: 'newBornBabies', label: 'Care of new-born babies 照料初生嬰兒', detailLabel: 'MONTHS / yo 歲' },
  { key: 'youngChildren', label: 'Care of young children 照顧小孩', detailLabel: 'yo 歲' },
  { key: 'elderly', label: 'Care of elderly 照顧老人', detailLabel: 'y.o' },
  { key: 'disabled', label: 'Care of disabled 傷殘', detailLabel: 'y.o' },
  { key: 'illPeople', label: 'Care of ill people, help to bathroom, defecate & urinate 照顧生病的人，幫助廁所，大便，小便' },
  { key: 'feedingMedication', label: 'Feeding and taking medication 進食和服藥' },
  { key: 'pet', label: 'Caring a pet 大體型之寵物', detailLabel: 'Pet' },
  { key: 'gardening', label: 'Gardening 園丁工作' },
  { key: 'carWashing', label: 'Car Washing 洗車', detailLabel: 'Details' },
];

const createBlankWorkExperience = (): WorkExperienceItem => ({
  from: '',
  to: '',
  employerName: '',
  address: '',
  numberOfFamily: '',
  adult: '',
  children: '',
  activities: workActivityTemplates.map(activity => ({
    key: activity.key,
    checked: false,
    detail: '',
  })),
  reasonOfLeave: '',
  remarks: '',
  strongPoints: '',
});

const createDefaultWorkExperiences = () => [
  createBlankWorkExperience(),
];

const normalizeWorkExperiences = (value?: WorkExperienceItem[] | string | null) => {
  let parsed: WorkExperienceItem[] = [];

  if (Array.isArray(value)) {
    parsed = value;
  } else if (typeof value === 'string' && value.trim()) {
    try {
      const data = JSON.parse(value);
      parsed = Array.isArray(data) ? data : [];
    } catch {
      parsed = [];
    }
  }

  const source = parsed.length > 0 ? parsed : createDefaultWorkExperiences();
  return source.map(item => {
    const fallback = createBlankWorkExperience();
    return {
      ...fallback,
      ...item,
      activities: workActivityTemplates.map(template => {
        const existing = Array.isArray((item as WorkExperienceItem).activities)
          ? (item as WorkExperienceItem).activities.find(activity => activity.key === template.key)
          : undefined;
        return {
          key: template.key,
          checked: existing?.checked ?? false,
          detail: existing?.detail ?? '',
        };
      }),
    };
  });
};

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const candidateStatusOptions = [
    'Available for Application',
    'Registered Support Organization Interview Coordination',
    'Company Interview Scheduling',
    'Waiting for Company Interview Results',
  ];
  const reservedOptions = ['Not Available', 'Available'];
  const getTodayInputDate = () => new Date().toISOString().slice(0, 10);
  const religionOptions = [
    'Islam',
    'Christianity',
    'Catholicism',
    'Hinduism',
    'Buddhism',
    'Confucianism',
    'Other',
  ];
  const normalizeExperience = (value?: string | number | null) => {
    const match = String(value ?? '').match(/\d+/);
    return match ? match[0] : '';
  };
  const formatDisplayDate = (value?: string | null) => {
    const text = String(value ?? '').trim();
    if (!text) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return text;

    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : text;
  };
  const formatApiDate = (value?: string | null) => {
    const text = String(value ?? '').trim();
    const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : text || null;
  };
  const isDisplayDate = (value?: string | null) => {
    const text = String(value ?? '').trim();
    return !text || /^\d{2}\/\d{2}\/\d{4}$/.test(text);
  };
  const parseDisplayDate = (value?: string | null) => {
    const text = String(value ?? '').trim();
    const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };
  const calculateExperience = (fromDate?: string | null, toDate?: string | null) => {
    const from = parseDisplayDate(fromDate);
    const to = parseDisplayDate(toDate);
    if (!from || !to || to < from) return '';

    let years = to.getFullYear() - from.getFullYear();
    const hasNotReachedAnniversary =
      to.getMonth() < from.getMonth() ||
      (to.getMonth() === from.getMonth() && to.getDate() < from.getDate());

    if (hasNotReachedAnniversary) years -= 1;
    return String(Math.max(years, 0));
  };

  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'personal' | 'family' | 'application'>('personal');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  // Refs for file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  // const [files, setFiles] = useState<{
  //   photo?: File;
  //   cv?: File;
  //   video?: File;
  //   certificate?: File;
  //   passport?: File;
  // }>({});

  //Perbaikan kode buat ubah files state 20260120

  type FileType = 'photo' | 'cv' | 'video' | 'certificate' | 'passport';


  const [files, setFiles] = useState<Record<FileType, File | undefined>>({
    photo: undefined,
    cv: undefined,
    video: undefined,
    certificate: undefined,
    passport: undefined,
  });

  ///////////////////////////////////////

  // Form State
  const [formData, setFormData] = useState<Omit<Candidate, 'id'>>({
    categoryId: categories[0]?.id || 'house-keeper',
    referenceNo: '',
    registerDate: getTodayInputDate(),
    nameEn: '',
    nameLocal: '',
    photoUrl: '',
    resumeUrl: '',
    videoUrl: '',
    certificateUrl: '',
    passportUrl: '',
    passportNote: '',
    religion: '',
    homeAddress: '',
    placeOfBirth: '',
    phone: '',
    sex: 'F',
    age: 0,

    weight: 0,
    height: 0,
    maritalStatus: 'single',
    lasteducation: '',
    husbandName: '',
    husbandAge: '',
    husbandOccupation: '',
    numberOfChildren: '',
    childrenAge: '',
    numberOfBrother: '',
    brotherAge: '',
    numberOfSister: '',
    sisterAge: '',
    fatherName: '',
    fatherAge: '',
    fatherOccupation: '',
    motherName: '',
    motherAge: '',
    motherOccupation: '',
    familyRank: '',
    workExperiences: createDefaultWorkExperiences(),
    experience: '',
    jobDescription: '',
    fromDate: '',
    toDate: '',
    keterangan: '',
    candidateStatus: candidateStatusOptions[0],
    reserved: reservedOptions[0],
    passportStatus: 'Ready',
    cvAvailable: true
  });

  const handleExperienceDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      const hasDateInput = next.fromDate.trim() || next.toDate.trim();
      const hasCompleteDates = parseDisplayDate(next.fromDate) && parseDisplayDate(next.toDate);

      if (!hasDateInput || hasCompleteDates) {
        return {
          ...next,
          experience: calculateExperience(next.fromDate, next.toDate),
        };
      }

      return next;
    });
  };

  const updateWorkExperience = (
    index: number,
    updates: Partial<WorkExperienceItem>
  ) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, createBlankWorkExperience()],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.length > 1
        ? prev.workExperiences.filter((_, itemIndex) => itemIndex !== index)
        : prev.workExperiences,
    }));
  };

  const updateWorkActivity = (
    experienceIndex: number,
    activityKey: string,
    updates: { checked?: boolean; detail?: string }
  ) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map((item, itemIndex) =>
        itemIndex === experienceIndex
          ? {
            ...item,
            activities: item.activities.map(activity =>
              activity.key === activityKey ? { ...activity, ...updates } : activity
            ),
          }
          : item
      ),
    }));
  };

  // konstanta untuk hitung umur
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear();
    return age;
  };

  // api url
  const api = getApiBaseUrl();
  const [dataApplicant, setDataApplicant] = useState([]);

  // fetch category
  const fetchCategory = async () => {
    try {
      const response = await fetch(`${api}/ref/category`);
      const result = await response.json();
      console.log('API RESULT:', result.data); // DEBUG
      setCategories(result.data); // sekarang PASTI jalan
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // fetch data
  const fetchData = async () => {
    try {
      const response = await fetch(`${api}/applicant`);
      const result = await response.json();

      console.log('API RESULT:', result.data); // DEBUG
      setDataApplicant(result.data); // sekarang PASTI jalan
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // add data
  const addData = async () => {
    const response = await fetch(`${api}/applicant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.nameEn,
        category_id: formData.categoryId,
        reference_no: formData.referenceNo,
        register_date: formData.registerDate,
        birth_date: formData.birthDate,
        age: formData.age,
        religion: formData.religion,
        home_address: formData.homeAddress,
        place_of_birth: formData.placeOfBirth,
        phone: formData.phone,
        sex: formData.sex,
        weight: formData.weight,
        height: formData.height,
        marital_status: formData.maritalStatus,
        last_education: formData.lasteducation,
        husband_name: formData.husbandName,
        husband_age: formData.husbandAge,
        husband_occupation: formData.husbandOccupation,
        number_of_children: formData.numberOfChildren,
        children_age: formData.childrenAge,
        number_of_brother: formData.numberOfBrother,
        brother_age: formData.brotherAge,
        number_of_sister: formData.numberOfSister,
        sister_age: formData.sisterAge,
        father_name: formData.fatherName,
        father_age: formData.fatherAge,
        father_occupation: formData.fatherOccupation,
        mother_name: formData.motherName,
        mother_age: formData.motherAge,
        mother_occupation: formData.motherOccupation,
        family_rank: formData.familyRank,
        work_experience: formData.workExperiences,
        experience: normalizeExperience(formData.experience),
        job_description: formData.jobDescription,
        from_date: formatApiDate(formData.fromDate),
        to_date: formatApiDate(formData.toDate),
        keterangan: formData.keterangan,
        candidate_status: formData.candidateStatus,
        reserved: formData.reserved,
        passport_note: formData.passportNote,
        created_by: 1
      }),
    });



    if (!response.ok) {
      throw new Error('Failed to create applicant');
    }

    return response.json(); // 🔥 WAJIB RETURN
  };

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchData();
    fetchCategory();
  }, [api]);




  // const handleEdit = (c: Candidate) => {
  //   setEditingId(c.id);
  //   setFormData(c);
  //   setIsAdding(false);
  // };

  //Fixing handle edit 20260120

  const handleEdit = (c: CandidateApi) => {
    setEditingId(c.id);

    setFormData({
      categoryId: c.category_id, // ✅ SEKARANG VALID
      referenceNo: c.reference_no || '',
      registerDate: c.register_date?.slice(0, 10) || '',
      nameEn: c.name,
      nameLocal: c.name_local || '',
      photoUrl: c.document?.photo?.file_path
        ? buildDocumentUrl(c.document.photo.file_path)
        : '',
      resumeUrl: c.document?.cv?.file_path
        ? buildDocumentUrl(c.document.cv.file_path)
        : '',
      videoUrl: c.document?.video?.file_path
        ? buildDocumentUrl(c.document.video.file_path)
        : '',
      certificateUrl: c.document?.certificate?.file_path
        ? buildDocumentUrl(c.document.certificate.file_path)
        : '',
      passportUrl: c.document?.passport?.file_path
        ? buildDocumentUrl(c.document.passport.file_path)
        : '',
      passportNote: c.passport_note || '',
      religion: c.religion || '',
      homeAddress: c.home_address || '',
      placeOfBirth: c.place_of_birth || '',
      phone: c.phone || '',
      sex: c.sex,
      weight: c.weight || 0,
      height: c.height || 0,
      maritalStatus: c.marital_status || 'single',
      lasteducation: c.last_education || '',
      husbandName: c.husband_name || '',
      husbandAge: c.husband_age || '',
      husbandOccupation: c.husband_occupation || '',
      numberOfChildren: c.number_of_children || '',
      childrenAge: c.children_age || '',
      numberOfBrother: c.number_of_brother || '',
      brotherAge: c.brother_age || '',
      numberOfSister: c.number_of_sister || '',
      sisterAge: c.sister_age || '',
      fatherName: c.father_name || '',
      fatherAge: c.father_age || '',
      fatherOccupation: c.father_occupation || '',
      motherName: c.mother_name || '',
      motherAge: c.mother_age || '',
      motherOccupation: c.mother_occupation || '',
      familyRank: c.family_rank || '',
      workExperiences: normalizeWorkExperiences(c.work_experience),
      experience: normalizeExperience(c.experience),
      jobDescription: c.job_description || '',
      fromDate: formatDisplayDate(c.from_date),
      toDate: formatDisplayDate(c.to_date),
      keterangan: c.keterangan || '',
      candidateStatus: c.candidate_status || candidateStatusOptions[0],
      reserved: c.reserved || reservedOptions[0],
      age: calculateAge(c.birth_date),
      passportStatus: c.passport_status,
      cvAvailable: c.document?.cv?.available ?? false,
      birthDate: c.birth_date.slice(0, 10),
    });

    setActiveFormTab('personal');
    setFiles({
      photo: undefined,
      cv: undefined,
      video: undefined,
      certificate: undefined,
      passport: undefined,
    });

    setIsAdding(false);
  };

  const fileUrlMap: Record<FileType, keyof typeof formData> = {
    photo: 'photoUrl',
    cv: 'resumeUrl',
    video: 'videoUrl',
    certificate: 'certificateUrl',
    passport: 'passportUrl',
  };




  //
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };



  // const handleFileChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   type: 'photo' | 'cv' | 'video' | 'certificate' | 'passport'

  // ) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFiles(prev => ({ ...prev, [type]: file }));
  //   }
  // };  


  //Ubah handleFileChange 20262001

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: FileType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1️⃣ simpan file
    setFiles(prev => ({ ...prev, [type]: file }));

    // 2️⃣ tampilkan nama file / preview di text field
    const preview =
      type === 'photo' || type === 'passport'
        ? URL.createObjectURL(file) // image preview
        : file.name; // text preview

    const key = fileUrlMap[type];

    setFormData(prev => ({
      ...prev,
      [key]: preview,
    }));
  };


  //

  const validateForm = (): boolean => {
    if (!formData.nameEn.trim()) {
      showNotification('Name is required', 'error');
      return false;
    }
    if (!isDisplayDate(formData.fromDate)) {
      showNotification('From Date must use dd/mm/yyyy format', 'error');
      return false;
    }
    if (!isDisplayDate(formData.toDate)) {
      showNotification('To Date must use dd/mm/yyyy format', 'error');
      return false;
    }
    return true;
  };

  const uploadDocument = async (
    applicantId: number,
    type: string,
    file: File
  ) => {
    const form = new FormData();
    form.append('file', file);
    form.append('applicant_id', applicantId.toString());
    form.append('type', type);

    const res = await fetch(`${api}/document`, {
      method: 'POST',
      body: form
    });

    if (!res.ok) {
      throw new Error(`Upload ${type} failed`);
    }
  };

  const updateApplicant = async (
    id: string,
    data: Omit<Candidate, 'id'>
  ) => {
    const response = await fetch(`${api}/applicant/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.nameEn,
        category_id: data.categoryId,
        reference_no: data.referenceNo,
        register_date: data.registerDate,
        birth_date: data.birthDate,
        age: data.age,
        religion: data.religion,
        home_address: data.homeAddress,
        place_of_birth: data.placeOfBirth,
        phone: data.phone,
        sex: data.sex,
        weight: data.weight,
        height: data.height,
        marital_status: data.maritalStatus,
        last_education: data.lasteducation,
        husband_name: data.husbandName,
        husband_age: data.husbandAge,
        husband_occupation: data.husbandOccupation,
        number_of_children: data.numberOfChildren,
        children_age: data.childrenAge,
        number_of_brother: data.numberOfBrother,
        brother_age: data.brotherAge,
        number_of_sister: data.numberOfSister,
        sister_age: data.sisterAge,
        father_name: data.fatherName,
        father_age: data.fatherAge,
        father_occupation: data.fatherOccupation,
        mother_name: data.motherName,
        mother_age: data.motherAge,
        mother_occupation: data.motherOccupation,
        family_rank: data.familyRank,
        work_experience: data.workExperiences,
        experience: normalizeExperience(data.experience),
        job_description: data.jobDescription,
        from_date: formatApiDate(data.fromDate),
        to_date: formatApiDate(data.toDate),
        keterangan: data.keterangan,
        candidate_status: data.candidateStatus,
        reserved: data.reserved,
        passport_note: data.passportNote,
        passport_status: data.passportStatus,
        updated_by: 1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update applicant');
    }

    return response.json();
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {



      // let applicantId = result.id;
      let applicantId = editingId;
      // 🔥 CREATE
      if (!editingId) {
        const result = await addData();
        applicantId = result.id;
      }

      // 🔥 UPDATE DATA (OPTIONAL)
      if (editingId) {
        await updateApplicant(editingId, formData);
      }

      // 🔥 AUTO CLOSE MODAL
      setIsAdding(false);
      setEditingId(null);

      // (opsional) reset form
      setFormData({
        categoryId: categories[0]?.id || 'house-keeper',
        referenceNo: '',
        registerDate: getTodayInputDate(),
        nameEn: '',
        nameLocal: '',
        photoUrl: '',
        resumeUrl: '',
        videoUrl: '',
        certificateUrl: '',
        passportUrl: '',
        passportNote: '',
        religion: '',
        homeAddress: '',
        placeOfBirth: '',
        phone: '',
        sex: 'F',
        age: 0,

        weight: 0,
        height: 0,
        maritalStatus: 'single',
        lasteducation: '',
        husbandName: '',
        husbandAge: '',
        husbandOccupation: '',
        numberOfChildren: '',
        childrenAge: '',
        numberOfBrother: '',
        brotherAge: '',
        numberOfSister: '',
        sisterAge: '',
        fatherName: '',
        fatherAge: '',
        fatherOccupation: '',
        motherName: '',
        motherAge: '',
        motherOccupation: '',
        familyRank: '',
        workExperiences: createDefaultWorkExperiences(),
        experience: '',
        jobDescription: '',
        fromDate: '',
        toDate: '',
        keterangan: '',
        candidateStatus: candidateStatusOptions[0],
        reserved: reservedOptions[0],
        passportStatus: 'Ready',
        cvAvailable: true,
        birthDate: '',
      });

      setFiles({
        photo: undefined,
        cv: undefined,
        video: undefined,
        certificate: undefined,
        passport: undefined,
      });



      // 2️⃣ UPLOAD FILE SATU-SATU
      if (files.photo)
        await uploadDocument(applicantId, 'photo', files.photo);

      if (files.cv)
        await uploadDocument(applicantId, 'cv', files.cv);

      if (files.video)
        await uploadDocument(applicantId, 'video', files.video);

      if (files.passport)
        await uploadDocument(applicantId, 'passport', files.passport);

      if (files.certificate)
        await uploadDocument(applicantId, 'certificate', files.certificate);

      showNotification('Candidate & documents saved!');
      await fetchData();

    } catch (err) {
      console.error(err);
      showNotification('Upload failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${api}/applicant/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Delete failed');
      }

      showNotification('Candidate deleted successfully!');
      await fetchData(); // 🔥 REFRESH DATA
    } catch (error) {
      console.error(error);
      showNotification('Failed to delete candidate', 'error');
    }
  };

  const handlePublish = async (id: string, name: string) => {
    setPublishingId(id);

    try {
      const response = await fetch(`${api}/applicant/${id}/publish-cv`, {
        method: 'POST',
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Publish failed');
      }

      showNotification(`${name} CV published!`);
      await fetchData();
    } catch (error) {
      console.error(error);
      showNotification(error instanceof Error ? error.message : 'Failed to publish candidate CV', 'error');
    } finally {
      setPublishingId(null);
    }
  };


  const FileUploadField = ({
    label,
    fileType,
    currentValue,
    accept,
    inputRef,
    icon
  }: {
    label: string;
    fileType: FileType;
    currentValue: string;
    accept: string;
    inputRef: React.RefObject<HTMLInputElement>;
    icon: React.ReactNode;
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
          // placeholder="No file uploaded to Drive yet..."
          />
          {currentValue && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>)}
          {currentValue && (
            <span className="text-[9px] text-green-600 font-bold uppercase">
              File already uploaded
            </span>)}
        </div>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={(e) => handleFileChange(e, fileType)}
        />
        <button
          type="button"
          disabled={isUploading[fileType]}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95 ${isUploading[fileType] ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {icon}
          <span>{isUploading[fileType] ? 'Uploading...' : 'Browse'}</span>
        </button>
      </div>
      {isUploading[fileType] && (
        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-red-600 h-full transition-all duration-300"
            style={{ width: `${uploadProgress[fileType]}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-[1000] px-6 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
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
            setActiveFormTab('personal');
            setFormData({
              categoryId: categories[0]?.id || 'house-keeper',
              referenceNo: '',
              registerDate: getTodayInputDate(),
              nameEn: '',
              nameLocal: '',
              photoUrl: '',
              resumeUrl: '',
              videoUrl: '',
              certificateUrl: '',
              passportUrl: '',
              passportNote: '',
              religion: '',
              homeAddress: '',
              placeOfBirth: '',
              phone: '',
              sex: 'F',
              age: 0,
              weight: 0,
              height: 0,
              maritalStatus: 'single',
              lasteducation: '',
              husbandName: '',
              husbandAge: '',
              husbandOccupation: '',
              numberOfChildren: '',
              childrenAge: '',
              numberOfBrother: '',
              brotherAge: '',
              numberOfSister: '',
              sisterAge: '',
              fatherName: '',
              fatherAge: '',
              fatherOccupation: '',
              motherName: '',
              motherAge: '',
              motherOccupation: '',
              familyRank: '',
              workExperiences: createDefaultWorkExperiences(),
              experience: '',
              jobDescription: '',
              fromDate: '',
              toDate: '',
              keterangan: '',
              candidateStatus: candidateStatusOptions[0],
              reserved: reservedOptions[0],
              birthDate: '',
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
                  <th className="px-6 py-4">Candidate Status</th>
                  <th className="px-6 py-4">Reserved</th>
                  <th className="px-6 py-4">Passport Note</th>
                  <th className="px-6 py-4">Status Docs</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                  <th className="px-6 py-4 text-right">Publish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataApplicant.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-medium italic">No candidates found. Start by adding one.</td>
                  </tr>
                ) : (
                  dataApplicant.map(c => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <img
                          src={
                            c.document?.photo?.available
                              ? buildDocumentUrl(c.document.photo.file_path)
                              : "https://via.placeholder.com/40"
                          }
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                          alt=""
                        />

                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 leading-none mb-1">{c.name}</p>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-tight">{c.sex}, {calculateAge(c.birth_date)} Years Old</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-widest">
                          {c.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-1 rounded uppercase tracking-tight">
                          {c.candidate_status || candidateStatusOptions[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tight ${c.reserved === 'Available'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                          }`}>
                          {c.reserved || reservedOptions[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[240px]">
                        <p
                          className="text-[11px] font-bold text-gray-600 leading-snug line-clamp-3"
                          title={c.passport_note || ''}
                        >
                          {c.passport_note?.trim() || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <div className="flex flex-col items-center">
                            <span className={`w-2.5 h-2.5 rounded-full mb-1 ${c.document?.cv?.available ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">CV</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-2.5 h-2.5 rounded-full mb-1 ${c.document?.video?.available ? 'bg-blue-500' : 'bg-gray-200'}`}></span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">VID</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-2.5 h-2.5 rounded-full mb-1 ${c.document?.certificate?.available ? 'bg-yellow-500' : 'bg-gray-200'}`}></span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">CERT</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        <button onClick={() => handleEdit(c)} className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:text-blue-800 underline-offset-4 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="text-red-600 font-bold text-[10px] uppercase tracking-widest hover:text-red-800 underline-offset-4 hover:underline">Delete</button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={publishingId === c.id || !c.document?.photo?.available}
                          onClick={() => handlePublish(c.id, c.name)}
                          title={c.document?.photo?.available ? 'Publish generated CV' : 'Upload photo before publish'}
                          className="bg-green-600 text-white px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {publishingId === c.id ? 'Publishing...' : 'Publish'}
                        </button>
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
          <div className="relative my-3 flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300 sm:my-0 sm:max-h-[calc(100vh-2rem)]">
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
              <div className="shrink-0 bg-blue-900 p-4 text-white flex justify-between items-center sm:p-6">
                <h3 className="text-base font-black uppercase tracking-widest sm:text-xl">{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="shrink-0 border-b border-gray-200 bg-white px-4 pt-4 sm:px-6 sm:pt-5">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'personal', label: 'PERSONAL DATA 個人紀錄' },
                    { id: 'family', label: 'FAMILY BACKGROUND 家庭背景' },
                    { id: 'application', label: 'Work Experience' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFormTab(tab.id as typeof activeFormTab)}
                      className={`px-3 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeFormTab === tab.id
                        ? 'border-blue-900 text-blue-900 bg-blue-50'
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
                {activeFormTab === 'personal' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Reference 編號</label>
                      <input type="text" value={formData.referenceNo} onChange={e => setFormData({ ...formData, referenceNo: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="Enter reference number" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">REGISTER DATE</label>
                      <input
                        type="date"
                        value={formData.registerDate}
                        onChange={e => setFormData({ ...formData, registerDate: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-black uppercase tracking-widest text-blue-900">PERSONAL DATA 個人紀錄</h4>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Name 姓名 <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" placeholder="Enter full name" required />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Age 年齡</label>
                      <input type="number" min="0" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : 0 })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Attainment 學歷</label>
                      <select value={formData.lasteducation} onChange={e => setFormData({ ...formData, lasteducation: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                        <option value="">Select Education</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Religion 宗教</label>
                      <select value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                        <option value="">Select Religion</option>
                        {religionOptions.map(religion => (
                          <option key={religion} value={religion}>{religion}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Marital Status 婚姻狀況</label>
                      <select value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="divorced">Divorced</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Sex 性別</label>
                      <div className="flex space-x-4 mt-3">
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={formData.sex === 'M'} onChange={() => setFormData({ ...formData, sex: 'M' })} className="w-4 h-4 text-blue-600" /><span className="text-xs font-bold text-gray-700">Male</span></label>
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={formData.sex === 'F'} onChange={() => setFormData({ ...formData, sex: 'F' })} className="w-4 h-4 text-red-600" /><span className="text-xs font-bold text-gray-700">Female</span></label>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Home Address 地址</label>
                      <textarea value={formData.homeAddress} onChange={e => setFormData({ ...formData, homeAddress: e.target.value })} className="w-full min-h-[88px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium resize-y" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Date of Birth 出生日期</label>
                      <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Place of Birth 出生地點</label>
                      <input type="text" value={formData.placeOfBirth} onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Weight 體重</label>
                      <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value ? parseInt(e.target.value) : 0 })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Height 高度</label>
                      <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value ? parseInt(e.target.value) : 0 })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">PHONE NUMBER</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <FileUploadField label="Upload file photo" fileType="photo" currentValue={formData.photoUrl} accept="image/*" inputRef={photoInputRef} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                    <FileUploadField label="Upload file video" fileType="video" currentValue={formData.videoUrl} accept="video/*" inputRef={videoInputRef} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
                  </div>
                )}

                {activeFormTab === 'family' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <h4 className="text-sm font-black uppercase tracking-widest text-blue-900">FAMILY BACKGROUND 家庭背景</h4>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Husband's Name 丈夫姓名</label>
                      <input type="text" value={formData.husbandName} onChange={e => setFormData({ ...formData, husbandName: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Husband's Age 丈夫年齡</label>
                      <div className="relative">
                        <input type="number" min="0" value={formData.husbandAge} onChange={e => setFormData({ ...formData, husbandAge: e.target.value })} className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">y.o</span>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Husband's Occupation 丈夫職業</label>
                      <input type="text" value={formData.husbandOccupation} onChange={e => setFormData({ ...formData, husbandOccupation: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">No. of Children 子女人數</label>
                      <input type="number" min="0" value={formData.numberOfChildren} onChange={e => setFormData({ ...formData, numberOfChildren: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Age of Children 子女年齡</label>
                      <div className="relative">
                        <input type="text" value={formData.childrenAge} onChange={e => setFormData({ ...formData, childrenAge: e.target.value })} className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">y.o</span>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">No. of Brother 兄弟數目</label>
                      <input type="number" min="0" value={formData.numberOfBrother} onChange={e => setFormData({ ...formData, numberOfBrother: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Age of Brother</label>
                      <div className="relative">
                        <input type="text" value={formData.brotherAge} onChange={e => setFormData({ ...formData, brotherAge: e.target.value })} className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">y.o</span>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">No. of Sister 姊妹數目</label>
                      <input type="number" min="0" value={formData.numberOfSister} onChange={e => setFormData({ ...formData, numberOfSister: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Age of Sister</label>
                      <div className="relative">
                        <input type="text" value={formData.sisterAge} onChange={e => setFormData({ ...formData, sisterAge: e.target.value })} className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">y.o</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Father's Name 父親姓名</label>
                      <input type="text" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Father's Age 父親年齡</label>
                      <div className="relative">
                        <input type="number" min="0" value={formData.fatherAge} onChange={e => setFormData({ ...formData, fatherAge: e.target.value })} className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">y.o</span>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Father's Occupation 父親職業</label>
                      <input type="text" value={formData.fatherOccupation} onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Mother's Name 母親姓名</label>
                      <input type="text" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Mother's Age 母親年齡</label>
                      <div className="relative">
                        <input type="number" min="0" value={formData.motherAge} onChange={e => setFormData({ ...formData, motherAge: e.target.value })} className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">y.o</span>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Mother's Occupation 母親職業</label>
                      <input type="text" value={formData.motherOccupation} onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">In the Family, I am No 在家排行</label>
                      <input type="text" value={formData.familyRank} onChange={e => setFormData({ ...formData, familyRank: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                  </div>
                )}

                {activeFormTab === 'application' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 flex items-center justify-between gap-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-blue-900">Work Experience</h4>
                      <button
                        type="button"
                        onClick={addWorkExperience}
                        className="rounded-lg bg-blue-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-800"
                      >
                        Add Experience
                      </button>
                    </div>
                    {formData.workExperiences.map((workExperience, experienceIndex) => (
                      <div key={experienceIndex} className="col-span-2 border border-gray-200 rounded-lg p-5 bg-white">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <h5 className="text-xs font-black uppercase tracking-widest text-blue-900">
                            Experience {experienceIndex + 1}
                          </h5>
                          {formData.workExperiences.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWorkExperience(experienceIndex)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">From 由</label>
                            <input type="text" value={workExperience.from} onChange={e => updateWorkExperience(experienceIndex, { from: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="dd-mm-yyyy" pattern="\d{2}-\d{2}-\d{4}" />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">To 至</label>
                            <input type="text" value={workExperience.to} onChange={e => updateWorkExperience(experienceIndex, { to: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="dd-mm-yyyy" pattern="\d{2}-\d{2}-\d{4}" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Name of Employer 僱主姓名</label>
                            <input type="text" value={workExperience.employerName} onChange={e => updateWorkExperience(experienceIndex, { employerName: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Address 地址</label>
                            <textarea value={workExperience.address} onChange={e => updateWorkExperience(experienceIndex, { address: e.target.value })} className="w-full min-h-[80px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-y" />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Number of Family 家裡人數</label>
                            <div className="relative">
                              <input type="number" min="0" value={workExperience.numberOfFamily} onChange={e => updateWorkExperience(experienceIndex, { numberOfFamily: e.target.value })} className="w-full p-3 pr-20 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">person</span>
                            </div>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Adult</label>
                            <input type="number" min="0" value={workExperience.adult} onChange={e => updateWorkExperience(experienceIndex, { adult: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Children 兒子</label>
                            <div className="relative">
                              <input type="text" value={workExperience.children} onChange={e => updateWorkExperience(experienceIndex, { children: e.target.value })} className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="2 & 4" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">y.o</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Working Activity & Responsibility 工作責任</label>
                            <div className="space-y-3">
                              {workActivityTemplates.map(template => {
                                const activity = workExperience.activities.find(item => item.key === template.key);
                                return (
                                  <div key={template.key} className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <input type="checkbox" checked={activity?.checked ?? false} onChange={e => updateWorkActivity(experienceIndex, template.key, { checked: e.target.checked })} className="mt-1 h-4 w-4 text-blue-700" />
                                    <div className="space-y-2">
                                      <span className="block text-xs font-bold text-gray-700">{template.label}</span>
                                      {template.detailLabel && (
                                        <input type="text" value={activity?.detail ?? ''} onChange={e => updateWorkActivity(experienceIndex, template.key, { detail: e.target.value })} className="w-full p-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder={template.detailLabel} />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Reason of Leave 離職原因</label>
                            <textarea value={workExperience.reasonOfLeave} onChange={e => updateWorkExperience(experienceIndex, { reasonOfLeave: e.target.value })} className="w-full min-h-[76px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-y" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Remarks 備註</label>
                            <textarea value={workExperience.remarks} onChange={e => updateWorkExperience(experienceIndex, { remarks: e.target.value })} className="w-full min-h-[76px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-y" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Description Strong Points</label>
                            <textarea value={workExperience.strongPoints} onChange={e => updateWorkExperience(experienceIndex, { strongPoints: e.target.value })} className="w-full min-h-[76px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-y" />
                          </div>
                        </div>
                      </div>
                    ))}
                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Sheet / Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Birth Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  />
                </div>

                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Sex</label>
                  <div className="flex space-x-4 mt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" checked={formData.sex === 'M'} onChange={() => setFormData({ ...formData, sex: 'M' })} className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" checked={formData.sex === 'F'} onChange={() => setFormData({ ...formData, sex: 'F' })} className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-gray-700">Female</span>
                    </label>
                  </div>
                </div>

                                {/* Weight */}
                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Weight (KG)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData,  weight: e.target.value ? parseInt(e.target.value) : 0 })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>

                {/* Height */}
                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Height (CM)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: e.target.value ? parseInt(e.target.value) : 0 })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>

                {/* Marital Status */}
                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Marital Status
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                  </select>
                </div>

                {/* Last Education */}
                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Last Education
                  </label>

                  <select
                    value={formData.lasteducation}
                    onChange={e =>
                      setFormData({ ...formData, lasteducation: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  >
                    <option value="">Select Education</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor’s Degree">Bachelor’s Degree</option>
                  </select>
                </div>

                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: normalizeExperience(e.target.value) })}
                    className="w-full p-3 pr-16 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    placeholder="0"
                  />
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {formData.experience === '1' ? 'YEAR' : 'YEARS'}
                  </span>
                </div>

                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Job Description
                  </label>
                  <textarea
                    value={formData.jobDescription}
                    onChange={e => setFormData({ ...formData, jobDescription: e.target.value })}
                    className="w-full min-h-[88px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium resize-y"
                    placeholder="Enter job description"
                  />
                </div>

                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    From Date
                  </label>
                  <input
                    type="text"
                    value={formData.fromDate}
                    onChange={e => handleExperienceDateChange('fromDate', e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    placeholder="dd/mm/yyyy"
                    inputMode="numeric"
                    pattern="\d{2}/\d{2}/\d{4}"
                  />
                </div>

                <div className="hidden">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    To Date
                  </label>
                  <input
                    type="text"
                    value={formData.toDate}
                    onChange={e => handleExperienceDateChange('toDate', e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    placeholder="dd/mm/yyyy"
                    inputMode="numeric"
                    pattern="\d{2}/\d{2}/\d{4}"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Reserved
                  </label>
                  <select
                    value={formData.reserved}
                    onChange={e =>
                      setFormData({ ...formData, reserved: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  >
                    {reservedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <div className="h-px bg-gray-100 w-full my-4"></div>
                </div>

                {/* Photo Upload */}
                <FileUploadField
                  label="Photo Candidate"
                  fileType="photo"
                  currentValue={formData.photoUrl}
                  accept="image/*"
                  inputRef={photoInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />

                {/* Passport Upload */}
                <FileUploadField
                  label="Passport Candidate"
                  fileType="passport"
                  currentValue={formData.passportUrl}
                  accept="image/*"
                  inputRef={passportInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Passport Note
                  </label>
                  <textarea
                    value={formData.passportNote}
                    onChange={e => setFormData({ ...formData, passportNote: e.target.value })}
                    className="w-full min-h-[88px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium resize-y"
                    placeholder="Notes kapan passport terbit, contoh: Passport terbit 12 Jan 2026"
                  />
                </div>

                {/* CV PDF Upload */}
                <FileUploadField
                  label="CV PDF"
                  fileType="cv"
                  currentValue={formData.resumeUrl}
                  accept=".pdf"
                  inputRef={resumeInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                />

                {/* Video Upload */}
                <FileUploadField
                  label="Intro Video"
                  fileType="video"
                  currentValue={formData.videoUrl}
                  accept="video/*"
                  inputRef={videoInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                />

                {/* Certificate Upload */}
                <FileUploadField
                  label="Certificate PDF"
                  fileType="certificate"
                  currentValue={formData.certificateUrl}
                  accept=".pdf"
                  inputRef={certInputRef}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
                  </div>
                )}
              </div>

              <div className="shrink-0 bg-gray-50 p-4 flex justify-end space-x-4 sm:p-8">
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
