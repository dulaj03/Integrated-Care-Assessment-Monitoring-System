import { useState, useEffect } from 'react';
import { Search, Star, Stethoscope, ShieldCheck, MapPin, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DoctorProfileModal } from '../../components/DoctorProfileModal';

interface Doctor {
  id: string | number;
  full_name?: string;
  name?: string;
  specialization: string;
  hospital_names?: string[];
  avg_rating?: string | number;
  review_count?: string | number;
  years_of_experience?: number;
  avatar?: string;
  availableDays?: string[];
  experience?: number;
}

export function DoctorSearch() {
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctors');
      if (res.ok) {
        setDoctors(await res.json());
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const searchLower = search.toLowerCase();
    const name = (doc.full_name || doc.name || '').toLowerCase();
    const spec = (doc.specialization || '').toLowerCase();
    const hospitals = (doc.hospital_names || []).join(' ').toLowerCase();
    
    return name.includes(searchLower) || spec.includes(searchLower) || hospitals.includes(searchLower);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Find & Rate Doctors</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Search across all associated hospitals and view patient clinical reviews.</p>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by doctor name, specialization, or hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-lg font-medium shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Searching Clinical Roster...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDoctors.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border-2 border-slate-50 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 transition-all group relative overflow-hidden flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <img 
                      src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`} 
                      alt={doc.full_name || doc.name}
                      className="h-20 w-20 rounded-[1.75rem] object-cover bg-blue-50 dark:bg-blue-900/20 p-1 border-2 border-blue-100 dark:border-blue-800"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-2xl border border-amber-100 dark:border-amber-800">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-black text-amber-700 dark:text-amber-300">{doc.avg_rating || '0.0'}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{doc.review_count || 0} REVIEWS</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{doc.full_name || doc.name}</h4>
                    <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs mt-1">{doc.specialization}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Stethoscope className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">{doc.years_of_experience || doc.experience || 0} Years Experience</span>
                    </div>
                    {(doc.hospital_names || []).map((h) => (
                      <div key={h} className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-bold truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => { setSelectedDoctor(doc); setIsModalOpen(true); }}
                  className="mt-8 w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
                >
                  View Profile & Reviews
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/20 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
          <Stethoscope className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No doctors found</h3>
          <p className="text-slate-500 font-medium">Try searching by a different name or specialization.</p>
        </div>
      )}

      {selectedDoctor && (
        <DoctorProfileModal
          isOpen={isModalOpen}
          doctor={selectedDoctor}
          onClose={() => setIsModalOpen(false)}
          onReviewSubmitted={fetchDoctors}
        />
      )}
    </div>
  );
}
