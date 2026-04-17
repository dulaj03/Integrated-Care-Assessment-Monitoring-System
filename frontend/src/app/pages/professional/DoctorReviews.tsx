import { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldAlert, Loader2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Review {
  id: number;
  patient_name: string;
  rating: number;
  review: string;
  is_reported: boolean;
  report_reason?: string;
  created_at: string;
}

export function DoctorReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const token = sessionStorage.getItem('token');

  const fetchReviews = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/ratings/my-reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !reportingId) return;

    setSubmittingReport(true);
    try {
      const res = await fetch(`http://localhost:5000/api/ratings/report/${reportingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });

      if (res.ok) {
        toast.success('Review reported to administration');
        setReportingId(null);
        setReportReason('');
        fetchReviews();
      } else {
        toast.error('Failed to report review');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Overall Rating</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white">{avgRating}</h2>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${Number(avgRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Reviews</p>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white">{reviews.length}</h2>
        </div>

        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="h-5 w-5 text-blue-200" />
            <p className="text-[10px] font-black uppercase text-blue-100 tracking-widest">Integrity Policy</p>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-90 italic">
            "Your reputation is built on patient trust. If you believe a review is fraudulent or abusive, report it immediately for clinical audit."
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          Patient Feedback
        </h3>
        
        {reviews.length === 0 ? (
          <div className="p-16 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center">
            <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No reviews yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((rev) => (
              <motion.div 
                key={rev.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 transition-all ${rev.is_reported ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center font-black text-blue-600">
                        {rev.patient_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{rev.patient_name}</h4>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${rev.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                      "{rev.review}"
                    </p>
                    
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {rev.is_reported ? (
                      <div className="flex items-center gap-2 px-6 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-200">
                        <Flag className="h-4 w-4" />
                        Under Review
                      </div>
                    ) : (
                      <button 
                        onClick={() => setReportingId(rev.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-red-200"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Report Review
                      </button>
                    )}
                  </div>
                </div>

                {rev.is_reported && rev.report_reason && (
                  <div className="mt-6 p-4 bg-amber-100/50 dark:bg-amber-900/10 rounded-2xl border border-amber-200/50">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Your Report Reason:</p>
                    <p className="text-xs text-amber-800 dark:text-amber-400 italic">"{rev.report_reason}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Report Review</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Please provide a briefly explanation for reporting this review. Admin will audit the patient's record.
              </p>
              
              <form onSubmit={handleReport} className="space-y-6">
                <textarea
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Inappropriate language, fraudulent experience, or abusive content..."
                  className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm min-h-[150px] outline-none focus:border-blue-500 transition-all font-medium"
                />
                
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setReportingId(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submittingReport}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-500/20 disabled:opacity-50"
                  >
                    {submittingReport ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
