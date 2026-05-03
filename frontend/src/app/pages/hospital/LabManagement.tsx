import { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle2, ChevronDown, ChevronUp, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import {
  LAB_STATUS_STEPS,
  getLabStatusColor
} from '../../lib/hospitalData';
import { useTranslation } from 'react-i18next';

export function LabManagement() {
  const { t } = useTranslation();
  const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [uploadNote, setUploadNote] = useState<Record<string, string>>({});

  const fetchTests = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/lab/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const getPatientName = (id: string, test?: any) => test?.patient_name || id;

  const filtered = filterStatus === 'all' ? tests : tests.filter(t => t.status === filterStatus);

  const updateTestStatus = async (testId: string, newStatus: string, payload: any = {}) => {
    setUpdatingId(testId);
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`/api/lab/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, ...payload })
      });
      if (res.ok) {
        fetchTests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const advanceStatus = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    const currentIdx = LAB_STATUS_STEPS.indexOf(test.status as any);
    if (currentIdx >= LAB_STATUS_STEPS.length - 2) return;
    const nextStatus = LAB_STATUS_STEPS[currentIdx + 1];
    updateTestStatus(testId, nextStatus);
  };

  const uploadResult = (testId: string) => {
    const summary = resultInputs[testId];
    if (!summary) return;
    updateTestStatus(testId, 'results_ready', { result_summary: summary });
    setResultInputs(prev => ({ ...prev, [testId]: '' }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 italic">{t('lab_management.syncing')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('lab_management.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('lab_management.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('lab_management.totalTests'), value: tests.length, color: 'text-slate-900 dark:text-white' },
          { label: t('lab_management.orderedPending'), value: tests.filter(t => t.status === 'ordered').length, color: 'text-slate-600 dark:text-slate-400' },
          { label: t('lab_management.inProgress'), value: tests.filter(t => ['sample_scheduled', 'sample_collected', 'processing'].includes(t.status)).length, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: t('lab_management.resultsReady'), value: tests.filter(t => t.status === 'results_ready').length, color: 'text-green-600 dark:text-green-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'ordered', 'sample_scheduled', 'sample_collected', 'processing', 'results_ready'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterStatus === s
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400'
            }`}>
            {s === 'all' ? t('lab_management.allTests') : t(`patient_labtests.${toCamelCase(s)}`) || s}
          </button>
        ))}
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {filtered.map(test => {
          const currentStepIdx = LAB_STATUS_STEPS.indexOf(test.status as any);
          const isExpanded = expandedId === test.id;
          const canAdvance = currentStepIdx < LAB_STATUS_STEPS.length - 2 && test.status !== 'results_ready';
          const isUpdating = updatingId === test.id;

          return (
            <div key={test.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{test.test_name}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${test.priority === 'stat' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        test.priority === 'urgent' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {test.priority === 'stat' ? `🔴 ${t('lab_management.stat')}` : test.priority === 'urgent' ? `🟠 ${t('lab_management.urgent')}` : t('lab_management.routine')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t('lab_management.patient')}: <span className="font-medium text-slate-700 dark:text-slate-300">{getPatientName(test.patient_id, test)}</span>
                      · {t('lab_management.ordered')}: {format(new Date(test.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight ${getLabStatusColor(test.status as any)}`}>
                    {t(`patient_labtests.${toCamelCase(test.status)}`) || test.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-700"
                      style={{ width: `${(currentStepIdx / (LAB_STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {LAB_STATUS_STEPS.map((s, i) => (
                      <div key={s} className={`text-xs ${i <= currentStepIdx ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-600'}`}>
                        {i === 0 ? t('lab_management.ordered') : i === LAB_STATUS_STEPS.length - 1 ? t('patient_labtests.reviewed') : ''}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {canAdvance && (
                    <div className="flex gap-2 flex-1">
                      <input type="text" placeholder={t('lab_management.addNote')}
                        value={uploadNote[test.id] || ''}
                        onChange={e => setUploadNote(prev => ({ ...prev, [test.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={() => advanceStatus(test.id)} disabled={isUpdating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60">
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {t('lab_management.advance')}: {t(`patient_labtests.${toCamelCase(LAB_STATUS_STEPS[Math.min(currentStepIdx + 1, LAB_STATUS_STEPS.length - 1)])}`) || LAB_STATUS_STEPS[Math.min(currentStepIdx + 1, LAB_STATUS_STEPS.length - 1)]}
                      </button>
                    </div>
                  )}

                  {test.status === 'processing' && (
                    <div className="flex gap-2 flex-1">
                      <input type="text" placeholder={t('lab_management.enterResult')}
                        value={resultInputs[test.id] || ''}
                        onChange={e => setResultInputs(prev => ({ ...prev, [test.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 text-sm border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <button onClick={() => uploadResult(test.id)} disabled={isUpdating || !resultInputs[test.id]}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {t('lab_management.uploadResult')}
                      </button>
                    </div>
                  )}

                  {test.status === 'results_ready' && (
                    <span className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" /> {t('lab_management.resultsVisible')}
                    </span>
                  )}

                  <button onClick={() => setExpandedId(isExpanded ? null : test.id)}
                    className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors whitespace-nowrap">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {isExpanded ? t('lab_management.hideSteps') : t('lab_management.showSteps')}
                  </button>
                </div>
              </div>

              {/* Steps Expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-slate-200 dark:border-slate-700 px-5 py-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t('lab_management.timeline')}</p>
                      {(test.steps || []).map((step: any, i: number) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                            {i < (test.steps || []).length - 1 && <div className="w-px h-full min-h-[16px] bg-slate-200 dark:bg-slate-700 mt-1" />}
                          </div>
                          <div className="pb-3">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{step.step}</p>
                            {step.completedAt && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(step.completedAt), 'MMM d, yyyy · h:mm a')}</p>
                            )}
                            {step.note && <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-0.5">{step.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{t('lab_management.noTestsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
