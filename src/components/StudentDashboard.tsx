import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Ticket, 
  Check, 
  Clock4, 
  Filter, 
  UserCheck, 
  Hourglass, 
  Sparkles,
  QrCode,
  Printer,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface StudentDashboardProps {
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onShowToast }) => {
  const { 
    currentUser, 
    events, 
    registrations, 
    registerForEvent, 
    joinWaitlist, 
    cancelRegistration, 
    getRemainingSeats, 
    getConfirmedRegistrations, 
    getWaitlistRegistrations, 
    getWaitlistPosition, 
    isStudentConfirmed, 
    isStudentWaitlisted 
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<'all' | 'my-events'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Student specific registrations
  const studentConfirmedPasses = registrations.filter(
    (r) => r.studentId === currentUser?.id && r.status === 'confirmed'
  );

  const studentWaitlistEntries = registrations.filter(
    (r) => r.studentId === currentUser?.id && r.status === 'waitlisted'
  );

  // Filtered upcoming events
  const filteredEvents = events.filter((evt) => {
    const matchesQuery = 
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.category && evt.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;

    const remaining = getRemainingSeats(evt.id);
    const matchesAvailability = !onlyAvailable || remaining > 0;

    return matchesQuery && matchesCategory && matchesAvailability;
  });

  const handleRegister = (eventId: string, eventName: string) => {
    const res = registerForEvent(eventId);
    if (res.success) {
      onShowToast('success', res.message);
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleJoinWaitlist = (eventId: string, eventName: string) => {
    const res = joinWaitlist(eventId);
    if (res.success) {
      onShowToast('success', res.message);
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleCancel = (registrationId: string, eventName: string, isWaitlist: boolean) => {
    const confirmMessage = isWaitlist
      ? `Leave the waiting list for "${eventName}"?`
      : `Cancel your confirmed seat for "${eventName}"? The next student on the waiting list will be promoted immediately!`;

    if (window.confirm(confirmMessage)) {
      const res = cancelRegistration(registrationId);
      if (res.success) {
        onShowToast('info', res.message);
      } else {
        onShowToast('error', res.message);
      }
    }
  };

  const handlePrintPass = (eventName: string) => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-white via-indigo-50/30 to-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-600 text-white shadow-2xs">
              Student Workspace
            </span>
            <span className="text-xs text-zinc-500 font-mono font-bold bg-zinc-100 px-2.5 py-1 rounded-full">
              Roll No: {currentUser?.rollNumber || 'Not specified'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-2">
            Welcome, {currentUser?.name || 'Student'}
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed">
            Discover upcoming college events, check real-time seat capacities, and take advantage of our automated FIFO waiting list.
          </p>
        </div>

        {/* Status Metrics Cards */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-indigo-200/80 rounded-2xl p-4 text-center min-w-[120px] shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-1.5">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-500 block">Confirmed Passes</span>
            <span className="text-2xl font-black text-indigo-900">{studentConfirmedPasses.length}</span>
          </div>

          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 text-center min-w-[120px] shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1.5">
              <Clock4 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-500 block">Waitlist Entries</span>
            <span className="text-2xl font-black text-amber-900">{studentWaitlistEntries.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Navigation Tabs */}
          <div className="inline-flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Available Events ({events.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('my-events')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'my-events'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My Passes & Waitlist ({studentConfirmedPasses.length + studentWaitlistEntries.length})</span>
            </button>
          </div>

          {/* Search Box & Availability Filter */}
          {activeTab === 'all' && (
            <div className="flex items-center gap-3">
              <label className="hidden md:flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-zinc-200">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Available Seats Only</span>
              </label>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events, venue, topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-2xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        {activeTab === 'all' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-400 font-bold flex items-center gap-1 shrink-0 text-[11px]">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {['All', 'Technical', 'Workshop', 'Seminar', 'Cultural', 'Sports'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: ALL AVAILABLE EVENTS */}
      {activeTab === 'all' && (
        <div>
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-zinc-200 shadow-sm">
              <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-base font-bold text-zinc-800">No events found matching your criteria</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Try selecting "All" categories, clearing your search query, or unchecking "Available Seats Only".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const remaining = getRemainingSeats(event.id);
                const isConfirmed = isStudentConfirmed(event.id);
                const isWaitlisted = isStudentWaitlisted(event.id);
                const waitlistPosition = getWaitlistPosition(event.id);
                const isFull = remaining === 0;
                const confirmedAttendees = getConfirmedRegistrations(event.id);
                const waitlist = getWaitlistRegistrations(event.id);
                const percentFilled = Math.min(100, Math.round((confirmedAttendees.length / event.maxSeats) * 100));

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      isConfirmed
                        ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                        : isWaitlisted
                        ? 'border-amber-300 ring-2 ring-amber-500/10'
                        : isFull
                        ? 'border-zinc-200 bg-zinc-50/50'
                        : 'border-zinc-200 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                          {event.category || 'General'}
                        </span>

                        {isConfirmed ? (
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Confirmed Pass
                          </span>
                        ) : isWaitlisted ? (
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                            <Clock4 className="w-3 h-3 text-amber-700" />
                            Waitlist #{waitlistPosition}
                          </span>
                        ) : isFull ? (
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Full • Waitlist Active
                          </span>
                        ) : remaining <= 3 ? (
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            Only {remaining} {remaining === 1 ? 'seat' : 'seats'} left!
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            {remaining} seats open
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-zinc-900 leading-snug">
                        {event.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Event Logistics */}
                      <div className="mt-4 pt-3.5 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="font-semibold text-zinc-800">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Live Seat & Waitlist Bar */}
                      <div className="mt-4 space-y-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-semibold">Seat Status:</span>
                          <span
                            className={`font-mono font-bold ${
                              isFull ? 'text-rose-600' : 'text-zinc-900'
                            }`}
                          >
                            {confirmedAttendees.length} / {event.maxSeats} confirmed
                          </span>
                        </div>

                        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isFull
                                ? 'bg-rose-500'
                                : percentFilled > 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>

                        {waitlist.length > 0 && (
                          <div className="flex items-center justify-between text-[11px] pt-1 text-amber-800 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock4 className="w-3 h-3 text-amber-600" /> Waiting List Queue:
                            </span>
                            <span className="font-bold">{waitlist.length} student{waitlist.length === 1 ? '' : 's'} waiting</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-3.5 border-t border-zinc-100">
                      {isConfirmed ? (
                        <button
                          disabled
                          className="w-full py-3 px-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default shadow-2xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Admission Pass Confirmed</span>
                        </button>
                      ) : isWaitlisted ? (
                        <button
                          disabled
                          className="w-full py-3 px-4 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default shadow-2xs"
                        >
                          <Hourglass className="w-4 h-4 text-amber-600" />
                          <span>Waitlist Queue Position #{waitlistPosition}</span>
                        </button>
                      ) : isFull ? (
                        <button
                          onClick={() => handleJoinWaitlist(event.id, event.name)}
                          className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Clock4 className="w-4 h-4" />
                          <span>Join Waiting List (Position #{waitlist.length + 1})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id, event.name)}
                          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>Register for Event</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MY PASSES & WAITLIST STATUS */}
      {activeTab === 'my-events' && (
        <div className="space-y-10">
          {/* Confirmed Passes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>My Confirmed Passes ({studentConfirmedPasses.length})</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Confirmed event admissions reserved for {currentUser?.name}
                </p>
              </div>
            </div>

            {studentConfirmedPasses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
                <Ticket className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-700">No confirmed passes yet</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Browse the Available Events tab to register and claim your admission passes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentConfirmedPasses.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    {/* Ticket Header */}
                    <div className="p-6 bg-gradient-to-br from-indigo-900 to-zinc-900 text-white relative">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs">
                          PASS #{reg.id.slice(-8).toUpperCase()}
                        </span>

                        {reg.attendance === 'attended' ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3" /> Attended
                          </span>
                        ) : reg.attendance === 'absent' ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white">
                            Marked Absent
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/90 text-zinc-950 font-sans shadow-xs">
                            Confirmed Seat ✓
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-extrabold mt-3 tracking-tight">{reg.eventName}</h3>

                      {reg.promotedAt && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-amber-200 bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-400/30">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Promoted automatically from FIFO Waiting List</span>
                        </div>
                      )}
                    </div>

                    {/* Ticket Details */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold text-zinc-800">{reg.eventDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{reg.eventTime}</span>
                        </div>
                        {reg.eventVenue && (
                          <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-zinc-200/50">
                            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="truncate">{reg.eventVenue}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-zinc-400 text-[11px]">
                          Issued on: {new Date(reg.registeredAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePrintPass(reg.eventName)}
                            className="text-xs text-zinc-600 hover:text-zinc-900 font-bold px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-1"
                            title="Print Admission Pass"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>

                          <button
                            onClick={() => handleCancel(reg.id, reg.eventName, false)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            Cancel Seat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Waiting List Queue Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Clock4 className="w-5 h-5 text-amber-600" />
                  <span>My Active Waiting List Status ({studentWaitlistEntries.length})</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Real-time queue tracking. When confirmed seats open up, promotions occur in first-come, first-served order.
                </p>
              </div>
            </div>

            {studentWaitlistEntries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
                <Clock4 className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-700">No active waitlist entries</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  When an event is fully booked, you can join the waiting list from the Available Events tab.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentWaitlistEntries.map((waitReg) => {
                  const currentPos = getWaitlistPosition(waitReg.eventId);
                  const isNext = currentPos === 1;

                  return (
                    <div
                      key={waitReg.id}
                      className="bg-white rounded-3xl p-6 border border-amber-300/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                            QUEUE #{waitReg.id.slice(-8).toUpperCase()}
                          </span>

                          <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                            isNext
                              ? 'bg-amber-500 text-zinc-950 border-amber-400 font-mono shadow-xs ring-2 ring-amber-400/40'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            Position #{currentPos} {isNext ? '• Next in Line!' : ''}
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-zinc-900 mt-3">{waitReg.eventName}</h3>

                        {/* Visual Queue Tracker Step Bar */}
                        <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold text-amber-950">
                            <span>Queue Progress:</span>
                            <span>{isNext ? 'Next Candidate to be Promoted' : `${currentPos - 1} ahead of you`}</span>
                          </div>

                          <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-600 transition-all duration-300"
                              style={{ width: `${Math.max(25, 100 - (currentPos - 1) * 25)}%` }}
                            />
                          </div>

                          <p className="text-[11px] text-amber-900 leading-relaxed pt-1">
                            {isNext ? (
                              <strong className="flex items-center gap-1.5 text-amber-950">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                You are #1 in line! As soon as any confirmed attendee cancels, your pass will be confirmed automatically.
                              </strong>
                            ) : (
                              <span>
                                As students ahead of you cancel or receive tickets, you will automatically advance towards Position #1.
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{waitReg.eventDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{waitReg.eventTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 text-[11px]">
                          Joined: {new Date(waitReg.registeredAt).toLocaleDateString()}
                        </span>

                        <button
                          onClick={() => handleCancel(waitReg.id, waitReg.eventName, true)}
                          className="text-xs text-zinc-500 hover:text-rose-600 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Leave Waiting List
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
