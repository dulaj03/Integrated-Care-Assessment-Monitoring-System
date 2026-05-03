import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PlatformReviewsTable = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/platform-reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setReviews(data);
      else throw new Error(data.error);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load platform reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleFeature = async (id: number) => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/platform-reviews/${id}/feature`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchReviews();
      } else {
        toast.error(data.error || 'Failed to toggle featured status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/platform-reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Review deleted');
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white">Platform Reviews</h2>
          <p className="text-slate-400 text-sm">Manage user testimonials and select featured reviews (Max 6)</p>
        </div>
        <div className="bg-slate-800 border border-white/10 px-4 py-2 rounded-xl">
          <span className="text-slate-400 text-sm font-bold">Featured: </span>
          <span className="text-emerald-400 font-black">{reviews.filter(r => r.is_featured).length} / 6</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-800/50">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[200px]">User</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[300px]">Review</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[120px]">Rating</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[100px]">Featured</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reviews.map((review, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={review.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-white mb-0.5">{review.user_name}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {review.user_role}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-300 line-clamp-2" title={review.review_text}>{review.review_text}</p>
                    <span className="text-xs text-slate-500 mt-1 block">{new Date(review.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleFeature(review.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        review.is_featured 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700'
                      }`}
                    >
                      {review.is_featured ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {review.is_featured ? 'Featured' : 'Feature'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    No platform reviews submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
