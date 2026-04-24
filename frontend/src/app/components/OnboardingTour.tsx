import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, CheckCircle2, Info } from 'lucide-react';

interface OnboardingStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: OnboardingStep[] = [
    {
      targetId: 'onboarding-welcome',
      title: 'Welcome to your Dashboard! 👋',
      content: 'Here you can see your current health status and quickly log your vitals or book hospital visits.',
      position: 'bottom'
    },
    {
      targetId: 'onboarding-vitals',
      title: 'Real-time Health Vitals 💓',
      content: 'Monitor your blood pressure, heart rate, temperature, and oxygen levels at a glance. We flag critical readings instantly.',
      position: 'bottom'
    },
    {
      targetId: 'onboarding-actions',
      title: 'Smart Clinical Actions ⚡',
      content: 'Access your lab test results, doctor orders, and nursing shift reports all in one integrated view.',
      position: 'top'
    },
    {
      targetId: 'onboarding-charts',
      title: 'Track Your Progress 📈',
      content: 'Interact with high-resolution health trend charts to observe your journey toward recovery over days or weeks.',
      position: 'top'
    },
    {
      targetId: 'onboarding-appointments',
      title: 'Care Journey Management 🗓️',
      content: 'Track your upcoming appointments and follow your real-time care journey as it happens in the hospital.',
      position: 'left'
    }
  ];

  const userId = sessionStorage.getItem('userId');
  const tourKey = `icams_dashboard_tour_completed_${userId}`;

  useEffect(() => {
    // Only show the tour when the user has just created a new account.
    // VerifyEmail.tsx sets this flag on first-time patient auto-login.
    // It is never set on regular logins, so returning users never see the tour again.
    const shouldShow = sessionStorage.getItem('icams_show_tour') === 'true';
    if (!shouldShow) return;

    // Small delay to let the dashboard render fully before the tour overlay appears
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const target = document.getElementById(steps[currentStepIdx].targetId);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // If target not on screen (e.g. pending banner), skip it
        handleNext();
      }
    }
  }, [isVisible, currentStepIdx]);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    // Clear the one-time session flag so the tour never re-appears after this
    sessionStorage.removeItem('icams_show_tour');
    // Also persist to localStorage so it stays dismissed even if sessionStorage is somehow re-set
    if (userId) {
      localStorage.setItem(tourKey, 'true');
    }
  };

  if (!isVisible || !targetRect) return null;

  const currentStep = steps[currentStepIdx];

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 20;
    
    switch (currentStep.position) {
    case 'bottom':
      return {
        top: targetRect.bottom + padding,
        left: targetRect.left + (targetRect.width / 2),
        transform: 'translateX(-50%)',
      };
    case 'top':
      return {
        top: targetRect.top - padding,
        left: targetRect.left + (targetRect.width / 2),
        transform: 'translate(-50%, -100%)',
      };
    case 'left':
      return {
        top: targetRect.top + (targetRect.height / 2),
        left: targetRect.left - padding,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        top: targetRect.top + (targetRect.height / 2),
        left: targetRect.right + padding,
        transform: 'translate(0, -50%)',
      };
    default:
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Dim Overlay with Spotlight cutout */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto transition-all duration-500"
        style={{
          maskImage: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 1.4}px, black ${Math.max(targetRect.width, targetRect.height) / 1.4 + 20}px)`,
          WebkitMaskImage: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 1.4}px, black ${Math.max(targetRect.width, targetRect.height) / 1.4 + 20}px)`,
        }}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="absolute bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900 shadow-2xl rounded-2xl p-6 w-80 pointer-events-auto"
          style={getTooltipStyle()}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Info className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{currentStep.title}</h4>
            </div>
            <button onClick={completeTour} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {currentStep.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStepIdx ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} 
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {currentStepIdx === steps.length - 1 ? (
                <>Finish <CheckCircle2 className="h-3 w-3" /></>
              ) : (
                <>Next <ChevronRight className="h-3 w-3" /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
