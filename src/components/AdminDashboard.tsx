import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { CollegeEvent } from '../types';
import { AttendeeModal } from './AttendeeModal';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Clock4,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onShowToast }) => {
  const { 
    events, 
    registrations, 
    createEvent, 
    deleteEvent, 
    getRemainingSeats, 
    getConfirmedRegistrations,
    getWaitlistRegistrations,
    currentUser 
  } = useEventContext();

  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<CollegeEvent | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxSeats, setMaxSeats] = useState<string>('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState<'Technical' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports'>('Technical');
  const [description, setDescription] = useState('');

  // Handle Event Creation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('error', 'Event Name is required.');
      return;
    }
    if (!date) {
      onShowToast('error', 'Event Date is required.');
      return;
    }
    if (!time.trim()) {
      onShowToast('error', 'Event Time is required.');
      return;
    }

    const capacityNum = Number(maxSeats);
    if (!maxSeats || isNaN(capacityNum) || !Number.isInteger(capacityNum) || capacityNum <= 0) {
      onShowToast('error', 'Please enter a valid Maximum Capacity as a positive integer (e.g. 50).');
      return;
    }

    const res = createEvent({
      name: name.trim(),
      date,
      time: time.trim(),
      maxSeats: capacityNum,
      venue: venue.trim() || undefined,
      category,
      description: description.trim() || undefined,
    });

    if (res.success) {
      onShowToast('success', res.message);
      setName('');
      setDate('');
      setTime('');
      setMaxSeats('');
      setVenue('');
      setDescription('');
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleDelete = (event: CollegeEvent) => {
    if (window.confirm(`Are you sure you want to delete "${event.name}"? This will also remove any registered attendee and waitlist records.`)) {
      const res = deleteEvent(event.id);
      if (res.success) {
        onShowToast('info', res.message);
      } else {
        onShowToast('error', res.message);
      }
    }
  };

  // Total stats calculations
  const totalConfirmed = registrations.filter((r) => r.status === 'confirmed').length;
  const totalWaitlisted = registrations.filter((r) => r.status === 'waitlisted').length;
  const totalAttended = registrations.filter((r) => r.attendance === 'attended').length;
  const totalRemainingSeats = events.reduce((sum, e) => sum + getRemainingSeats(e.id), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Overview Header */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Admin Portal
            </span>
            <span className="text-xs text-zinc-500">Event & Attendance Management</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
            Welcome, {currentUser?.name || 'Administrator'}
          </h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            Post campus events, supervise automated FIFO waiting lists, and record student attendance.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center min-w-[85px]">
            <span className="text-[11px] text-zinc-500 font-medium block">Total Events</span>
            <span className="text-lg font-bold text-zinc-900">{events.length}</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center min-w-[85px]">
            <span className="text-[11px] text-indigo-700 font-medium block">Confirmed</span>
            <span className="text-lg font-bold text-indigo-900">{totalConfirmed}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center min-w-[85px]">
            <span className="text-[11px] text-amber-700 font-medium block">Waitlisted</span>
            <span className="text-lg font-bold text-amber-900">{totalWaitlisted}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center min-w-[85px]">
            <span className="text-[11px] text-emerald-700 font-medium block">Attended</span>
            <span className="text-lg font-bold text-emerald-900">{totalAttended}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Create Event Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-zinc-900">Post New Event</h2>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Fields with * are required</span>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Technical Symposium 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Event Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:30 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Max Capacity (Seats) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 50"
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Waitlist activates when 0 seats remain</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                >
                  <option value="Technical">Technical</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Venue / Hall Location
              </label>
              <input
                type="text"
                placeholder="e.g. Seminar Hall B, Campus Block 2"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Event Description
              </label>
              <textarea
                rows={2}
                placeholder="Brief information for students..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Event to Portal</span>
            </button>
          </form>
        </div>

        {/* Right: Active Events & Registration Management */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-zinc-700" />
              <h2 className="text-base font-bold text-zinc-900">
                Active Events & Attendee Management ({events.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              Live capacity & FIFO queue
            </span>
          </div>

          {events.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
              <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-700">No events posted yet</p>
              <p className="text-xs text-zinc-400 mt-1">
                Use the form on the left to publish your first college event.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {events.map((event) => {
                const confirmedAttendees = getConfirmedRegistrations(event.id);
                const waitlist = getWaitlistRegistrations(event.id);
                const remaining = getRemainingSeats(event.id);
                const percentFilled = Math.min(100, Math.round((confirmedAttendees.length / event.maxSeats) * 100));
                const isFull = remaining === 0;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {event.category || 'General'}
                          </span>

                          {isFull ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              House Full (0 seats)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {remaining} {remaining === 1 ? 'seat' : 'seats'} available
                            </span>
                          )}

                          {waitlist.length > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock4 className="w-3 h-3 text-amber-700" />
                              {waitlist.length} waitlisted
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 mt-1.5">{event.name}</h3>
                      </div>

                      <button
                        onClick={() => handleDelete(event)}
                        title="Delete event"
                        className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {event.time}
                      </span>
                      {event.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          {event.venue}
                        </span>
                      )}
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600">
                          Capacity:{' '}
                          <span className="font-semibold text-zinc-900">
                            {confirmedAttendees.length} / {event.maxSeats} confirmed seats
                          </span>
                        </span>
                        <span className="font-mono text-zinc-500 font-semibold">
                          {percentFilled}% full
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFull
                              ? 'bg-rose-500'
                              : percentFilled > 75
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className="text-xs text-zinc-500">
                        Created by: {event.createdBy}
                      </span>
                      <button
                        onClick={() => setSelectedEventForAttendees(event)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-indigo-200"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>
                          Manage Attendance ({confirmedAttendees.length}) & Waitlist ({waitlist.length})
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Attendee & Waitlist Management Modal */}
      {selectedEventForAttendees && (
        <AttendeeModal
          event={selectedEventForAttendees}
          onClose={() => setSelectedEventForAttendees(null)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
