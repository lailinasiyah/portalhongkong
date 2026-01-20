
export interface CategoryItem {
  id: string;
  titleEn: string;
  titleTr: string;
  imageUrl: string;
  link: string;
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
