import {
  FileText, Download, CheckCircle2, Calendar, Clock,
  MapPin, User, Building2, CreditCard, Stethoscope,
  Loader2, AlertCircle, ArrowLeft, Mail
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseLocalDate(d: any): Date {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, day] = s.split('-').map(Number);
    return new Date(y, m - 1, day);
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? new Date() : dt;
}

function formatTime(t: string): string {
  if (!t) return '--:--';
  if (t.includes('T')) return format(new Date(t), 'h:mm a');
  const [h, m] = t.split(':').map(Number);
  const d = new Date(); d.setHours(h, m);
  return format(d, 'h:mm a');
}

function formatCurrency(amount: number | string): string {
  return `LKR ${parseFloat(String(amount || 0)).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceData {
  id: number;
  invoice_number: string;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  hospital_id: number;
  doctor_fee: string;
  hospital_fee: string;
  icams_fee: string;
  total_amount: string;
  payment_status: string;
  payhere_payment_id?: string;
  paid_at?: string;
  created_at: string;
  // Joined fields
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  appt_status: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  patient_address?: string;
  patient_dob?: string;
  patient_nic?: string;
  doctor_name: string;
  doctor_specialization: string;
  doctor_email?: string;
  doctor_qualification?: string;
  hospital_name: string;
  hospital_address: string;
  hospital_phone?: string;
  hospital_type?: string;
}

// ─── Invoice Component ────────────────────────────────────────────────────────
export function Invoice() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const token = sessionStorage.getItem('token');

  const [retries, setRetries] = useState(0);

  const fetchInvoice = useCallback(async () => {
    if (!token || !appointmentId) return;
    try {
      const res = await fetch(`/api/payment/invoice/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInvoice(await res.json());
        setError('');
      } else {
        const d = await res.json();
        // If not found, retry up to 5 times (every 2 seconds)
        if (res.status === 404 && retries < 5) {
          setTimeout(() => setRetries(prev => prev + 1), 2000);
          return;
        }
        setError(d.error || 'Invoice not found');
      }
    } catch {
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [token, appointmentId, retries]);

  // Confirm payment as soon as patient lands on invoice page from PayHere
  // PayHere only redirects here on SUCCESS, so this is safe to call immediately
  useEffect(() => {
    if (!token || !appointmentId) return;
    fetch(`/api/payment/confirm-return/${appointmentId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => console.log('[Payment Confirmed]', d.status))
      .catch(err => console.warn('[Confirm Return Error]', err));
  }, [token, appointmentId]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  const handleDownloadPDF = () => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
        #invoice-print-area { position: fixed; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
    toast.success('PDF download initiated!');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="font-bold text-slate-500">Loading invoice...</p>
    </div>
  );

  if (error || !invoice) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="font-bold text-slate-600">{error || 'Invoice not found'}</p>
      <button onClick={() => navigate('/patient/appointments')}
        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
        Back to Appointments
      </button>
    </div>
  );

  const isPaid = invoice.payment_status === 'completed';

  return (
    <div className="space-y-6 pb-10">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patient/appointments')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Invoice</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{invoice.invoice_number}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-500/20 hover:scale-105"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <motion.div
        id="invoice-print-area"
        ref={printRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 p-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-block bg-white/20 rounded-2xl px-5 py-2 mb-4">
                <span className="text-2xl font-black tracking-tight">I-CAMS</span>
              </div>
              <h2 className="text-3xl font-black mb-1">Official Invoice</h2>
              <p className="text-blue-200 text-sm">Integrated Clinical & Administrative Management System</p>
              <p className="text-blue-200 text-xs mt-1">Sri Lanka's Premier Healthcare Management Network</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm ${isPaid ? 'bg-emerald-400/25 text-emerald-200 border border-emerald-400/30' : 'bg-orange-400/25 text-orange-200 border border-orange-400/30'}`}>
                <CheckCircle2 className="h-4 w-4" />
                {isPaid ? 'PAYMENT CONFIRMED' : invoice.payment_status.toUpperCase()}
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-blue-200 text-xs uppercase tracking-widest">Invoice Number</p>
                <p className="text-xl font-black">{invoice.invoice_number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Bar */}
        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-10 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Issue Date', value: invoice.paid_at ? format(new Date(invoice.paid_at), 'MMM d, yyyy') : format(new Date(invoice.created_at), 'MMM d, yyyy') },
              { label: 'Payment Time', value: invoice.paid_at ? format(new Date(invoice.paid_at), 'h:mm a') : '--' },
              { label: 'Transaction ID', value: invoice.payhere_payment_id || 'N/A' },
              { label: 'Currency', value: 'LKR — Sri Lankan Rupee' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 space-y-8">
          {/* Parties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-600" />
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Patient</p>
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">{invoice.patient_name}</h3>
              <div className="mt-2 space-y-0.5">
                {invoice.patient_nic && <p className="text-xs text-slate-500">NIC: {invoice.patient_nic}</p>}
                <p className="text-xs text-slate-500">{invoice.patient_email}</p>
                {invoice.patient_phone && <p className="text-xs text-slate-500">{invoice.patient_phone}</p>}
                {invoice.patient_address && <p className="text-xs text-slate-500">{invoice.patient_address}</p>}
              </div>
            </div>

            {/* Doctor */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="h-4 w-4 text-purple-600" />
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Consulting Physician</p>
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Dr. {invoice.doctor_name}</h3>
              <div className="mt-2 space-y-0.5">
                <p className="text-xs text-purple-600 font-semibold">{invoice.doctor_specialization}</p>
                {invoice.doctor_qualification && <p className="text-xs text-slate-500">{invoice.doctor_qualification}</p>}
                {invoice.doctor_email && <p className="text-xs text-slate-500">{invoice.doctor_email}</p>}
              </div>
            </div>

            {/* Hospital */}
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-5 border border-teal-100 dark:border-teal-900/30">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-teal-600" />
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Healthcare Facility</p>
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">{invoice.hospital_name}</h3>
              <div className="mt-2 space-y-0.5">
                {invoice.hospital_type && <p className="text-xs text-teal-600 font-semibold capitalize">{invoice.hospital_type} Hospital</p>}
                <p className="text-xs text-slate-500">{invoice.hospital_address}</p>
                {invoice.hospital_phone && <p className="text-xs text-slate-500">{invoice.hospital_phone}</p>}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Appointment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Date</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {format(parseLocalDate(invoice.appointment_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Time</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {formatTime(invoice.appointment_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Facility</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{invoice.hospital_name}</p>
                </div>
              </div>
            </div>
            {invoice.reason && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Reason for Visit</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">{invoice.reason}</p>
              </div>
            )}
          </div>

          {/* Fee Breakdown Table */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fee Breakdown</p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-slate-900 dark:bg-slate-950 px-6 py-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</p>
              </div>

              {/* Rows */}
              {[
                { desc: `Consultation with Dr. ${invoice.doctor_name}`, cat: 'Doctor Fee', amount: invoice.doctor_fee, color: 'text-blue-600' },
                { desc: `${invoice.hospital_name} — Facility Charge`, cat: 'Hospital Fee', amount: invoice.hospital_fee, color: 'text-teal-600' },
                { desc: 'I-CAMS Digital Healthcare Platform', cat: 'Platform Fee', amount: invoice.icams_fee, color: 'text-purple-600' },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 ${i % 2 === 1 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium pr-4">{row.desc}</p>
                  <p className={`text-xs font-bold text-center self-center ${row.color}`}>{row.cat}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white text-right self-center">{formatCurrency(row.amount)}</p>
                </div>
              ))}

              {/* Total Row */}
              <div className="grid grid-cols-3 px-6 py-5 bg-gradient-to-r from-blue-900 to-blue-700">
                <p className="text-base font-black text-white">Total Amount Paid</p>
                <p className="text-center self-center">
                  <span className="text-xs font-bold text-blue-200 px-2 py-0.5 rounded-full bg-white/10">LKR</span>
                </p>
                <p className="text-xl font-black text-white text-right">{formatCurrency(invoice.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Payment Confirmation Banner */}
          {isPaid && (
            <div className="flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">Payment Verified & Confirmed</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                  Processed via PayHere Secure Payment Gateway · Transaction ID: {invoice.payhere_payment_id || 'N/A'}
                </p>
              </div>
              <CheckCircle2 className="h-7 w-7 text-emerald-500 shrink-0" />
            </div>
          )}

          {/* Email note */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <Mail className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
              A copy of this invoice has been sent to <strong>{invoice.patient_email}</strong>
            </p>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">I-CAMS Sri Lanka</p>
              <p className="text-xs text-slate-500 mt-0.5">Integrated Clinical & Administrative Management System</p>
              <p className="text-[10px] text-slate-400 mt-0.5">© 2026 I-CAMS. All Rights Reserved.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <FileText className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Official Tax Invoice</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
