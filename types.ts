
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
  sex: 'M' | 'F';
  age: number;
  passportStatus: string;
  cvAvailable: boolean;
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}
