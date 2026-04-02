import { useState, useEffect } from 'react';
import { FlaskConical, Clock, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Microscope, Scan, Zap, Droplet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import {
  LabTest,
  LAB_STATUS_STEPS,
  getLabStatusLabel,
  getLabStatusColor,
  getHospitalById,
  getDoctorById,
} from '../../lib/hospitalData';

const TEST_TYPE_ICONS: Record<string, React.ElementType> = {
  blood: Droplet,
  urine: FlaskConical,
  scan: Scan,
  xray: Scan,
  ecg: Zap,
  mri: Scan,
  biopsy: Microscope,
};

const FLAG_COLORS: Record<string, string> = {
  normal: 'text-green-600 dark:text-green-400',
  high: 'text-red-600 dark:text-red-400',
  low: 'text-blue-600 dark:text-blue-400',
  critical: 'text-red-700 dark:text-red-300 font-bold',
};

const FLAG_ICONS: Record<string, React.ElementType> = {
  normal: Minus,
  high: TrendingUp,
  low: TrendingDown,
  critical: AlertTriangle,
};

function LabTestCard({ test }: { test: LabTest }) {
  const [expanded, setExpanded] = useState(false);
  const hospital = getHospitalById(test.hospitalId);
  const doctor = getDoctorById(test.orderedByDoctorId);
  const currentStepIdx = LAB_STATUS_STEPS.indexOf(test.status);
  const Icon = TEST_TYPE_ICONS[test.testType] || FlaskConical;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{test.testName}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{hospital?.name} · Ordered by {doctor?.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Ordered: {format(new Date(test.orderedDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getLabStatusColor(test.status)}`}>
              {test.status === 'ready' || test.status === 'reviewed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {getLabStatusLabel(test.status)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${test.priority === 'stat' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
              test.priority === 'urgent' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {test.priority === 'stat' ? '🔴 STAT' : test.priority === 'urgent' ? '🟠 Urgent' : 'Routine'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {LAB_STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`h-2.5 w-2.5 rounded-full border-2 transition-all ${i <= currentStepIdx
                  ? 'bg-blue-600 border-blue-600 dark:bg-blue-400 dark:border-blue-400'
                  : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                }`} />
                {i < LAB_STATUS_STEPS.length - 1 && (
                  <div className="absolute" />
                )}
              </div>
            ))}
          </div>
          <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-700"
              style={{ width: `${(currentStepIdx / (LAB_STATUS_STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-400">Ordered</span>
            <span className="text-xs text-slate-400">Reviewed</span>
          </div>
        </div>

        {/* Results (if ready) */}
        {test.result && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Results Available</p>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{test.result.summary}</p>

            {test.result.values && (
              <div className="space-y-2">
                {test.result.values.map((v, i) => {
                  const FlagIcon = FLAG_ICONS[v.flag || 'normal'];
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{v.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Normal: {v.normalRange} {v.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${FLAG_COLORS[v.flag || 'normal']}`}>
                          {v.value} {v.unit}
                        </span>
                        <FlagIcon className={`h-4 w-4 ${FLAG_COLORS[v.flag || 'normal']}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {test.result.reviewNote && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Doctor's Review Note:</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{test.result.reviewNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Toggle Steps */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide' : 'Show'} step-by-step progress ({test.steps.length} steps)
        </button>
      </div>

      {/* Steps Timeline */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-slate-200 dark:border-slate-700 px-5 py-4 space-y-4">
              {test.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    {i < test.steps.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{step.step}</p>
                    {step.completedAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {format(new Date(step.completedAt), 'MMM d, yyyy · h:mm a')}
                      </p>
                    )}
                    {step.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">{step.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LabResults() {
  const [dbTests, setDbTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/lab/my-results', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbTests(data);
      }
    } catch (error) {
      console.error('Error fetching lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map backend to frontend LabTest interface
  const tests: LabTest[] = dbTests.length > 0 ? dbTests.map(t => ({
    id: String(t.id),
    patientId: String(t.patient_id),
    hospitalId: String(t.hospital_id),
    orderedByDoctorId: String(t.doctor_id),
    testName: t.test_name,
    testType: t.test_type,
    status: t.status,
    orderedDate: t.created_at,
    priority: t.priority || 'routine',
    result: t.result_data || (t.result_summary ? { summary: t.result_summary } : null),
    steps: t.steps || []
  })) : []; // Remove hardcoded mock fallback if empty to show "No tests found"

  const filtered = filterStatus === 'all' ? tests : tests.filter(t => t.status === filterStatus);

  const pendingCount = tests.filter(t => !['ready', 'reviewed'].includes(t.status)).length;
  const readyCount = tests.filter(t => t.status === 'ready' || t.status === 'reviewed').length;

  if (loading) {
     return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lab Test Results</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track all your test orders, progress, and results
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tests', value: tests.length, color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-800' },
          { label: 'In Progress', value: pendingCount, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Results Ready', value: readyCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border border-slate-200 dark:border-slate-700 ${stat.bg} p-4 text-center`}>
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'All Tests' },
          { value: 'ordered', label: 'Ordered' },
          { value: 'processing', label: 'Processing' },
          { value: 'ready', label: 'Results Ready' },
          { value: 'reviewed', label: 'Reviewed' },
        ].map(opt => (
          <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterStatus === opt.value
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400'
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {filtered.map(test => (
          <LabTestCard key={test.id} test={test} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
