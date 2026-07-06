
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

export interface WorkExperienceActivity {
  key: string;
  checked: boolean;
  detail?: string;
}

export interface WorkExperienceItem {
  from: string;
  to: string;
  employerName: string;
  address: string;
  numberOfFamily: string;
  adult: string;
  children: string;
  activities: WorkExperienceActivity[];
  reasonOfLeave: string;
  remarks: string;
  strongPoints: string;
}

export interface Candidate {
  id: string;
  categoryId: string;
  referenceNo: string;
  registerDate: string;
  nameLocal: string;
  nameEn: string;
  photoUrl: string;
  resumeUrl: string;
  videoUrl: string;
  certificateUrl: string;
  passportUrl: string;
  passportNote: string;
  birthDate:string;
  religion: string;
  homeAddress: string;
  placeOfBirth: string;
  phone: string;
  sex: 'M' | 'F';
  weight: number,
  height: number,
  maritalStatus: string,
  lasteducation: string;
  husbandName: string;
  husbandAge: string;
  husbandOccupation: string;
  numberOfChildren: string;
  childrenAge: string;
  numberOfBrother: string;
  brotherAge: string;
  numberOfSister: string;
  sisterAge: string;
  fatherName: string;
  fatherAge: string;
  fatherOccupation: string;
  motherName: string;
  motherAge: string;
  motherOccupation: string;
  familyRank: string;
  workExperiences: WorkExperienceItem[];
  experience: string;
  jobDescription: string;
  fromDate: string;
  toDate: string;
  keterangan: string;
  candidateStatus: string;
  reserved: string;
  age: number;
  passportStatus: string;
  cvAvailable: boolean;
}

export interface CandidateApi {
  id: string;
  category_id: string;
  reference_no?: string;
  register_date?: string;
  name: string;
  name_local?: string;
  birth_date: string;
  religion?: string;
  home_address?: string;
  place_of_birth?: string;
  phone?: string;
  sex: 'M' | 'F';
  weight?: number;
  height?: number;
  marital_status?: string;
  last_education?: string;
  husband_name?: string;
  husband_age?: string;
  husband_occupation?: string;
  number_of_children?: string;
  children_age?: string;
  number_of_brother?: string;
  brother_age?: string;
  number_of_sister?: string;
  sister_age?: string;
  father_name?: string;
  father_age?: string;
  father_occupation?: string;
  mother_name?: string;
  mother_age?: string;
  mother_occupation?: string;
  family_rank?: string;
  work_experience?: WorkExperienceItem[] | string;
  experience?: string;
  job_description?: string;
  from_date?: string;
  to_date?: string;
  keterangan?: string;
  candidate_status?: string;
  reserved?: string;
  passport_status: string;
  passport_note?: string;
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
