import { useState } from 'react';
import {
  X,
  Hospital,
  Mail,
  Lock,
  Hash,
  MapPin,
  Phone,
  Plus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddHospitalModal = ({ isOpen, onClose, onSuccess }: AddHospitalModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    registration_number: '',
    address: '',
    phone: '',
    type: 'Private' as 'Government' | 'Private',
    specialties: [] as string[],
  });
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('http://localhost:5000/api/admin/hospitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create hospital');
      }

      toast.success('Hospital account created successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        registration_number: '',
        address: '',
        phone: '',
        type: 'Private',
        specialties: [],
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Hospital className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add New Hospital</h2>
                  <p className="text-sm text-slate-400">Create a new institutional partner account.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Hospital Name</label>
                  <div className="relative group">
                    <Hospital className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="City General Hospital"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                    <input
                      required
                      type="email"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="admin@hospital.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                    <input
                      required
                      type="password"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Registration #</label>
                  <div className="relative group">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="HOSP-123456"
                      value={formData.registration_number}
                      onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="123 Medical Center Way"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Hospital Type</label>
                  <select
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-blue-500/50 text-white"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as 'Government' | 'Private' })}
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Specialties</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-blue-500/50"
                    placeholder="Add specialty (e.g. Cardiology)"
                    value={newSpecialty}
                    onChange={e => setNewSpecialty(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSpecialty.trim()) {
                          setFormData({ ...formData, specialties: [...formData.specialties, newSpecialty.trim()] });
                          setNewSpecialty('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSpecialty.trim()) {
                        setFormData({ ...formData, specialties: [...formData.specialties, newSpecialty.trim()] });
                        setNewSpecialty('');
                      }
                    }}
                    className="px-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-white/10 text-white transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((s, idx) => (
                    <span key={`specialty-${idx}-${s}`} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-2">
                      {s}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, specialties: formData.specialties.filter((_, i) => i !== idx) })}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 btn-primary py-2.5 justify-center text-sm font-bold tracking-wide disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      CREATE HOSPITAL ACCOUNT
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
