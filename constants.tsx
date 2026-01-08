
import { CategoryItem, CandidateStat, Candidate } from './types';

export const CANDIDATE_STATS: CandidateStat[] = [
  { year: '2020', count: 85 },
  { year: '2021', count: 142 },
  { year: '2022', count: 215 },
  { year: '2023', count: 398 },
  { year: '2024', count: 524 }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    categoryId: 'house-keeper',
    nameLocal: 'NATASYA SHELVI ADELLIA',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sex: 'Female',
    age: 18,
    passportStatus: 'Ready',
    cvAvailable: true
  },
  {
    id: '2',
    categoryId: 'waiters',
    nameLocal: 'DHIVA MAHARANI',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sex: 'Female',
    age: 20,
    passportStatus: 'Ready',
    cvAvailable: true
  },
  {
    id: '3',
    categoryId: 'cook',
    nameLocal: 'ANDI PRATAMA',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sex: 'Male',
    age: 22,
    passportStatus: 'Ready',
    cvAvailable: true
  },
  {
    id: '4',
    categoryId: 'spa-theraphist',
    nameLocal: 'SITI AMINAH',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=500&fit=crop',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sex: 'Female',
    age: 21,
    passportStatus: 'In Process',
    cvAvailable: true
  }
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'house-keeper',
    titleEn: 'House Keeper',
    titleTr: 'Kat Görevlisi',
    imageUrl: '/assets/housekeeping.jpg',
    link: '#'
  },
  {
    id: 'waiters',
    titleEn: 'Waiters',
    titleTr: 'Garson',
    imageUrl: '/assets/waiters.webp',
    link: '#'
  },
  {
    id: 'cook',
    titleEn: 'Cook',
    titleTr: 'Aşçı',
    imageUrl: '/assets/chef.webp',
    link: '#'
  },
  {
    id: 'spa-theraphist',
    titleEn: 'SPA Theraphist',
    titleTr: 'SPA Terapisti',
    imageUrl: '/assets/spatheraphist.jpg',
    link: '#'
  }
];
