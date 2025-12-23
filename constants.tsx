
import { CategoryItem, CandidateStat, Candidate } from './types';

export const CANDIDATE_STATS: CandidateStat[] = [
  { year: '2020', count: 85 },
  { year: '2021', count: 142 },
  { year: '2022', count: 215 },
  { year: '2023', count: 398 },
  { year: '2024', count: 524 }
];

export const MOCK_CANDIDATES: Candidate[] = [
  // House Keeper
  {
    id: '1',
    categoryId: 'housekeeper',
    code: 'JM-2405037',
    nameEn: 'Natasya Shelvi Adellia',
    nameLocal: 'NATASYA SHELVI ADELLIA',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    sex: 'Female',
    age: 18,
    passportStatus: 'Ready',
    cvAvailable: true
  },
  {
    id: '2',
    categoryId: 'housekeeper',
    code: 'MJPNF-2402042',
    nameEn: 'Dhiva Maharani',
    nameLocal: 'DHIVA MAHARANI',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    sex: 'Female',
    age: 20,
    passportStatus: 'Ready',
    cvAvailable: true
  },
  // Waiterss
  {
    id: 'wa-1',
    categoryId: 'Waiterss',
    code: 'FS-2501001',
    nameEn: 'Andi Pratama',
    nameLocal: 'ANDI PRATAMA',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    sex: 'Male',
    age: 22,
    passportStatus: 'Ready',
    cvAvailable: true
  },
  // Cook
  {
    id: 'co-1',
    categoryId: 'cook',
    code: 'FP-2501002',
    nameEn: 'Siti Aminah',
    nameLocal: 'SITI AMINAH',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    sex: 'Female',
    age: 21,
    passportStatus: 'In Process',
    cvAvailable: true
  },
  // SPA Therapist
  {
    id: 'ag-1',
    categoryId: 'spa-theraphist',
    code: 'AG-2501003',
    nameEn: 'Budi Santoso',
    nameLocal: 'BUDI SANTOSO',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    sex: 'Male',
    age: 24,
    passportStatus: 'Ready',
    cvAvailable: true
  },
  // Technical Intern
  {
    id: 'ti-1',
    categoryId: 'technical-intern',
    code: 'TI-2501004',
    nameEn: 'Rizky Fadilah',
    nameLocal: 'RIZKY FADILAH',
    photoUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    sex: 'Male',
    age: 20,
    passportStatus: 'In Process',
    cvAvailable: false
  },
  // Building Cleaning
  {
    id: 'bc-1',
    categoryId: 'building-cleaning',
    code: 'BC-2501005',
    nameEn: 'Lani Marlina',
    nameLocal: 'LANI MARLINA',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    sex: 'Female',
    age: 23,
    passportStatus: 'Ready',
    cvAvailable: true
  }
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'Housekeeper',
    titleEn: 'House Keeper',
    titleTr: 'Kat Görevlisi',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=500&auto=format&fit=crop',
    link: '#'
  },
  {
    id: 'Waiters',
    titleEn: 'Waiters',
    titleTr: 'Servis Görevlisi',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=500&auto=format&fit=crop',
    link: '#'
  },
  {
    id: 'Cook',
    titleEn: 'Cook',
    titleTr: 'Aşçı',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=500&auto=format&fit=crop',
    link: '#'
  },
  {
    id: 'Spatheraphist',
    titleEn: 'SPA Theraphist',
    titleTr: 'Spa Terapistleri',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=500&auto=format&fit=crop',
    link: '#'
  },
 
];
