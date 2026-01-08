
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
  photoUrl: string;
  resumeUrl: string;
  videoUrl: string;
  certificateUrl: string;
  sex: 'Male' | 'Female';
  age: number;
  passportStatus: string;
  cvAvailable: boolean;
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}
