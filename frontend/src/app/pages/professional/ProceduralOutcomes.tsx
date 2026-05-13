import { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  FileText, 
  Search, 
  Clock, 
  Download, 
  ChevronRight, 
  Activity,
  User,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function ProceduralOutcomes() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const token = sessionStorage.getItem('token');

  const fetchRounds = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/rounds/my-rounds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRounds(data);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
      toast.error('Could not load procedural history');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  const filteredRounds = rounds.filter(r => 
    r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Procedural Outcome Hub</h1>
          <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
            <Activity className="w-4 h-4 text-blue-500" />
            Central repository for all nursing tasks and procedural results
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search patient or procedure..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full md:w-80 font-black text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRounds.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">No Procedural Records Found</h2>
          <p className="text-slate-500 font-bold max-w-sm mx-auto mt-2">When nurses complete round tasks for your patients, those detailed records and results will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* List View */}
          <div className="xl:col-span-1 space-y-3">
            {filteredRounds.map((round) => (
              <button
                key={round.id}
                onClick={() => setSelectedRound(round)}
                className={`w-full text-left p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
                  selectedRound?.id === round.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    selectedRound?.id === round.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'
                  }`}>
                    <ClipboardList className={`w-6 h-6 ${selectedRound?.id === round.id ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">{round.title}</h4>
                    <p className={`text-[10px] font-bold ${selectedRound?.id === round.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      Patient: {round.patient_name}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedRound?.id === round.id ? 'translate-x-1' : 'group-hover:translate-x-1 text-slate-300'}`} />
              </button>
            ))}
          </div>

          {/* Detail View */}
          <div className="xl:col-span-2">
            <AnimatePresence mode="wait">
              {selectedRound ? (
                <motion.div
                  key={selectedRound.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm sticky top-6"
                >
                  {/* Detail Header */}
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            selectedRound.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedRound.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 italic">ID: #{selectedRound.id}</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedRound.title}</h2>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedRound.patient_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{format(new Date(selectedRound.created_at), 'MMM d, yyyy · h:mm a')}</span>
                          </div>
                        </div>
                      </div>

                      {selectedRound.result_file && (
                        <a 
                          href={selectedRound.result_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-blue-600 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"
                        >
                          <Download className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Download Full Result</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Milestones */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Procedural Milestones
                      </h3>
                      <div className="space-y-4">
                        {selectedRound.steps?.map((step: any, idx: number) => (
                          <div key={idx} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                step.status === 'completed' 
                                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {step.status === 'completed' ? <Check className="w-4 h-4" /> : idx + 1}
                              </div>
                              {idx !== selectedRound.steps.length - 1 && (
                                <div className={`w-0.5 flex-grow my-1 ${step.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                              )}
                            </div>
                            <div className="pb-6">
                              <h4 className={`text-sm font-black transition-colors ${step.status === 'completed' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                {step.step_name}
                              </h4>
                              {step.completed_at && (
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                  Documented at {format(new Date(step.completed_at), 'h:mm a')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Outcome */}
                    <div className="space-y-8">
                      <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20">
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 mb-4">
                          <FileText className="w-4 h-4" />
                          Clinical Summary
                        </h3>
                        {selectedRound.result_summary ? (
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                            "{selectedRound.result_summary}"
                          </p>
                        ) : (
                          <p className="text-slate-400 font-bold italic">No final result summary provided yet.</p>
                        )}
                      </div>

                      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assigned Nurse</p>
                            <h4 className="font-black text-slate-900 dark:text-white">Staff Member #{selectedRound.nurse_id}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[600px] bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12">
                  <div className="h-20 w-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                    <ArrowRight className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400">Select a round to view progress and outcomes</h3>
                  <p className="text-slate-400 font-bold text-sm max-w-xs mt-2">Deep-dive into milestones, clinical summaries, and diagnostic attachments.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// Reuse Check icon from Lucide
function Check({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
