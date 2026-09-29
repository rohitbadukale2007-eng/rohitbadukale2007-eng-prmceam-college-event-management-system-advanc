import React, { useState } from 'react';
import { useEventContext, EMAIL_REGEX, PHONE_REGEX, ROLL_NUMBER_REGEX } from '../context/EventContext';
import { UserRole } from '../types';
import { 
  Shield, 
  GraduationCap, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Lock, 
  Mail, 
  Phone, 
  Hash, 
  Building2, 
  User, 
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthViewProps {
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onShowToast }) => {
  const { login, registerStudent, registerAdmin } = useEventContext();

  const [activePortal, setActivePortal] = useState<UserRole>('student');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form fields
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  // Inline format error state
  const [emailFormatError, setEmailFormatError] = useState('');
  const [rollFormatError, setRollFormatError] = useState('');
  const [phoneFormatError, setPhoneFormatError] = useState('');

  // Real-time email validation
  const handleEmailChange = (val: string, isRegister: boolean) => {
    if (isRegister) {
      setRegisterEmail(val);
    } else {
      setLoginEmail(val);
    }

    if (val.trim() && !EMAIL_REGEX.test(val.trim())) {
      setEmailFormatError('Please enter a valid email format (e.g., student@college.edu)');
    } else {
      setEmailFormatError('');
    }
  };

  // Real-time roll number validation
  const handleRollChange = (val: string) => {
    setRollNumber(val);
    if (val.trim() && !ROLL_NUMBER_REGEX.test(val.trim())) {
      setRollFormatError('Roll number should be 3-20 letters/digits/hyphens (e.g., CS-2024-042)');
    } else {
      setRollFormatError('');
    }
  };

  // Real-time phone validation
  const handlePhoneChange = (val: string) => {
    setContactNumber(val);
    if (val.trim() && !PHONE_REGEX.test(val.trim())) {
      setPhoneFormatError('Please enter a valid 10-digit contact number');
    } else {
      setPhoneFormatError('');
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail.trim()) {
      onShowToast('error', 'Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(loginEmail.trim())) {
      onShowToast('error', 'Invalid email address format.');
      return;
    }

    if (!loginPassword) {
      onShowToast('error', 'Please enter your password.');
      return;
    }

    const res = login(loginEmail, loginPassword, activePortal);
    if (res.success) {
      onShowToast('success', res.message);
    } else {
      onShowToast('error', res.message);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('error', 'Full Name is required.');
      return;
    }

    if (!EMAIL_REGEX.test(registerEmail.trim())) {
      onShowToast('error', 'Please enter a valid email address (e.g., user@college.edu).');
      return;
    }

    if (activePortal === 'student') {
      if (!rollNumber.trim() || !ROLL_NUMBER_REGEX.test(rollNumber.trim())) {
        onShowToast('error', 'Valid student Roll Number is required (e.g. CS-2024-042).');
        return;
      }

      if (contactNumber.trim() && !PHONE_REGEX.test(contactNumber.trim())) {
        onShowToast('error', 'Please enter a valid 10-digit mobile number.');
        return;
      }

      if (!registerPassword || registerPassword.length < 4) {
        onShowToast('error', 'Password must be at least 4 characters long.');
        return;
      }

      const res = registerStudent({
        name: name.trim(),
        email: registerEmail.trim(),
        rollNumber: rollNumber.trim(),
        contactNumber: contactNumber.trim() || undefined,
        department: department.trim() || undefined,
        password: registerPassword,
      });

      if (res.success) {
        onShowToast('success', res.message);
      } else {
        onShowToast('error', res.message);
      }
    } else {
      if (!adminSecretKey.trim()) {
        onShowToast('error', 'Admin Authorization Secret Key is required to create an admin account.');
        return;
      }

      if (!registerPassword || registerPassword.length < 4) {
        onShowToast('error', 'Password must be at least 4 characters long.');
        return;
      }

      const res = registerAdmin({
        name: name.trim(),
        email: registerEmail.trim(),
        department: department.trim() || undefined,
        password: registerPassword,
        adminSecretKey: adminSecretKey.trim(),
      });

      if (res.success) {
        onShowToast('success', res.message);
      } else {
        onShowToast('error', res.message);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-zinc-50 via-zinc-100/50 to-zinc-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden transition-all">
        {/* Top Header Card */}
        <div className={`p-8 text-white text-center transition-all ${
          activePortal === 'student' 
            ? 'bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900' 
            : 'bg-gradient-to-br from-zinc-900 via-amber-950 to-zinc-900'
        }`}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mb-3 ring-1 ring-white/20 shadow-inner">
            {activePortal === 'student' ? (
              <GraduationCap className="w-6 h-6 text-indigo-300" />
            ) : (
              <Shield className="w-6 h-6 text-amber-300" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">PRMCEAM Event Portal</h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Campus Event Registration &bull; Waitlist Queue &bull; Attendance
          </p>

          {/* Portal Switcher */}
          <div className="grid grid-cols-2 gap-2 mt-6 p-1 bg-black/30 rounded-2xl border border-white/10 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setActivePortal('student');
                setEmailFormatError('');
                setRollFormatError('');
                setPhoneFormatError('');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activePortal === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('admin');
                setEmailFormatError('');
                setRollFormatError('');
                setPhoneFormatError('');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activePortal === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Mode Selector (Login vs Register) */}
        <div className="px-6 pt-5 pb-3 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
              {activePortal === 'student' ? 'Student Workspace' : 'Administrative Workspace'}
            </span>
            <h2 className="text-base font-extrabold text-zinc-900">
              {mode === 'login' ? 'Account Login' : 'Create New Account'}
            </h2>
          </div>

          <div className="inline-flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/80">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="px-6 pt-3">
          {activePortal === 'admin' ? (
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold">Admin Portal:</strong> Only faculty and authorized event coordinators can access this area. Students must sign in via the Student Portal.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold">Student Portal:</strong> Check live seat limits, reserve passes, and join the automated FIFO waiting list when events are full.
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  {activePortal === 'admin' ? 'Admin Email Address' : 'Student College Email'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={
                      activePortal === 'admin' ? 'admin@college.edu' : 'student@college.edu'
                    }
                    value={loginEmail}
                    onChange={(e) => handleEmailChange(e.target.value, false)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
                  />
                </div>
                {emailFormatError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{emailFormatError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Account Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                  activePortal === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.99]'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
                }`}
              >
                <span>Log In to {activePortal === 'admin' ? 'Admin Portal' : 'Student Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  College Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@college.edu"
                    value={registerEmail}
                    onChange={(e) => handleEmailChange(e.target.value, true)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
                  />
                </div>
                {emailFormatError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{emailFormatError}</p>
                )}
              </div>

              {activePortal === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Roll Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="CS-2024-042"
                        value={rollNumber}
                        onChange={(e) => handleRollChange(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 uppercase shadow-2xs font-mono"
                      />
                    </div>
                    {rollFormatError && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold leading-tight">{rollFormatError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={contactNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 font-mono shadow-2xs"
                      />
                    </div>
                    {phoneFormatError && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold leading-tight">{phoneFormatError}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Department / Branch
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 4 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {activePortal === 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Admin Passkey <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Enter Admin Authorization Passkey"
                      value={adminSecretKey}
                      onChange={(e) => setAdminSecretKey(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Authorized administrative security key required to create an admin account.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                  activePortal === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.99]'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
                }`}
              >
                <span>Register {activePortal === 'admin' ? 'Admin' : 'Student'} Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
