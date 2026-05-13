import { FileText, Download, Calendar, TrendingUp, AlertCircle, CheckCircle, Plus, Search, Loader2, X, MapPin, ClipboardList, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface MedicalReport {
  id: string;
  patient_name: string;
  test_name: string;
  test_type: string;
  status: 'ordered' | 'processing' | 'ready' | 'reviewed';
  result_summary?: string;
  review_note?: string;
  file_url?: string;
  created_at: string;
  hospital_name: string;
  doctor_name?: string;
  nurse_name?: string;
}

export function DoctorReports() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const token = sessionStorage.getItem('token');

  const fetchReports = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/lab/all-results', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReview = async (id: string, note: string) => {
    try {
      const res = await fetch(`/api/lab/review/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ review_note: note })
      });
      if (res.ok) {
        toast.success('Report reviewed and finalized');
        fetchReports();
        setSelectedReport(null);
      }
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && ['ordered', 'processing'].includes(report.status)) ||
      (statusFilter === 'completed' && report.status === 'ready') ||
      (statusFilter === 'reviewed' && report.status === 'reviewed');
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'reviewed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'ready': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'ordered':
    case 'processing': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'ready') return 'Completed';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      toast.error('No file available for this report');
      return;
    }
    
    try {
      toast.loading('Preparing download...');
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.dismiss();
      toast.success('Download complete');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download file');
      // Fallback: Open in new tab
      window.open(fileUrl, '_blank');
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => ['ordered', 'processing'].includes(r.status)).length,
    completed: reports.filter(r => r.status === 'ready').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-bold text-slate-500">Synchronizing laboratory records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Medical Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">View and manage patient medical reports and lab results</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
          <Plus className="h-4 w-4" /> New Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, icon: FileText, color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
          { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Reviewed', value: stats.reviewed, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.bg} border border-slate-200 dark:border-slate-800 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:border-blue-500/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 dark:text-white capitalize text-lg">{report.patient_name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{report.test_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(report.status)}`}>
                  {getStatusLabel(report.status)}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>{format(new Date(report.created_at), 'MMM d, yyyy · h:mm a')}</span>
                </div>
                {report.hospital_name && (
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span>{report.hospital_name}</span>
                  </div>
                )}
                {report.result_summary && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Observations</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                      "{report.result_summary.slice(0, 80)}{report.result_summary.length > 80 && '...'}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setSelectedReport(report)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
                >
                  <FileText className="h-4 w-4" /> View Full
                </button>
                <button 
                  onClick={() => handleDownload(report.file_url || '', `Report_${report.patient_name}_${report.test_name}.jpg`)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest">No reports found</h3>
          <p className="text-slate-500 font-bold text-sm mt-2">Adjust your filters or search by patient name.</p>
        </div>
      )}

      {/* Report Summary Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-40 bg-slate-900 flex items-center justify-center text-white overflow-hidden p-8">
                <div className="absolute inset-0 opacity-10">
                  <TrendingUp className="w-96 h-96 absolute -right-20 -bottom-20 rotate-12" />
                </div>
                <div className="relative w-full flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedReport.status)}`}>
                        {getStatusLabel(selectedReport.status)}
                      </span>
                      <p className="text-xs font-black uppercase tracking-widest opacity-60">Case #{String(selectedReport.id).slice(0, 8)}</p>
                    </div>
                    <h2 className="text-3xl font-black capitalize tracking-tight">{selectedReport.patient_name}</h2>
                    <p className="text-blue-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{selectedReport.test_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Creation Date</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{format(new Date(selectedReport.created_at), 'MMMM d, yyyy')}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">{format(new Date(selectedReport.created_at), 'h:mm a')}</p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Facility</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedReport.hospital_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" /> Lab Observations
                      </p>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic opacity-90">
                      "{selectedReport.result_summary || 'No detailed observations provided for this record.'}"
                    </p>
                  </div>
                </div>

                {selectedReport.review_note && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Doctor's Review Note
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                      {selectedReport.review_note}
                    </p>
                  </div>
                )}

                {selectedReport.file_url && (
                  <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-500 transition-all cursor-pointer" 
                    onClick={() => handleDownload(selectedReport.file_url!, `Result_${selectedReport.patient_name}.jpg`)}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">Attachment Available</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Diagnostic Image / Document</p>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                )}
              </div>

              <div className="p-8 pt-4 space-y-3">
                {selectedReport.status === 'ready' && (
                  <div className="space-y-3 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Enter Final Clinical Note</p>
                    <textarea 
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Add your expert review comments here..."
                      className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-slate-800 dark:text-slate-100 placeholder:opacity-50"
                    />
                    <button 
                      onClick={() => handleReview(selectedReport.id, reviewNote)}
                      disabled={!reviewNote.trim()}
                      className="w-full py-4 bg-blue-600 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-5 h-5" /> FINALIZE & REVIEW
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => { setSelectedReport(null); setReviewNote(''); }}
                  className="w-full py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] shadow-xl"
                >
                  DISMISS CASE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
