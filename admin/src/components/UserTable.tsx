import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Calendar
} from 'lucide-react';
import type { AdminUser } from '../types/user';
import { motion } from 'motion/react';

interface UserTableProps {
  users: AdminUser[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  title: string;
}

export const UserTable = ({ users, onApprove, onReject, title }: UserTableProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-400">Manage and oversee registered accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{users.length} Total Records</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Date Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user, index) => (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={user.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/10 active:scale-95 transition-transform">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{user.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${user.status === 'APPROVED' ? 'badge-approved' :
                    user.status === 'PENDING' ? 'badge-pending' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-slate-400 flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {user.createdAt}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.status === 'PENDING' && onApprove && (
                      <button
                        onClick={() => onApprove(user.id)}
                        className="btn-approve flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    )}
                    {user.status === 'PENDING' && onReject && (
                      <button
                        onClick={() => onReject(user.id)}
                        className="btn-reject flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    )}
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
