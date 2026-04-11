export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'HOSPITAL' | 'ADMIN';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'PENDINGADMINAPPROVAL';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  uniqueId?: string;
}

export interface Patient extends BaseUser {
  role: 'PATIENT';
}

export interface Doctor extends BaseUser {
  role: 'DOCTOR';
  specialization: string;
  licenseNumber: string;
  license_document?: string;
  years_of_experience?: number;
  institution_name?: string;
  registration_number?: string;
}

export interface Nurse extends BaseUser {
  role: 'NURSE';
  licenseNumber: string;
  license_document?: string;
  years_of_experience?: number;
  institution_name?: string;
  registration_number?: string;
}

export interface Hospital extends BaseUser {
  role: 'HOSPITAL';
  address: string;
  registrationNumber: string;
  phone?: string;
  type?: string;
  specialties?: string[];
}

export type AdminUser = Patient | Doctor | Nurse | Hospital;
