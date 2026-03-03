import {
  Users,
  Stethoscope,
  Activity,
  Building2,
  LayoutDashboard,
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Activity },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'nurses', label: 'Nurses', icon: Users },
  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
];

export const Sidebar = ({ activeTab, onTabChange, onLogout }: {
  activeTab: string,
  onTabChange: (tab: string) => void,
  onLogout: () => void
}) => {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-slate-900 border-r border-white/5 flex flex-col p-6 z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-white">I-CAMS</h1>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium">{item.label}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
