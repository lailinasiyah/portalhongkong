
export interface CategoryItem {
  id: number; // ← numeric
  titleEn: string;
  titleTr: string;
  imageUrl: string;
}


export interface CandidateStat {
  year: string;
  count: number;
}

export interface Candidate {
  id: string;
  categoryId: string;
  nameLocal: string;
  nameEn: string;
  photoUrl: string;
  resumeUrl: string;
  videoUrl: string;
  certificateUrl: string;
  passportUrl: string;
  birthDate:string;
  sex: 'M' | 'F';
  weight: 0,
  height: 0,
  maritalStatus: 'single',
  lasteducation: string;
  age: number;
  passportStatus: string;
  cvAvailable: boolean;
}

export interface CandidateApi {
  id: string;
  category_id: string;
  name: string;
  name_local?: string;
  birth_date: string;
  sex: 'M' | 'F';
  weight?: number;
  height?: number;
  marital_status?: string;
  last_education?: string;
  passport_status: string;
  category_name?: string;
  document?: {
    photo?: { file_path: string; available: boolean };
    cv?: { file_path: string; available: boolean };
    video?: { file_path: string; available: boolean };
    certificate?: { file_path: string; available: boolean };
    passport?: { file_path: string; available: boolean };
  };
}


export interface User {
  username: string;
  role: 'admin' | 'user';
}
