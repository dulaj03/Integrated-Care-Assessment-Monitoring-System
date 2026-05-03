import { useState, useEffect } from 'react';
import { Flag, Trash2, CheckCircle, Loader2, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface ReportedReview {
  id: number;
  patient_name: string;
  doctor_name: string;
  rating: number;
  review: string;
  report_reason: string;
  updated_at: string;
}

export const ReportedReviewsTable = () => {
  const [reports, setReports] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchReports = async () => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/ratings/reported', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (err) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return;
    const token = sessionStorage.getItem('admin_token');
    setProcessingId(id);
    try {
      const res = await fetch(`/api/ratings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Review deleted permanently');
        fetchReports();
      }
    } catch (err) {
      toast.error('Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (id: number) => {
    const token = sessionStorage.getItem('admin_token');
    setProcessingId(id);
    try {
      const res = await fetch(`/api/ratings/dismiss/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Report dismissed');
        fetchReports();
      }
    } catch (err) {
      toast.error('Failed to dismiss report');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading clinical disputes...</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            Reported Clinical Reviews
          </h2>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Public Integrity Management</p>
        </div>
        <div className="px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
          {reports.length} ACTIVE DISPUTES
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a] text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Patients & Rating</th>
              <th className="px-8 py-5">Review Content</th>
              <th className="px-8 py-5">Reporting Doctor</th>
              <th className="px-8 py-5">Reason For Report</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {reports.map((report) => (
                <motion.tr 
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-white text-sm">{report.patient_name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${report.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
                      <p className="text-sm text-slate-400 font-medium italic">"{report.review}"</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-blue-400">Dr. {report.doctor_name}</span>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-xs text-red-400 font-bold leading-relaxed">{report.report_reason}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleDismiss(report.id)}
                        disabled={processingId === report.id}
                        className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                        title="Dismiss Report (Keep Review)"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(report.id)}
                        disabled={processingId === report.id}
                        className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Delete Review"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active review disputes. Integrity maintained.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
