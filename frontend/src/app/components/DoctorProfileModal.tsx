import { useState, useEffect } from 'react';
import { X, Star, MessageSquare, ShieldAlert, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Review {
  id: string | number;
  patient_name: string;
  rating: number;
  review: string;
  created_at: string;
}

interface Doctor {
  id: string | number;
  full_name?: string;
  name?: string;
  specialization: string;
  years_of_experience?: number;
  experience?: number;
  avg_rating?: string | number;
  review_count?: string | number;
  avatar?: string;
}

interface DoctorProfileModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const DoctorProfileModal = ({ doctor, isOpen, onClose, onReviewSubmitted }: DoctorProfileModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRateForm, setShowRateForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = sessionStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/ratings/doctor/${doctor.id}`);
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, doctor.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('You must be logged in to rate a doctor');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          rating,
          review: reviewText
        })
      });

      if (res.ok) {
        toast.success('Thank you for your review!');
        setReviewText('');
        setShowRateForm(false);
        fetchReviews();
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-6">
                <img 
                  src={doctor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.id}`} 
                  alt={doctor.full_name || doctor.name}
                  className="h-24 w-24 rounded-[2rem] bg-white/20 p-1 border-2 border-white/30 object-cover"
                />
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{doctor.full_name || doctor.name}</h2>
                  <p className="text-blue-100 font-bold uppercase tracking-wider text-sm opacity-90">{doctor.specialization}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                      <span className="font-black text-sm">{doctor.avg_rating || '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm text-xs font-bold">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-200" />
                      {doctor.review_count || 0} Reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Swiper */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {!showRateForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      Patient Reviews
                    </h3>
                    <button 
                      onClick={() => setShowRateForm(true)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      WRITE A REVIEW
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                      <p className="text-slate-500 font-bold animate-pulse">Fetching reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-black text-blue-500">
                                {rev.patient_name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rev.patient_name}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Verified Patient</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{rev.review}"</p>
                          <p className="text-[9px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
                            {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Rate your Experience</h3>
                    <button 
                      onClick={() => setShowRateForm(false)}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest"
                    >
                      Go Back
                    </button>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2rem] border-2 border-blue-100 dark:border-blue-900/30 flex flex-col items-center">
                      <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Your Overall Satisfaction</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 transition-all hover:scale-110 active:scale-90"
                          >
                            <Star className={`h-12 w-12 ${rating >= star ? 'text-amber-400 fill-amber-300' : 'text-slate-300 dark:text-slate-700'}`} />
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 font-black text-blue-800 dark:text-blue-200 uppercase tracking-tighter">
                        {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Write your review</label>
                      <textarea
                        required
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell others about your consultation, bedside manner, and the care you received..."
                        className="w-full px-6 py-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none h-32"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                      <p className="text-[10px] font-bold text-slate-500 leading-tight italic">
                        By submitting, you confirm that this review is based on your own genuine experience and follows our community guidelines.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      {submitting ? 'SUBMITTING...' : 'SUBMIT MY REVIEW'}
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Only registered patients can leave clinical reviews</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
