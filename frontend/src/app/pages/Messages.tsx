import { MessagingSection } from '../components/MessagingSection';

export function Messages() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Messaging Center</h2>
        <p className="text-sm text-slate-500 font-medium">Real-time communication with your care team</p>
      </div>
      <MessagingSection />
    </div>
  );
}

export default Messages;

