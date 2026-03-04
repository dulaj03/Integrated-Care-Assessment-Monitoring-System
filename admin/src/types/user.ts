export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'HOSPITAL' | 'ADMIN';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Patient extends BaseUser {
  role: 'PATIENT';
}

export interface Doctor extends BaseUser {
  role: 'DOCTOR';
  specialization: string;
  licenseNumber: string;
}

export interface Nurse extends BaseUser {
  role: 'NURSE';
  licenseNumber: string;
}

export interface Hospital extends BaseUser {
  role: 'HOSPITAL';
  address: string;
  registrationNumber: string;
}

export type AdminUser = Patient | Doctor | Nurse | Hospital;
