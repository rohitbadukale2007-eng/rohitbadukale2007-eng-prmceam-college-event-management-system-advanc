import React, { createContext, useContext, useState, useEffect } from 'react';
import { CollegeEvent, Registration, User, UserRole, AttendanceStatus, RegistrationStatus } from '../types';
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_USERS } from '../data/mockData';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^(\+?[0-9]{1,3}[- ]?)?[0-9]{10}$/;
export const ROLL_NUMBER_REGEX = /^[a-zA-Z0-9\-_/]{3,20}$/;

// Secret authorization key required for creating new Admin accounts
export const ADMIN_SECRET_KEY = 'ADMIN@PRMCEAM2026';

interface EventContextType {
  currentUser: User | null;
  users: User[];
  events: CollegeEvent[];
  registrations: Registration[];
  login: (email: string, password: string, portalRole: UserRole) => { success: boolean; message: string };
  registerStudent: (data: {
    name: string;
    email: string;
    rollNumber: string;
    contactNumber?: string;
    department?: string;
    password: string;
  }) => { success: boolean; message: string };
  registerAdmin: (data: {
    name: string;
    email: string;
    department?: string;
    password: string;
    adminSecretKey: string;
  }) => { success: boolean; message: string };
  logout: () => void;
  createEvent: (eventData: {
    name: string;
    date: string;
    time: string;
    maxSeats: number;
    venue?: string;
    category?: 'Technical' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports';
    description?: string;
  }) => { success: boolean; message: string };
  deleteEvent: (eventId: string) => { success: boolean; message: string };
  registerForEvent: (eventId: string) => { success: boolean; message: string };
  joinWaitlist: (eventId: string) => { success: boolean; message: string };
  cancelRegistration: (registrationId: string) => { success: boolean; message: string };
  markAttendance: (registrationId: string, status: AttendanceStatus) => { success: boolean; message: string };
  getConfirmedRegistrations: (eventId: string) => Registration[];
  getWaitlistRegistrations: (eventId: string) => Registration[];
  getRemainingSeats: (eventId: string) => number;
  getWaitlistPosition: (eventId: string, studentId?: string) => number;
  isStudentConfirmed: (eventId: string, studentId?: string) => boolean;
  isStudentWaitlisted: (eventId: string, studentId?: string) => boolean;
}

const STORAGE_KEY_USERS = 'prmceam_users_v3';
const STORAGE_KEY_EVENTS = 'prmceam_events_v3';
const STORAGE_KEY_REGISTRATIONS = 'prmceam_registrations_v3';
const STORAGE_KEY_CURRENT_USER = 'prmceam_current_user_v3';

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Initialize events
  const [events, setEvents] = useState<CollegeEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  // Initialize registrations
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
      return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  });

  // Initialize current user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  // Strict Login Authorization
  const login = (email: string, password: string, portalRole: UserRole): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return {
        success: false,
        message: 'Invalid email format. Please enter a valid email (e.g. name@college.edu).',
      };
    }

    if (!password) {
      return {
        success: false,
        message: 'Password is required to log in.',
      };
    }

    const account = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!account) {
      return {
        success: false,
        message: `Account not found with email "${cleanEmail}". Please check your email or register.`,
      };
    }

    if (portalRole === 'admin' && account.role !== 'admin') {
      return {
        success: false,
        message: 'Access Denied: This account is registered as a Student. Only authorized Administrators can access this portal.',
      };
    }

    if (portalRole === 'student' && account.role !== 'student') {
      return {
        success: false,
        message: 'Access Denied: This is an Administrator account. Please use the Admin login portal.',
      };
    }

    if (account.password && account.password !== password) {
      return {
        success: false,
        message: 'Invalid credentials. The password you entered is incorrect.',
      };
    }

    setCurrentUser(account);
    return {
      success: true,
      message: `Welcome back, ${account.name}! Authenticated as ${account.role.toUpperCase()}.`,
    };
  };

  // Student Registration
  const registerStudent = (data: {
    name: string;
    email: string;
    rollNumber: string;
    contactNumber?: string;
    department?: string;
    password: string;
  }): { success: boolean; message: string } => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanRoll = data.rollNumber.trim().toUpperCase();
    const cleanContact = data.contactNumber ? data.contactNumber.trim() : '';

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please enter a valid full name (at least 2 characters).' };
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, message: 'Invalid email format. Please provide a valid email (e.g. student@college.edu).' };
    }

    if (!cleanRoll || !ROLL_NUMBER_REGEX.test(cleanRoll)) {
      return {
        success: false,
        message: 'Invalid Roll Number format. Use alphanumeric characters and hyphens (e.g. CS-2024-042).',
      };
    }

    if (cleanContact && !PHONE_REGEX.test(cleanContact)) {
      return {
        success: false,
        message: 'Invalid phone number format. Please provide a 10-digit mobile number.',
      };
    }

    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: `An account is already registered with email "${cleanEmail}". Please log in.`,
      };
    }

    const existingRoll = users.find((u) => u.rollNumber?.toUpperCase() === cleanRoll);
    if (existingRoll) {
      return {
        success: false,
        message: `Roll Number "${cleanRoll}" is already registered by another student.`,
      };
    }

    const newStudent: User = {
      id: `usr-std-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'student',
      rollNumber: cleanRoll,
      contactNumber: cleanContact || undefined,
      department: data.department?.trim() || 'Engineering',
      password: data.password,
    };

    setUsers((prev) => [...prev, newStudent]);
    setCurrentUser(newStudent);

    return {
      success: true,
      message: `Registration successful! Welcome to the student portal, ${cleanName}.`,
    };
  };

  // Admin Registration
  const registerAdmin = (data: {
    name: string;
    email: string;
    department?: string;
    password: string;
    adminSecretKey: string;
  }): { success: boolean; message: string } => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please enter a valid administrator name.' };
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, message: 'Invalid email format. Please provide a valid email (e.g. admin@college.edu).' };
    }

    if (data.adminSecretKey.trim() !== ADMIN_SECRET_KEY) {
      return {
        success: false,
        message: 'Invalid Admin Authorization Secret Key. Contact college administration for the key.',
      };
    }

    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: `An account is already registered with email "${cleanEmail}". Please log in.`,
      };
    }

    const newAdmin: User = {
      id: `usr-adm-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'admin',
      department: data.department?.trim() || 'College Administration',
      password: data.password,
    };

    setUsers((prev) => [...prev, newAdmin]);
    setCurrentUser(newAdmin);

    return {
      success: true,
      message: `Admin account created successfully! Welcome, ${cleanName}.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Remaining seats calculation (only confirmed registrations reduce seat count)
  const getRemainingSeats = (eventId: string): number => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return 0;
    const confirmedCount = registrations.filter(
      (r) => r.eventId === eventId && r.status === 'confirmed'
    ).length;
    const remaining = event.maxSeats - confirmedCount;
    return remaining > 0 ? remaining : 0;
  };

  // Get confirmed attendees for an event
  const getConfirmedRegistrations = (eventId: string): Registration[] => {
    return registrations.filter((r) => r.eventId === eventId && r.status === 'confirmed');
  };

  // Get waitlist queue sorted strictly in FIFO order (earliest registeredAt first)
  const getWaitlistRegistrations = (eventId: string): Registration[] => {
    return registrations
      .filter((r) => r.eventId === eventId && r.status === 'waitlisted')
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
  };

  // Get student position on waitlist (#1, #2, etc.)
  const getWaitlistPosition = (eventId: string, studentId?: string): number => {
    const targetStudentId = studentId || currentUser?.id;
    if (!targetStudentId) return 0;
    const waitlist = getWaitlistRegistrations(eventId);
    const index = waitlist.findIndex((r) => r.studentId === targetStudentId);
    return index !== -1 ? index + 1 : 0;
  };

  // Check if student has a confirmed seat
  const isStudentConfirmed = (eventId: string, studentId?: string): boolean => {
    const targetStudentId = studentId || currentUser?.id;
    if (!targetStudentId) return false;
    return registrations.some(
      (r) => r.eventId === eventId && r.studentId === targetStudentId && r.status === 'confirmed'
    );
  };

  // Check if student is on the waiting list
  const isStudentWaitlisted = (eventId: string, studentId?: string): boolean => {
    const targetStudentId = studentId || currentUser?.id;
    if (!targetStudentId) return false;
    return registrations.some(
      (r) => r.eventId === eventId && r.studentId === targetStudentId && r.status === 'waitlisted'
    );
  };

  // Admin: Create Event
  const createEvent = (eventData: {
    name: string;
    date: string;
    time: string;
    maxSeats: number;
    venue?: string;
    category?: 'Technical' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports';
    description?: string;
  }): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can create events.' };
    }

    if (!eventData.name.trim()) {
      return { success: false, message: 'Event name is required.' };
    }
    if (!eventData.date.trim()) {
      return { success: false, message: 'Event date is required.' };
    }
    if (!eventData.time.trim()) {
      return { success: false, message: 'Event time is required.' };
    }

    const capacityNum = Number(eventData.maxSeats);
    if (isNaN(capacityNum) || !Number.isInteger(capacityNum) || capacityNum < 1) {
      return {
        success: false,
        message: 'Invalid capacity. Maximum seats must be a positive whole number greater than 0.',
      };
    }

    if (capacityNum > 10000) {
      return {
        success: false,
        message: 'Maximum seat capacity cannot exceed 10,000.',
      };
    }

    const newEvent: CollegeEvent = {
      id: `evt-${Date.now()}`,
      name: eventData.name.trim(),
      date: eventData.date,
      time: eventData.time.trim(),
      maxSeats: capacityNum,
      venue: eventData.venue?.trim() || 'College Campus',
      category: eventData.category || 'Technical',
      description: eventData.description?.trim() || 'No description provided.',
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    return { success: true, message: `Event "${newEvent.name}" published with ${capacityNum} seats capacity.` };
  };

  // Admin: Delete Event
  const deleteEvent = (eventId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only admins can delete events.' };
    }

    const eventToDelete = events.find((e) => e.id === eventId);
    if (!eventToDelete) {
      return { success: false, message: 'Event not found.' };
    }

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));

    return {
      success: true,
      message: `Event "${eventToDelete.name}" and its registrations/waitlist records were deleted.`,
    };
  };

  // Student: Direct Registration (when seats available)
  const registerForEvent = (eventId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'student') {
      return { success: false, message: 'Please log in as a student to register for events.' };
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, message: 'Event not found.' };
    }

    // Edge Case: Check already confirmed
    if (isStudentConfirmed(eventId, currentUser.id)) {
      return {
        success: false,
        message: 'Duplicate Action: You already hold a confirmed seat for this event.',
      };
    }

    // Edge Case: Check already on waitlist
    if (isStudentWaitlisted(eventId, currentUser.id)) {
      return {
        success: false,
        message: 'You are already on the waiting list for this event.',
      };
    }

    // Check remaining seats
    const remainingSeats = getRemainingSeats(eventId);
    if (remainingSeats <= 0) {
      return {
        success: false,
        message: 'All seats are currently filled. Please join the waiting list to reserve your queue position.',
      };
    }

    const newRegistration: Registration = {
      id: `reg-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentRollNumber: currentUser.rollNumber,
      studentContact: currentUser.contactNumber,
      status: 'confirmed',
      attendance: 'unmarked',
      registeredAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [newRegistration, ...prev]);

    return {
      success: true,
      message: `Registration confirmed for "${event.name}"! 1 seat allocated.`,
    };
  };

  // Student: Join Waiting List (when event is full)
  const joinWaitlist = (eventId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'student') {
      return { success: false, message: 'Please log in as a student to join the waiting list.' };
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, message: 'Event not found.' };
    }

    // Edge Case 1: Student is already registered
    if (isStudentConfirmed(eventId, currentUser.id)) {
      return {
        success: false,
        message: 'Invalid Action: You already hold a confirmed registration for this event.',
      };
    }

    // Edge Case 2: Student is already on waitlist
    if (isStudentWaitlisted(eventId, currentUser.id)) {
      const position = getWaitlistPosition(eventId, currentUser.id);
      return {
        success: false,
        message: `You are already on the waiting list at Position #${position}.`,
      };
    }

    const remainingSeats = getRemainingSeats(eventId);
    if (remainingSeats > 0) {
      return {
        success: false,
        message: 'Seats are currently available! You can register directly without joining the waitlist.',
      };
    }

    // Calculate next queue position
    const currentWaitlist = getWaitlistRegistrations(eventId);
    const newPosition = currentWaitlist.length + 1;

    const newWaitlistEntry: Registration = {
      id: `reg-wait-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentRollNumber: currentUser.rollNumber,
      studentContact: currentUser.contactNumber,
      status: 'waitlisted',
      attendance: 'unmarked',
      registeredAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [...prev, newWaitlistEntry]);

    return {
      success: true,
      message: `Added to waiting list for "${event.name}" at Queue Position #${newPosition}. If a confirmed seat opens up, you will be promoted automatically!`,
    };
  };

  // Student/Admin: Cancel Registration with Automatic FIFO Waitlist Promotion
  const cancelRegistration = (registrationId: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to cancel a registration.' };
    }

    const targetReg = registrations.find((r) => r.id === registrationId);
    if (!targetReg) {
      return { success: false, message: 'Registration record not found.' };
    }

    if (currentUser.role !== 'admin' && targetReg.studentId !== currentUser.id) {
      return { success: false, message: 'Unauthorized action.' };
    }

    // CASE 1: Student is cancelling a waitlist position
    if (targetReg.status === 'waitlisted') {
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      return {
        success: true,
        message: `You have left the waiting list for "${targetReg.eventName}".`,
      };
    }

    // CASE 2: Student/Admin cancels a confirmed registration
    // Check if there is someone in the FIFO waitlist for this event
    const waitlist = registrations
      .filter((r) => r.eventId === targetReg.eventId && r.status === 'waitlisted' && r.id !== registrationId)
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());

    if (waitlist.length > 0) {
      // First student in queue is promoted to confirmed status!
      const firstInLine = waitlist[0];

      setRegistrations((prev) =>
        prev
          .filter((r) => r.id !== registrationId)
          .map((r) => {
            if (r.id === firstInLine.id) {
              return {
                ...r,
                status: 'confirmed',
                promotedAt: new Date().toISOString(),
              };
            }
            return r;
          })
      );

      return {
        success: true,
        message: `Registration for "${targetReg.eventName}" cancelled. Available seat was immediately offered and confirmed to waitlisted student ${firstInLine.studentName} (Queue #1)!`,
      };
    } else {
      // No one waiting, 1 seat returns to the general pool
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      return {
        success: true,
        message: `Registration for "${targetReg.eventName}" cancelled. 1 seat has been returned to the available capacity pool.`,
      };
    }
  };

  // Admin: Mark Attendance (Attended / Absent / Unmarked)
  const markAttendance = (registrationId: string, status: AttendanceStatus): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can record student attendance.' };
    }

    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) {
      return { success: false, message: 'Registration not found.' };
    }

    if (reg.status !== 'confirmed') {
      return { success: false, message: 'Attendance can only be recorded for confirmed attendees.' };
    }

    setRegistrations((prev) =>
      prev.map((r) => (r.id === registrationId ? { ...r, attendance: status } : r))
    );

    const statusLabel =
      status === 'attended' ? 'Attended' : status === 'absent' ? 'Absent' : 'Unmarked';

    return {
      success: true,
      message: `Marked ${reg.studentName} as ${statusLabel}.`,
    };
  };

  return (
    <EventContext.Provider
      value={{
        currentUser,
        users,
        events,
        registrations,
        login,
        registerStudent,
        registerAdmin,
        logout,
        createEvent,
        deleteEvent,
        registerForEvent,
        joinWaitlist,
        cancelRegistration,
        markAttendance,
        getConfirmedRegistrations,
        getWaitlistRegistrations,
        getRemainingSeats,
        getWaitlistPosition,
        isStudentConfirmed,
        isStudentWaitlisted,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
