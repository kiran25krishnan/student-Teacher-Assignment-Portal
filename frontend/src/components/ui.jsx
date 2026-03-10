import { useEffect } from 'react';

/* ── Modal ── */
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="scale-in w-full max-w-md rounded-2xl p-6"
        style={{ background: '#0f1623', border: '1px solid #1e2d45' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Toast ── */
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    error:   'bg-red-500/20 border-red-500/40 text-red-300',
    info:    'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border fade-up font-body text-sm font-medium ${colors[type]}`}
      style={{ maxWidth: 320 }}
    >
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

/* ── Spinner ── */
export function Spinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size, height: size,
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}

/* ── Badge ── */
export function Badge({ status }) {
  const cls = {
    pending:  'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }[status] || 'badge-pending';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

/* ── Field ── */
export function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

/* ── Input ── */
export function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
      style={{
        background: '#0a0f1a',
        border: '1px solid #1e2d45',
        fontFamily: 'DM Sans, sans-serif',
        ...(props.style || {}),
      }}
      onFocus={(e) => { e.target.style.borderColor = '#6366f1'; if (props.onFocus) props.onFocus(e); }}
      onBlur={(e)  => { e.target.style.borderColor = '#1e2d45'; if (props.onBlur)  props.onBlur(e); }}
    />
  );
}

/* ── Select ── */
export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
      style={{
        background: '#0a0f1a',
        border: '1px solid #1e2d45',
        fontFamily: 'DM Sans, sans-serif',
        ...(props.style || {}),
      }}
    >
      {children}
    </select>
  );
}

/* ── Btn ── */
export function Btn({ variant = 'primary', children, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    danger:  'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30',
    ghost:   'bg-white/5 hover:bg-white/10 text-slate-300',
    success: 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30',
  };
  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* ── Empty State ── */
export function Empty({ message = 'No data found' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <div className="text-4xl mb-3">◎</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

/* inject spin keyframe once */
const styleTag = document.createElement('style');
styleTag.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(styleTag);
