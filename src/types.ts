export type UserRole = 'admin' | 'student';

export type AttendanceStatus = 'unmarked' | 'attended' | 'absent';
export type RegistrationStatus = 'confirmed' | 'waitlisted';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  contactNumber?: string;
  department?: string;
  password?: string;
}

export interface CollegeEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  maxSeats: number;
  venue?: string;
  category?: 'Technical' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports';
  description?: string;
  createdBy: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRollNumber?: string;
  studentContact?: string;
  status: RegistrationStatus;
  attendance: AttendanceStatus;
  registeredAt: string;
  promotedAt?: string;
}
