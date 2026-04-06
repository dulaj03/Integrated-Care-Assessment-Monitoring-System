import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope,
  Heart,
  Users,
  ShieldCheck,
  Bell,
  FlaskConical,
  Clipboard,
  Building2,
  Activity,
  Zap,
  MessageSquare,
  Globe,
} from 'lucide-react';

// Duration before fading out (ms)
const DISPLAY_DURATION = 3400;

interface SplashScreenProps {
  onComplete: () => void;
}

const floatingIcons = [
  { Icon: Stethoscope, x: '8%',  y: '12%',  size: 'w-20 h-20', delay: 0,    dur: 7  },
  { Icon: Heart,       x: '82%', y: '8%',   size: 'w-14 h-14', delay: 0.5,  dur: 9  },
  { Icon: Users,       x: '90%', y: '55%',  size: 'w-24 h-24', delay: 1,    dur: 8  },
  { Icon: ShieldCheck, x: '5%',  y: '70%',  size: 'w-16 h-16', delay: 0.3,  dur: 10 },
  { Icon: Bell,        x: '75%', y: '80%',  size: 'w-12 h-12', delay: 0.8,  dur: 6  },
  { Icon: FlaskConical,x: '18%', y: '85%',  size: 'w-18 h-18', delay: 0.2,  dur: 11 },
  { Icon: Clipboard,   x: '65%', y: '15%',  size: 'w-16 h-16', delay: 1.2,  dur: 8  },
  { Icon: Building2,   x: '48%', y: '5%',   size: 'w-12 h-12', delay: 0.6,  dur: 9  },
  { Icon: Activity,    x: '92%', y: '25%',  size: 'w-14 h-14', delay: 0.9,  dur: 7  },
  { Icon: Zap,         x: '3%',  y: '40%',  size: 'w-10 h-10', delay: 0.4,  dur: 8  },
  { Icon: MessageSquare,x:'40%', y: '88%',  size: 'w-14 h-14', delay: 1.4,  dur: 10 },
  { Icon: Globe,       x: '55%', y: '78%',  size: 'w-16 h-16', delay: 0.7,  dur: 9  },
];

const taglines = [
  { text: "Sri Lanka's First Integrated Care Platform", delay: 0.5 },
  { text: 'Bridging the Gap · Smart Workflows',         delay: 0.85 },
  { text: 'I-CAMS connects patients, nurses, and doctors in a unified platform for reliable, innovative, and accessible healthcare management. Real-time monitoring, seamless communication.', delay: 1.2, small: true },
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DISPLAY_DURATION);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="splash-root"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #0e7490 80%, #0f172a 100%)',
            overflow: 'hidden',
          }}
        >
          {/* ── Radial glow behind centre ── */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* ── Floating background icons ── */}
          {floatingIcons.map(({ Icon, x, y, size, delay, dur }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.07, y: [0, -18, 0] }}
              transition={{
                opacity: { duration: 0.8, delay },
                y: { duration: dur, repeat: Infinity, ease: 'easeInOut', delay },
              }}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                color: 'white',
              }}
            >
              <Icon className={size} />
            </motion.div>
          ))}

          {/* ── Logo ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 40 }}
          >
            {/* Logo image */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              borderRadius: 24,
              padding: '20px 32px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src="/logo.PNG"
                alt="I-CAMS Logo"
                style={{ height: 80, width: 'auto', objectFit: 'contain' }}
              />
            </div>
          </motion.div>

          {/* ── Taglines ── */}
          <div style={{ textAlign: 'center', maxWidth: 620, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {taglines.map(({ text, delay, small }, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay, ease: 'easeOut' }}
                style={{
                  color: small ? 'rgba(186,230,253,0.82)' : 'white',
                  fontSize: small ? '0.88rem' : i === 0 ? '1.05rem' : '1.35rem',
                  fontWeight: small ? 400 : i === 0 ? 600 : 700,
                  lineHeight: small ? 1.6 : 1.3,
                  letterSpacing: i === 0 ? '0.12em' : 'normal',
                  textTransform: i === 0 ? 'uppercase' : 'none',
                  margin: 0,
                }}
              >
                {/* Badge for first tagline */}
                {i === 0 ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(59,130,246,0.25)',
                    border: '1px solid rgba(96,165,250,0.45)',
                    borderRadius: 9999,
                    padding: '6px 18px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#93c5fd',
                  }}>
                    <Zap style={{ width: 14, height: 14 }} />
                    {text}
                  </span>
                ) : text}
              </motion.p>
            ))}
          </div>

          {/* ── Loading bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            style={{ marginTop: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          >
            {/* Track */}
            <div style={{
              width: 220,
              height: 3,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 9999,
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: DISPLAY_DURATION / 1000 - 1.5, ease: 'easeInOut', delay: 1.5 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #60a5fa, #38bdf8, #34d399)',
                  borderRadius: 9999,
                  boxShadow: '0 0 10px rgba(96,165,250,0.7)',
                }}
              />
            </div>

            {/* Pulsing dots */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #60a5fa, #38bdf8)',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Footer brand text ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2, duration: 0.6 }}
            style={{
              position: 'absolute',
              bottom: 28,
              color: 'rgba(186,230,253,0.65)',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Integrated Care & Management System
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
