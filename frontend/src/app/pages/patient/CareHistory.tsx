import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Download, 
  ChevronRight, 
  Activity, 
  History,
  Search,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function CareHistory() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const token = sessionStorage.getItem('token');

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      // Patient view of their own tasks
      const res = await fetch('/api/rounds/my-rounds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRounds(data);
      }
    } catch (error) {
      console.error('Fetch history failed:', error);
      toast.error('Could not load your care history');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredRounds = rounds.filter(r => 
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Area */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Your Care Journey</h1>
          <p className="text-blue-100 font-bold max-w-xl text-lg leading-relaxed">
                        Track every procedural milestone and clinical outcome from your medical team in real-time.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl flex items-center gap-2 border border-white/10">
              <History className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">{rounds.length} Total Procedures</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl flex items-center gap-2 border border-white/10">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">{rounds.filter(r => r.status === 'completed').length} Finalized</span>
            </div>
          </div>
        </div>
        <Activity className="absolute right-[-2rem] top-[-2rem] w-64 h-64 text-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List View */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Find a specific procedure..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-3xl" />
              ))}
            </div>
          ) : filteredRounds.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No history available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRounds.map(round => (
                <button
                  key={round.id}
                  onClick={() => setSelectedRound(round)}
                  className={`w-full text-left p-6 rounded-[2.5rem] border-2 transition-all group flex flex-col gap-3 ${
                    selectedRound?.id === round.id 
                      ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-500/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      selectedRound?.id === round.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {round.status}
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedRound?.id === round.id ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-black leading-tight ${selectedRound?.id === round.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {round.title}
                    </h4>
                    <p className={`text-xs font-bold mt-1 ${selectedRound?.id === round.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                            Started {format(new Date(round.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedRound ? (
              <motion.div
                key={selectedRound.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm"
              >
                {/* Results Header */}
                <div className="p-8 md:p-12 bg-indigo-50/30 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm">
                          <ClipboardCheck className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 font-black">Finalized Outcome Report</p>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{selectedRound.title}</h2>
                        </div>
                      </div>
                      <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-indigo-50 dark:border-indigo-900/40">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Final Clinical Summary</h4>
                        <p className="text-lg font-bold text-slate-800 dark:text-white italic leading-relaxed">
                                                    "{selectedRound.result_summary || 'Finalizing results...'}"
                        </p>
                      </div>
                    </div>

                    {selectedRound.result_file && (
                      <a 
                        href={selectedRound.result_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-indigo-500/40 transition-all hover:scale-105"
                      >
                        <Download className="w-6 h-6" />
                                                Download Report
                      </a>
                    )}
                  </div>
                </div>

                {/* Care Timeline */}
                <div className="p-8 md:p-12">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-indigo-600" />
                                        Step-by-Step Care Journey
                  </h3>
                                    
                  <div className="relative pl-12 space-y-12">
                    <div className="absolute left-[1.35rem] top-4 bottom-4 w-[2px] bg-indigo-100 dark:bg-indigo-900/30" />
                                        
                    {selectedRound.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className={`absolute left-[-3.35rem] w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center transition-all ${
                          step.status === 'completed' ? 'bg-emerald-500 shadow-xl shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-700'
                        }`}>
                          {step.status === 'completed' && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-lg font-black ${step.status === 'completed' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {step.step_name}
                          </h4>
                          <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {step.completed_at ? format(new Date(step.completed_at), 'MMMM d, h:mm a') : 'Awaiting completion'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 dark:bg-slate-900/10 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <ArrowRight className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-300">Select a procedural record to see your care journey</h3>
                <p className="text-slate-400 text-sm font-bold max-w-xs mt-2">View real-time updates and download diagnostic files directly.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ClipboardCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="m9 14 2 2 4-4"/>
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
