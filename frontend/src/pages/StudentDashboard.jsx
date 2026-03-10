import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { studentsApi, marksApi, leaveApi, reportApi } from '../api.js';
import {
  Modal, Toast, Spinner, Badge, Field, Input, Select, Btn, Empty,
} from '../components/ui.jsx';

const TABS = [
  { id: 'marks',  icon: '📝', label: 'My Marks'   },
  { id: 'leave',  icon: '📋', label: 'My Leave'   },
  { id: 'report', icon: '📊', label: 'My Report'  },
];

/* ══════════════ PROFILE SELECTOR ══════════════ */
function ProfileSelector({ token, onSelect }) {
  const [students, setStudents] = useState([]);
  const [chosen,   setChosen]   = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    studentsApi.getAll(token).then(setStudents).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #1e1b4b44, transparent 60%), #080b14' }}
    >
      <div className="w-full max-w-sm fade-up text-center">
        <div className="text-5xl mb-4">🎒</div>
        <h2 className="font-heading text-2xl font-bold text-white mb-2">Select Your Profile</h2>
        <p className="text-sm text-slate-500 mb-7">Choose your student record to continue</p>

        <div
          className="rounded-2xl p-6"
          style={{ background: '#0f1623', border: '1px solid #1e2d45' }}
        >
          {loading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : (
            <div className="flex flex-col gap-3">
              <Field label="Your Name">
                <Select value={chosen} onChange={e => setChosen(e.target.value)}>
                  <option value="">Select student…</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Roll {s.roll_number} ({s.class_name})
                    </option>
                  ))}
                </Select>
              </Field>
              <Btn onClick={() => chosen && onSelect(chosen, students.find(s=>s.id===chosen))} className="w-full mt-1">
                Continue →
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════ MY MARKS ══════════════ */
function MyMarksTab({ token, studentId, onToast }) {
  const [marks,   setMarks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', exam: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setMarks(await marksApi.getAll(token, { student_id: studentId, ...filters })); }
    catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token, studentId, filters]);

  useEffect(() => { load(); }, [load]);

  const pct = (m, mx) => mx ? Math.round((m / mx) * 100) : 0;

  return (
    <div className="fade-up">
      <div className="mb-5">
        <h2 className="font-heading text-xl font-semibold text-white">My Marks</h2>
        <p className="text-sm text-slate-500 mt-0.5">{marks.length} entries</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Input placeholder="Filter by subject…" value={filters.subject} onChange={e => setFilters(f=>({...f,subject:e.target.value}))} />
        <Input placeholder="Filter by exam…"    value={filters.exam}    onChange={e => setFilters(f=>({...f,exam:e.target.value}))} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : marks.length === 0 ? (
        <Empty message="No marks found." />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {marks.map(m => {
            const p = pct(m.marks, m.max_marks);
            const color = p >= 75 ? '#4ade80' : p >= 50 ? '#fbbf24' : '#f87171';
            return (
              <div
                key={m.id}
                className="rounded-xl px-5 py-4 flex items-center justify-between"
                style={{ background: '#0f1623', border: '1px solid #1a2236' }}
              >
                <div>
                  <p className="font-medium text-white">{m.subject}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{m.exam}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-bold text-white">
                    {m.marks}<span className="text-slate-600 text-sm">/{m.max_marks}</span>
                  </p>
                  <p className="text-sm font-medium" style={{ color }}>{p}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════ MY LEAVE ══════════════ */
function MyLeaveTab({ token, studentId, onToast }) {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ reason: '', from_date: '', to_date: '' });
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await leaveApi.getAll(token);
      setLeaves(all.filter(l => l.student_id === studentId));
    } catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token, studentId]);

  useEffect(() => { load(); }, [load]);

  const apply = async () => {
    if (!form.reason || !form.from_date || !form.to_date) return onToast('All fields required.', 'error');
    setSaving(true);
    try {
      await leaveApi.apply(token, { student_id: studentId, ...form });
      onToast('Leave application submitted!');
      setModal(false);
      setForm({ reason: '', from_date: '', to_date: '' });
      load();
    } catch (e) { onToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">My Leave Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">{leaves.length} applications</p>
        </div>
        <Btn onClick={() => setModal(true)}>＋ Apply Leave</Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : leaves.length === 0 ? (
        <Empty message="No leave applications yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {leaves.map(l => (
            <div
              key={l.id}
              className="rounded-xl px-5 py-4"
              style={{ background: '#0f1623', border: '1px solid #1a2236' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{l.reason}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {l.from_date} → {l.to_date}
                  </p>
                </div>
                <Badge status={l.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Apply for Leave" onClose={() => setModal(false)}>
          <div className="flex flex-col gap-4">
            <Field label="Reason">
              <textarea
                placeholder="Reason for leave…"
                value={form.reason}
                onChange={e => setForm(f=>({...f,reason:e.target.value}))}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none"
                style={{ background: '#0a0f1a', border: '1px solid #1e2d45', fontFamily: 'DM Sans, sans-serif' }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From Date">
                <Input type="date" value={form.from_date} onChange={e => setForm(f=>({...f,from_date:e.target.value}))}
                  style={{ colorScheme: 'dark' }} />
              </Field>
              <Field label="To Date">
                <Input type="date" value={form.to_date} onChange={e => setForm(f=>({...f,to_date:e.target.value}))}
                  style={{ colorScheme: 'dark' }} />
              </Field>
            </div>
            <div className="flex gap-2 mt-1">
              <Btn variant="ghost" onClick={() => setModal(false)} className="flex-1">Cancel</Btn>
              <Btn onClick={apply} disabled={saving} className="flex-1">{saving ? <Spinner size={14}/> : 'Submit'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════ MY REPORT ══════════════ */
function MyReportTab({ token, studentId, student, onToast }) {
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    reportApi.get(token, studentId)
      .then(setReport)
      .catch(e => onToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [token, studentId]);

  const gradeColor = (g) =>
    ({ A:'#4ade80', B:'#60a5fa', C:'#fbbf24', D:'#fb923c', F:'#f87171' }[g] || '#94a3b8');

  const overallGrade = () => {
    if (!report) return null;
    const entries = Object.values(report);
    if (!entries.length) return null;
    const avg = entries.reduce((s, e) => s + e.average, 0) / entries.length;
    if (avg >= 90) return 'A';
    if (avg >= 75) return 'B';
    if (avg >= 60) return 'C';
    if (avg >= 50) return 'D';
    return 'F';
  };

  const grade = overallGrade();

  return (
    <div className="fade-up">
      <div className="mb-5">
        <h2 className="font-heading text-xl font-semibold text-white">My Report Card</h2>
        <p className="text-sm text-slate-500 mt-0.5">Subject-wise performance overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : !report ? (
        <Empty message="Could not load report." />
      ) : (
        <div className="scale-in">
          {/* Summary banner */}
          {grade && (
            <div
              className="rounded-2xl p-6 mb-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', border: '1px solid #312e81' }}
            >
              <div>
                <p className="text-slate-400 text-sm">Overall Performance</p>
                <p className="font-heading text-3xl font-bold text-white mt-1">{student?.name}</p>
                <p className="text-indigo-300 text-sm mt-0.5">
                  Roll #{student?.roll_number} · {student?.class_name}
                </p>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading text-3xl font-black"
                style={{ background: gradeColor(grade) + '22', color: gradeColor(grade) }}
              >
                {grade}
              </div>
            </div>
          )}

          {Object.keys(report).length === 0 ? (
            <Empty message="No marks data yet." />
          ) : (
            <div className="grid gap-3">
              {Object.entries(report).map(([subject, data]) => (
                <div
                  key={subject}
                  className="rounded-xl px-5 py-4 flex items-center justify-between"
                  style={{ background: '#0f1623', border: '1px solid #1a2236' }}
                >
                  <div>
                    <p className="font-medium text-white">{subject}</p>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ width: 120, background: '#1a2236' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(data.average, 100)}%`, background: gradeColor(data.grade) }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Average</p>
                      <p className="font-medium text-white">{data.average?.toFixed(1)}</p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-heading text-lg font-bold"
                      style={{ background: gradeColor(data.grade) + '22', color: gradeColor(data.grade) }}
                    >
                      {data.grade}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════ MAIN ══════════════ */
export default function StudentDashboard({ auth, onLogout }) {
  const [tab,       setTab]       = useState('marks');
  const [studentId, setStudentId] = useState(null);
  const [student,   setStudent]   = useState(null);
  const [toast,     setToast]     = useState(null);

  const notify = (message, type = 'success') => setToast({ message, type });

  if (!studentId) {
    return (
      <>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <ProfileSelector
          token={auth.token}
          onSelect={(id, s) => { setStudentId(id); setStudent(s); }}
        />
      </>
    );
  }

  const renderTab = () => {
    const props = { token: auth.token, studentId, student, onToast: notify };
    switch (tab) {
      case 'marks':  return <MyMarksTab  {...props} />;
      case 'leave':  return <MyLeaveTab  {...props} />;
      case 'report': return <MyReportTab {...props} />;
      default:       return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <Sidebar
        tabs={TABS}
        active={tab}
        onSelect={setTab}
        userName={student?.name || 'Student'}
        role="student"
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-y-auto p-8" style={{ background: '#080b14' }}>
        {renderTab()}
      </main>
    </div>
  );
}
