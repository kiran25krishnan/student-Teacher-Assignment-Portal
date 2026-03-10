import { useState } from 'react';
import { authApi } from '../api.js';
import { Field, Input, Select, Btn, Toast, Spinner } from '../components/ui.jsx';

export default function AuthPage({ onLogin }) {
  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const notify = (message, type = 'success') => setToast({ message, type });

  const handleSubmit = async () => {
    if (!form.email || !form.password) return notify('Please fill all required fields.', 'error');
    if (mode === 'register' && !form.name) return notify('Name is required.', 'error');

    setLoading(true);
    try {
      if (mode === 'register') {
        await authApi.register({ name: form.name, email: form.email, password: form.password, role: form.role });
        notify('Account created! Please log in.');
        setMode('login');
        setForm(f => ({ ...f, password: '' }));
      } else {
        const data = await authApi.login(form.email, form.password);
        if (data.access_token) {
          onLogin(data.access_token);
        } else {
          notify(data.error || 'Login failed.', 'error');
        }
      }
    } catch (err) {
      notify(err.message || 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #1e1b4b55 0%, transparent 60%), #080b14',
      }}
    >
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px #6366f155' }}
          >
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">School Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Student–Teacher Assignment System</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{ background: '#0f1623', border: '1px solid #1e2d45' }}
        >
          {/* Tab toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: '#080b14' }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background: mode === m ? '#6366f1' : 'transparent',
                  color:      mode === m ? '#fff' : '#94a3b8',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {mode === 'register' && (
              <Field label="Full Name">
                <Input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </Field>
            )}

            <Field label="Email">
              <Input
                type="email"
                placeholder="you@school.edu"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </Field>

            {mode === 'register' && (
              <Field label="Role">
                <Select value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </Select>
              </Field>
            )}

            <Btn
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2 py-3 text-base"
            >
              {loading ? <Spinner size={16} /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Btn>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          FastAPI · MongoDB · React
        </p>
      </div>
    </div>
  );
}
