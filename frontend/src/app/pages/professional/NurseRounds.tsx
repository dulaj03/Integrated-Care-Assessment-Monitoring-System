import { Activity, Clock, CheckCircle, AlertCircle, User, MapPin, Plus, Filter, ChevronRight, Play, Pause, Check } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface RoundTask {
  id: string;
  patientName: string;
  room: string;
  taskType: 'vitals' | 'medication' | 'wound-care' | 'monitoring' | 'hygiene' | 'mobility';
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledTime: string;
  duration?: number; // in minutes
  notes?: string;
}

export function NurseRounds() {
  const [tasks, setTasks] = useState<RoundTask[]>([
    {
      id: 'task-1',
      patientName: 'Nimal Jayasinghe',
      room: 'Ward A - Room 302',
      taskType: 'vitals',
      description: 'Check blood pressure, heart rate, and temperature',
      status: 'in-progress',
      priority: 'high',
      scheduledTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      duration: 15,
      notes: 'Monitor closely - BP readings have been elevated',
    },
    {
      id: 'task-2',
      patientName: 'Nimal Jayasinghe',
      room: 'Ward A - Room 302',
      taskType: 'medication',
      description: 'Administer medication (Metformin 500mg, Losartan 50mg)',
      status: 'pending',
      priority: 'urgent',
      scheduledTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      duration: 10,
    },
    {
      id: 'task-3',
      patientName: 'Kusum Perera',
      room: 'Ward B - Room 215',
      taskType: 'wound-care',
      description: 'Change surgical dressing and assess wound healing',
      status: 'pending',
      priority: 'normal',
      scheduledTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      duration: 20,
    },
    {
      id: 'task-4',
      patientName: 'Ravi De Silva',
      room: 'ICU - Room 5',
      taskType: 'monitoring',
      description: 'Continuous monitoring - Oxygen levels and respiratory rate',
      status: 'in-progress',
      priority: 'urgent',
      scheduledTime: new Date(Date.now()).toISOString(),
      notes: 'Patient is critical - requires constant observation',
    },
    {
      id: 'task-5',
      patientName: 'Kusum Perera',
      room: 'Ward B - Room 215',
      taskType: 'mobility',
      description: 'Assist with passive range of motion exercises',
      status: 'completed',
      priority: 'normal',
      scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      duration: 15,
    },
    {
      id: 'task-6',
      patientName: 'Nimal Jayasinghe',
      room: 'Ward A - Room 302',
      taskType: 'hygiene',
      description: 'Bed bath and change of clothes',
      status: 'completed',
      priority: 'normal',
      scheduledTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      duration: 25,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const updateTaskStatus = (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'normal':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'in-progress':
        return <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'vitals': 'Check Vitals',
      'medication': 'Medication',
      'wound-care': 'Wound Care',
      'monitoring': 'Monitoring',
      'hygiene': 'Hygiene',
      'mobility': 'Mobility'
    };
    return labels[type] || type;
  };

  const TaskCard = ({ task }: { task: RoundTask }) => (
    <div className={`rounded-lg border p-4 ${task.status === 'completed'
        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-75'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {task.patientName}
            </h4>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {getTaskTypeLabel(task.taskType)}
          </p>
        </div>
        {getStatusIcon(task.status)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          {task.room}
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300">
          {task.description}
        </p>

        {task.notes && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> {task.notes}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
          <span>{format(new Date(task.scheduledTime), 'h:mm a')}</span>
          {task.duration && <span>~{task.duration} mins</span>}
        </div>
      </div>

      {task.status !== 'completed' && (
        <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          {task.status === 'pending' ? (
            <>
              <button
                onClick={() => updateTaskStatus(task.id, 'in-progress')}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => updateTaskStatus(task.id, 'completed')}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                <Check className="h-4 w-4" />
                Complete
              </button>
              <button
                onClick={() => updateTaskStatus(task.id, 'pending')}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            </>
          )}
        </div>
      )}

      {task.status === 'completed' && (
        <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            View Details
          </button>
        </div>
      )}
    </div>
  );

  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            Nursing Rounds
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage and track your daily nursing tasks and rounds
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200">
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
              ? 'bg-orange-600 dark:bg-orange-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'in-progress'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
              ? 'bg-green-600 dark:bg-green-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
        >
          Completed
        </button>
      </div>

      {/* Task List */}
      <div>
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              No tasks at this time
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              All your tasks are complete or there are no tasks scheduled.
            </p>
          </div>
        )}
      </div>

      {/* Round Summary */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Today's Round Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Rounds Started:</span>
            <span className="font-medium text-slate-900 dark:text-white">08:30 AM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Expected Completion:</span>
            <span className="font-medium text-slate-900 dark:text-white">02:00 PM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Progress:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {stats.completed} / {stats.total} tasks completed
            </span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
