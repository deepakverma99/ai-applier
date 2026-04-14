// types/index.ts

export interface MasterProfile {
  personal: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: {
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string;
    technologies: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    graduation_year: string;
    gpa?: string;
  }[];
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
  };
  certifications?: string[];
  work_authorization?: string;
  willing_to_relocate?: boolean;
  expected_salary?: {
    min?: number | undefined;
    max?: number | undefined;
    currency?: string | undefined;
  };
}

export interface FieldMapping {
  selector: string;
  action: 'fill' | 'select' | 'click' | 'upload';
  profileKey: string | null;
  confidence: number;
}

export interface DecryptedCredentials {
  email: string;
  password?: string | undefined;
  token?: string | undefined;
}

export interface ApplicationResult {
  status: 'submitted' | 'failed' | 'captcha_paused' | 'in_progress';
  message?: string;
}

export interface JobDiscoveryResult {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  portal: string;
  salary?: string;
  postedAt?: string;
  matchScore?: number;
}

export interface SearchFilters {
  query: string;
  location: string;
  remoteOnly?: boolean;
}
