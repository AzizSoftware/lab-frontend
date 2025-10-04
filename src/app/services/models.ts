export interface FileDocument {
  id: string;
  filename?: string;
  fileType?: string;
  title?: string;
  authors?: string[];
  affiliations?: string[];
  publicationDate?: string;
  abstractText?: string;
  keywords?: string[];
  doi?: string;
  ownerId?: string;
  uploadedAt?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  grade: string;
  institute: string;
  lastDiploma: string;
  researchArea: string;
  linkedInUrl?: string;
  uploads: FileDocument[];
}

export interface Project {
  id?: string;
  projectName: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  maxTeamMembers: number;
  availableSpots?: number;
  image?: string;
  imagePath?: string;
  teamMembers?: string[];
  createdAt?: string;
}

export interface Event {
  id?: string;
  eventName: string;
  location: string;
  budget: number;
  maxParticipants: number;
  availablePlaces?: number;
  status: string;
  startDate: string;
  endDate: string;
  description: string;
  image?: string;
  imagePath?: string;
  enrolledUsers?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  grade: string;
  institute: string;
  lastDiploma: string;
  researchArea: string;
  linkedInUrl?: string;
}