import { 
  X, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Mail, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Fingerprint,
  Building 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AdminUser } from '../types/user';

interface PendingReviewModalProps {
  user: AdminUser;
  onClose: () => void;
  onApprove: (id: string, role: string) => void;
  onReject: (id: string, role: string) => void;
}

export const PendingReviewModal = ({ user, onClose, onApprove, onReject }: PendingReviewModalProps) => {
  const isDoctorOrNurse = user.role === 'DOCTOR' || user.role === 'NURSE';
  const licensePath = (user as any).license_document;
  const imageUrl = licensePath ? `http://localhost:5000/${licensePath.replace(/\\/g, '/')}` : null;
  const isPdf = licensePath?.toLowerCase().endsWith('.pdf');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white capitalize">{user.name}</h2>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{user.role} Application</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Details Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Personal & Professional Details
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <DetailItem icon={Mail} label="Email Address" value={user.email} />
                <DetailItem icon={Calendar} label="Date Registered" value={user.createdAt} />
                
                {isDoctorOrNurse && (
                  <>
                    <DetailItem icon={Fingerprint} label="License Number" value={(user as any).license_number} />
                    <DetailItem icon={Fingerprint} label="Reg Number" value={(user as any).registration_number} />
                    <DetailItem icon={Briefcase} label="Specialization" value={(user as any).specialization || (user as any).qualification} />
                    <DetailItem icon={GraduationCap} label="Experience" value={`${(user as any).years_of_experience} Years`} />
                    <DetailItem icon={Building} label="Institution" value={(user as any).institution_name} />
                  </>
                )}
                
                {user.role === 'HOSPITAL' && (
                  <>
                    <DetailItem icon={Fingerprint} label="Reg Number" value={(user as any).registration_number || (user as any).registrationNumber} />
                    <DetailItem icon={Building} label="Hospital Type" value={(user as any).type} />
                  </>
                )}
              </div>
            </div>

            {/* Document Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> Submitted License Document
              </h3>
              
              <div className="aspect-[4/3] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center group relative">
                {imageUrl ? (
                  isPdf ? (
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <FileText className="w-16 h-16 text-rose-500" />
                      <p className="text-sm font-medium">PDF Document Submitted</p>
                      <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all"
                      >
                        VIEW FULL PDF
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={imageUrl} 
                      alt="License Document" 
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        e.currentTarget.src = 'https://placehold.co/600x400/1e293b/475569?text=Image+Load+Failed';
                      }}
                    />
                  )
                ) : (
                  <div className="text-slate-500 text-sm italic">No document uploaded</div>
                )}
                
                {imageUrl && !isPdf && (
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs flex items-center gap-2"
                      >
                        VIEW FULL SIZE
                      </a>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Actions */}
          <div className="p-6 border-t border-white/5 bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-tight">Reviewing Case #{user.id}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onReject(user.id, user.role)}
                className="px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-black transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                REJECT APPLICATION
              </button>
              <button
                onClick={() => onApprove(user.id, user.role)}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                APPROVE ACCOUNT
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | undefined }) => (
  <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-200">{value || 'N/A'}</p>
    </div>
  </div>
);

const Shield = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);
