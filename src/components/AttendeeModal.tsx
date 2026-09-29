import React, { useState } from 'react';
import { CollegeEvent, AttendanceStatus } from '../types';
import { useEventContext } from '../context/EventContext';
import { 
  X, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  UserCheck, 
  Clock4, 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Trash2,
  Sparkles,
  Search,
  CheckCheck,
  Copy
} from 'lucide-react';

interface AttendeeModalProps {
  event: CollegeEvent | null;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AttendeeModal: React.FC<AttendeeModalProps> = ({ event, onClose, onShowToast }) => {
  const { 
    getConfirmedRegistrations, 
    getWaitlistRegistrations, 
    getRemainingSeats, 
    markAttendance,
    cancelRegistration
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<'confirmed' | 'waitlist'>('confirmed');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attended' | 'absent' | 'unmarked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!event) return null;

  const confirmedList = getConfirmedRegistrations(event.id);
  const waitlist = getWaitlistRegistrations(event.id);
  const remainingSeats = getRemainingSeats(event.id);

  // Search and filter
  const filteredConfirmed = confirmedList.filter((att) => {
    const matchesFilter = attendanceFilter === 'all' || att.attendance === attendanceFilter;
    const matchesSearch = 
      att.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.studentRollNumber && att.studentRollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredWaitlist = waitlist.filter((waitEntry) => {
    return (
      waitEntry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      waitEntry.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (waitEntry.studentRollNumber && waitEntry.studentRollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const attendedCount = confirmedList.filter((a) => a.attendance === 'attended').length;
  const absentCount = confirmedList.filter((a) => a.attendance === 'absent').length;
  const unmarkedCount = confirmedList.filter((a) => a.attendance === 'unmarked').length;
  const attendanceRate = confirmedList.length > 0 ? Math.round((attendedCount / confirmedList.length) * 100) : 0;

  const handleAttendanceChange = (registrationId: string, status: AttendanceStatus) => {
    const res = markAttendance(registrationId, status);
    if (res.success) {
      onShowToast('success', res.message);
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleMarkAllAttended = () => {
    if (confirmedList.length === 0) return;
    confirmedList.forEach((att) => {
      markAttendance(att.id, 'attended');
    });
    onShowToast('success', `Marked all ${confirmedList.length} confirmed students as Attended.`);
  };

  const handleCopyRoster = () => {
    const lines = confirmedList.map(
      (a, i) => `${i + 1}. ${a.studentName} (${a.studentRollNumber || 'No Roll'}) - ${a.studentEmail} [Status: ${a.attendance.toUpperCase()}]`
    );
    const text = `Attendance Roster - ${event.name}\nDate: ${event.date} | Venue: ${event.venue || 'Campus'}\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text);
    onShowToast('info', 'Attendee roster copied to clipboard!');
  };

  const handleRemoveAttendee = (registrationId: string, studentName: string) => {
    if (window.confirm(`Remove ${studentName} from this event? If students are in the waiting list queue, the next student will be promoted automatically.`)) {
      const res = cancelRegistration(registrationId);
      if (res.success) {
        onShowToast('info', res.message);
      } else {
        onShowToast('error', res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {event.category || 'Event'}
              </span>
              <span className="text-xs text-zinc-500 font-mono">ID: {event.id}</span>
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 mt-1.5">{event.name}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 mt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {event.time}
              </span>
              {event.venue && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {event.venue}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="px-6 py-3.5 bg-zinc-100/70 border-b border-zinc-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 text-center shadow-2xs">
            <span className="text-zinc-500 block text-[11px] font-medium">Total Seats</span>
            <span className="font-extrabold text-zinc-900 text-base">{event.maxSeats}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 text-center shadow-2xs">
            <span className="text-zinc-500 block text-[11px] font-medium">Confirmed Seats</span>
            <span className="font-extrabold text-indigo-700 text-base">{confirmedList.length}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 text-center shadow-2xs">
            <span className="text-zinc-500 block text-[11px] font-medium">Remaining Seats</span>
            <span className={`font-extrabold text-base ${remainingSeats === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {remainingSeats}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 text-center shadow-2xs">
            <span className="text-zinc-500 block text-[11px] font-medium">Waitlist Queue</span>
            <span className="font-extrabold text-amber-700 text-base">{waitlist.length}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 text-center shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-zinc-500 block text-[11px] font-medium">Attendance Rate</span>
            <span className="font-extrabold text-emerald-700 text-base">{attendanceRate}%</span>
          </div>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="px-6 py-3 border-b border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          {/* Main Tabs */}
          <div className="inline-flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 shrink-0">
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`px-3.5 py-1.5 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'confirmed'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Confirmed Roster ({confirmedList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-3.5 py-1.5 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'waitlist'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Clock4 className="w-3.5 h-3.5" />
              <span>FIFO Waitlist ({waitlist.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, roll, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Tab 1: Confirmed Attendees with Attendance Controls */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'confirmed' && (
            <div className="space-y-4">
              {/* Quick Filters and Bulk Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 font-bold text-[11px]">Filter:</span>
                  <button
                    onClick={() => setAttendanceFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      attendanceFilter === 'all'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    All ({confirmedList.length})
                  </button>
                  <button
                    onClick={() => setAttendanceFilter('attended')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      attendanceFilter === 'attended'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Attended ({attendedCount})
                  </button>
                  <button
                    onClick={() => setAttendanceFilter('absent')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      attendanceFilter === 'absent'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    Absent ({absentCount})
                  </button>
                  <button
                    onClick={() => setAttendanceFilter('unmarked')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      attendanceFilter === 'unmarked'
                        ? 'bg-zinc-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    Unmarked ({unmarkedCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllAttended}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark All Attended</span>
                  </button>

                  <button
                    onClick={handleCopyRoster}
                    className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Roster</span>
                  </button>
                </div>
              </div>

              {filteredConfirmed.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl">
                  <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-zinc-600">No attendees match your query</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {confirmedList.length === 0
                      ? 'No students have confirmed seats yet.'
                      : 'Try clearing the search query or changing the attendance filter.'}
                  </p>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                        <th className="py-3 px-3.5">#</th>
                        <th className="py-3 px-3.5">Student Name</th>
                        <th className="py-3 px-3.5">Roll Number</th>
                        <th className="py-3 px-3.5">Email Address</th>
                        <th className="py-3 px-3.5 text-center">Mark Attendance</th>
                        <th className="py-3 px-3.5 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredConfirmed.map((att, index) => (
                        <tr key={att.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3 px-3.5 font-mono text-zinc-400 font-semibold">{index + 1}</td>
                          <td className="py-3 px-3.5">
                            <div className="font-extrabold text-zinc-900 flex items-center gap-1.5">
                              <span>{att.studentName}</span>
                              {att.promotedAt && (
                                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md font-bold" title="Promoted from waitlist">
                                  Promoted
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400">
                              Registered: {new Date(att.registeredAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-mono text-zinc-800 font-bold">{att.studentRollNumber || 'N/A'}</div>
                            {att.studentContact && (
                              <div className="text-[10px] text-zinc-500 font-mono">{att.studentContact}</div>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-zinc-600 font-mono">
                            {att.studentEmail}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleAttendanceChange(att.id, 'attended')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                                  att.attendance === 'attended'
                                    ? 'bg-emerald-600 text-white ring-1 ring-emerald-700'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                                title="Mark as Attended"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Attended</span>
                              </button>

                              <button
                                onClick={() => handleAttendanceChange(att.id, 'absent')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                                  att.attendance === 'absent'
                                    ? 'bg-rose-600 text-white ring-1 ring-rose-700'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                                title="Mark as Absent"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </button>

                              {att.attendance !== 'unmarked' && (
                                <button
                                  onClick={() => handleAttendanceChange(att.id, 'unmarked')}
                                  className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors"
                                  title="Reset to Unmarked"
                                >
                                  <MinusCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              onClick={() => handleRemoveAttendee(att.id, att.studentName)}
                              className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Cancel attendee (promotes waitlist queue)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Waiting List Queue in FIFO Order */}
          {activeTab === 'waitlist' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs text-amber-950 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock4 className="w-5 h-5 text-amber-700 shrink-0" />
                  <span className="leading-relaxed">
                    <strong>First-Come, First-Served (FIFO) Queue:</strong> Position #1 is guaranteed to receive the next available seat automatically as soon as any confirmed attendee cancels.
                  </span>
                </div>
              </div>

              {filteredWaitlist.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl">
                  <Clock4 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-zinc-600">Waiting list is empty</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    When the event reaches capacity, students who join the waitlist will appear here in exact queue order.
                  </p>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-amber-50/70 border-b border-amber-200 text-amber-950 font-bold">
                        <th className="py-3 px-3.5">Queue Rank</th>
                        <th className="py-3 px-3.5">Student Name</th>
                        <th className="py-3 px-3.5">Roll Number</th>
                        <th className="py-3 px-3.5">Email Address</th>
                        <th className="py-3 px-3.5">Joined Waitlist</th>
                        <th className="py-3 px-3.5 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredWaitlist.map((waitEntry, idx) => (
                        <tr key={waitEntry.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3 px-3.5">
                            <span className={`inline-flex items-center justify-center font-extrabold px-2.5 py-1 rounded-lg text-xs ${
                              idx === 0
                                ? 'bg-amber-500 text-zinc-950 font-mono shadow-xs ring-1 ring-amber-600/30'
                                : 'bg-zinc-100 text-zinc-700 font-mono'
                            }`}>
                              #{idx + 1} {idx === 0 ? '• Next in Line' : ''}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-extrabold text-zinc-900">
                            {waitEntry.studentName}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-zinc-700">
                            <div>{waitEntry.studentRollNumber || 'N/A'}</div>
                            {waitEntry.studentContact && (
                              <div className="text-[10px] text-zinc-400 font-mono">{waitEntry.studentContact}</div>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-zinc-600 font-mono">
                            {waitEntry.studentEmail}
                          </td>
                          <td className="py-3 px-3.5 text-zinc-500 font-medium">
                            {new Date(waitEntry.registeredAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              onClick={() => handleRemoveAttendee(waitEntry.id, waitEntry.studentName)}
                              className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Remove from waitlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-medium">
            Attendance and waitlist promotions synchronize in real-time across active student portals.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
