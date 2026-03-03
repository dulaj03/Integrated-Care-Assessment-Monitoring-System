import { useState } from 'react';
import { FlaskConical, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Upload, Plus, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import {
  MOCK_LAB_TESTS,
  LabTest,
  LabTestStatus,
  LAB_STATUS_STEPS,
  getLabStatusLabel,
  getLabStatusColor,
} from '../../lib/hospitalData';
import { MOCK_PATIENTS } from '../../lib/mockData';

export function LabManagement() {
  const [tests, setTests] = useState<LabTest[]>(MOCK_LAB_TESTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [uploadNote, setUploadNote] = useState<Record<string, string>>({});

  const getPatientName = (id: string) => MOCK_PATIENTS.find(p => p.id === id)?.name || id;

  const filtered = filterStatus === 'all' ? tests : tests.filter(t => t.status === filterStatus);

  const advanceStatus = (testId: string) => {
    setUpdatingId(testId);
    setTimeout(() => {
      setTests(prev => prev.map(t => {
        if (t.id !== testId) return t;
        const currentIdx = LAB_STATUS_STEPS.indexOf(t.status);
        if (currentIdx >= LAB_STATUS_STEPS.length - 2) return t; // don't auto-advance to 'reviewed'
        const nextStatus = LAB_STATUS_STEPS[currentIdx + 1];
        const newStep = {
          step: getLabStatusLabel(nextStatus),
          completedAt: new Date().toISOString(),
          note: uploadNote[testId] || undefined,
        };
        return {
          ...t,
          status: nextStatus,
          steps: [...t.steps, newStep],
        };
      }));
      setUpdatingId(null);
      setUploadNote(prev => ({ ...prev, [testId]: '' }));
    }, 800);
  };

  const uploadResult = (testId: string) => {
    const summary = resultInputs[testId];
    if (!summary) return;
    setUpdatingId(testId);
    setTimeout(() => {
      setTests(prev => prev.map(t => {
        if (t.id !== testId) return t;
        return {
          ...t,
          status: 'results_ready',
          completedDate: new Date().toISOString(),
          result: {
            summary,
            reviewNote: undefined,
          },
          steps: [...t.steps, {
            step: 'Results reviewed and released to patient',
            completedAt: new Date().toISOString(),
          }],
        };
      }));
      setResultInputs(prev => ({ ...prev, [testId]: '' }));
      setUpdatingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lab Management</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update test progress and upload results for patients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: tests.length, color: 'text-slate-900 dark:text-white' },
          { label: 'Ordered / Pending', value: tests.filter(t => t.status === 'ordered').length, color: 'text-slate-600 dark:text-slate-400' },
          { label: 'In Progress', value: tests.filter(t => ['sample_scheduled', 'sample_collected', 'processing'].includes(t.status)).length, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Results Ready', value: tests.filter(t => t.status === 'results_ready').length, color: 'text-green-600 dark:text-green-400' },
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
            {s === 'all' ? 'All' : getLabStatusLabel(s as LabTestStatus)}
          </button>
        ))}
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {filtered.map(test => {
          const currentStepIdx = LAB_STATUS_STEPS.indexOf(test.status);
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
                      <h3 className="font-bold text-slate-900 dark:text-white">{test.testName}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${test.priority === 'stat' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          test.priority === 'urgent' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                        {test.priority === 'stat' ? '🔴 STAT' : test.priority === 'urgent' ? '🟠 Urgent' : 'Routine'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Patient: <span className="font-medium text-slate-700 dark:text-slate-300">{getPatientName(test.patientId)}</span>
                      · Ordered: {format(new Date(test.orderedDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getLabStatusColor(test.status)}`}>
                    {getLabStatusLabel(test.status)}
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
                        {i === 0 ? 'Ordered' : i === LAB_STATUS_STEPS.length - 1 ? 'Reviewed' : ''}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {canAdvance && (
                    <div className="flex gap-2 flex-1">
                      <input type="text" placeholder="Add a note (optional)..."
                        value={uploadNote[test.id] || ''}
                        onChange={e => setUploadNote(prev => ({ ...prev, [test.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={() => advanceStatus(test.id)} disabled={isUpdating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60">
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Advance: {getLabStatusLabel(LAB_STATUS_STEPS[Math.min(currentStepIdx + 1, LAB_STATUS_STEPS.length - 1)])}
                      </button>
                    </div>
                  )}

                  {test.status === 'processing' && (
                    <div className="flex gap-2 flex-1">
                      <input type="text" placeholder="Enter result summary..."
                        value={resultInputs[test.id] || ''}
                        onChange={e => setResultInputs(prev => ({ ...prev, [test.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 text-sm border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <button onClick={() => uploadResult(test.id)} disabled={isUpdating || !resultInputs[test.id]}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload Result
                      </button>
                    </div>
                  )}

                  {test.status === 'results_ready' && (
                    <span className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" /> Results uploaded and visible to patient
                    </span>
                  )}

                  <button onClick={() => setExpandedId(isExpanded ? null : test.id)}
                    className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors whitespace-nowrap">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {isExpanded ? 'Hide' : 'Show'} steps
                  </button>
                </div>
              </div>

              {/* Steps Expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-slate-200 dark:border-slate-700 px-5 py-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Progress Timeline</p>
                      {test.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                            {i < test.steps.length - 1 && <div className="w-px h-full min-h-[16px] bg-slate-200 dark:bg-slate-700 mt-1" />}
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
            <p className="font-medium">No tests found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
