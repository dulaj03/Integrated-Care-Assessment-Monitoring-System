import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Star, Building2, ChevronRight, CheckCircle, X, Calendar, Stethoscope, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  MOCK_HOSPITALS,
  Hospital,
  HospitalDoctor,
  getDoctorsByHospital,
} from '../../lib/hospitalData';
import { DoctorProfileModal } from '../../components/DoctorProfileModal';

interface ExtendedHospital extends Hospital {
  specialties?: string[];
}

interface ExtendedDoctor extends HospitalDoctor {
  full_name?: string;
  years_of_experience?: number;
}

const TIME_SLOTS = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

type BookingStep = 'browse' | 'select_doctor' | 'select_time' | 'confirm' | 'booked';

export function HospitalFinder() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'government' | 'private'>('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [step, setStep] = useState<BookingStep>('browse');
  const [selectedHospital, setSelectedHospital] = useState<ExtendedHospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<ExtendedDoctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileDoctor, setSelectedProfileDoctor] = useState<ExtendedDoctor | null>(null);

  const [dbHospitals, setDbHospitals] = useState<ExtendedHospital[]>([]);
  const [dbDoctors, setDbDoctors] = useState<ExtendedDoctor[]>([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/hospitals');
      if (res.ok) {
        const data = await res.json();
        setDbHospitals(data);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchDoctorsForHospital = async (hospitalId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/hospitals/${hospitalId}/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDbDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const hospitalsToDisplay: ExtendedHospital[] = dbHospitals.length > 0 ? dbHospitals : (MOCK_HOSPITALS as ExtendedHospital[]);

  const allSpecs = Array.from(new Set(hospitalsToDisplay.flatMap(h => h.specialties || h.specializations || []))).sort();
  const allCities = Array.from(new Set(hospitalsToDisplay.map(h => h.city || h.address.split(',').pop()?.trim()))).sort();

  const filtered = hospitalsToDisplay.filter(h => {
    const name = h.name.toLowerCase();
    const address = h.address.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || address.includes(search.toLowerCase());

    const city = h.city || h.address.split(',').pop()?.trim();
    const matchCity = cityFilter === 'all' || city === cityFilter;

    const type = (h.type || 'private').toLowerCase();
    const matchType = typeFilter === 'all' || type === typeFilter;

    const specs = h.specialties || h.specializations || [];
    const matchSpec = specFilter === 'all' || specs.includes(specFilter);

    return matchSearch && matchCity && matchType && matchSpec;
  });

  const handleBook = (hospital: ExtendedHospital) => {
    setSelectedHospital(hospital);
    setStep('select_doctor');
    fetchDoctorsForHospital(hospital.id);
  };

  const handleSelectDoctor = (doctor: HospitalDoctor) => {
    setSelectedDoctor(doctor);
    setStep('select_time');
  };

  const handleConfirm = () => {
    setStep('confirm');
  };

  const handleFinalBook = async () => {
    const token = sessionStorage.getItem('token');
    if (!token || !selectedHospital || !selectedDoctor) return;

    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          hospital_id: selectedHospital.id,
          appointment_date: selectedDate,
          appointment_time: selectedSlot,
          reason: reason
        })
      });

      if (res.ok) {
        setStep('booked');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const resetFlow = () => {
    setStep('browse');
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setSelectedSlot('');
    setSelectedDate('');
    setReason('');
  };

  const handleViewProfile = (e: React.MouseEvent, doctor: ExtendedDoctor) => {
    e.stopPropagation();
    setSelectedProfileDoctor(doctor);
    setIsProfileModalOpen(true);
  };

  if (step === 'booked') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
            <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Appointment Booked!</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            Your appointment with <strong>{selectedDoctor?.full_name || selectedDoctor?.name}</strong> at <strong>{selectedHospital?.name}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong> has been confirmed.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">You will receive a confirmation message on your registered phone number.</p>
        </motion.div>
        <div className="flex gap-3">
          <button onClick={() => window.location.href = '/patient/appointments'}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            View My Appointments
          </button>
          <button onClick={resetFlow}
            className="px-6 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Find a Hospital</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Book doctor appointments at Sri Lankan hospitals
          </p>
        </div>
        {step !== 'browse' && (
          <button onClick={resetFlow} className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="h-4 w-4" /> Cancel Booking
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {['Browse Hospitals', 'Select Doctor', 'Choose Time', 'Confirm'].map((s, i) => {
          const stepMap: BookingStep[] = ['browse', 'select_doctor', 'select_time', 'confirm'];
          const isActive = step === stepMap[i];
          const isPast = ['browse', 'select_doctor', 'select_time', 'confirm'].indexOf(step) > i;
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
              <span className={isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : isPast ? 'text-green-600 dark:text-green-400' : ''}>
                {isPast ? <CheckCircle className="h-4 w-4 inline mr-1" /> : null}{s}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: Browse Hospitals ─── */}
        {step === 'browse' && (
          <motion.div key="browse" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            {/* Filters */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hospitals by name or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Cities</option>
                  {allCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | 'government' | 'private')}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Types</option>
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                </select>
                <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Specializations</option>
                  {allSpecs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Hospital Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((hospital, i) => (
                <motion.div key={hospital.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/40 transition-shadow">
                  {hospital.imageUrl && (
                    <img src={hospital.imageUrl} alt={hospital.name} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{hospital.name}</h3>
                        <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${hospital.type === 'private'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {hospital.type === 'private' ? 'Private' : 'Government'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{hospital.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                        <span>{hospital.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span>{hospital.phone}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(hospital.specialties || hospital.specializations || []).slice(0, 4).map((s: string) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{s}</span>
                      ))}
                      {(hospital.specialties || hospital.specializations || []).length > 4 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">+{(hospital.specialties || hospital.specializations || []).length - 4} more</span>
                      )}
                    </div>

                    <button onClick={() => handleBook(hospital)}
                      className="w-full py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" /> Book Appointment
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hospitals found</p>
                <p className="text-sm">Try adjusting your filters.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Step 2: Select Doctor ─── */}
        {step === 'select_doctor' && selectedHospital && (
          <motion.div key="doctor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedHospital.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedHospital.address}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Available Doctors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(dbDoctors.length > 0 ? dbDoctors : getDoctorsByHospital(selectedHospital.id)).map((doc: ExtendedDoctor) => (
                <motion.div key={doc.id} whileHover={{ scale: 1.01 }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <img src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`} alt={doc.full_name || doc.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{doc.full_name || doc.name}</h4>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{doc.specialization}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{(doc as any).avg_rating || 0} Rating · {(doc as any).review_count || 0} Reviews</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <Stethoscope className="h-3 w-3" /> {doc.years_of_experience || (doc as any).experience} yrs exp
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <Clock className="h-3 w-3" /> {(doc as any).availableDays?.join(', ') || 'Mon, Wed, Fri'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Rating</p>
                      <div className="flex items-center gap-1 font-bold text-amber-500 text-sm">
                        <Star className="h-4 w-4 fill-amber-500" />
                        {(doc as any).avg_rating || '0.0'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={(e) => handleViewProfile(e, doc)}
                      className="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      View Profile & Reviews
                    </button>
                    <button 
                      onClick={() => handleSelectDoctor(doc)}
                      className="flex-1 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Select Doctor →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            {getDoctorsByHospital(selectedHospital.id).length === 0 && (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">No doctors listed for this hospital yet.</p>
            )}
          </motion.div>
        )}

        {/* ─── Step 3: Select Time ─── */}
        {step === 'select_time' && selectedDoctor && (
          <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <img src={selectedDoctor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.id}`} alt={selectedDoctor.full_name || selectedDoctor.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{selectedDoctor.full_name || selectedDoctor.name}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{selectedDoctor.specialization} · {selectedHospital?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Appointment Date</label>
                <input type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available: {(selectedDoctor.availableDays || ['Mon', 'Wed', 'Fri']).join(', ')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reason for Visit</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Available Time Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-all ${selectedSlot === slot
                      ? 'bg-blue-600 text-white border-blue-600 font-medium'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-700'
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!selectedSlot || !selectedDate || !reason}
              onClick={handleConfirm}
              className="w-full py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Review Appointment →
            </button>
          </motion.div>
        )}

        {/* ─── Step 4: Confirm ─── */}
        {step === 'confirm' && selectedDoctor && selectedHospital && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-lg mx-auto space-y-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <h3 className="text-xl font-bold">Confirm Appointment</h3>
                <p className="text-blue-100 text-sm mt-1">Review your appointment details below</p>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: 'Hospital', value: selectedHospital.name },
                  { label: 'Doctor', value: selectedDoctor.full_name || selectedDoctor.name },
                  { label: 'Specialization', value: selectedDoctor.specialization },
                  { label: 'Date', value: selectedDate },
                  { label: 'Time', value: selectedSlot },
                  { label: 'Consultation Fee', value: `LKR ${(selectedDoctor.consultationFee || 2500).toLocaleString()}` },
                  { label: 'Reason', value: reason },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('select_time')}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                ← Back
              </button>
              <button onClick={handleFinalBook}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                Confirm Booking ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProfileDoctor && (
        <DoctorProfileModal
          isOpen={isProfileModalOpen}
          doctor={selectedProfileDoctor}
          onClose={() => setIsProfileModalOpen(false)}
          onReviewSubmitted={() => {
            if (selectedHospital) fetchDoctorsForHospital(selectedHospital.id);
          }}
        />
      )}
    </div>
  );
}
