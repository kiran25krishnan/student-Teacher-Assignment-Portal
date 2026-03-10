import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { studentsApi, marksApi, leaveApi, reportApi } from '../api.js';
import {
  Modal, Toast, Spinner, Badge, Field, Input, Select, Btn, Empty,
} from '../components/ui.jsx';

const TABS = [
  { id: 'students', icon: '👥', label: 'Students'      },
  { id: 'marks',    icon: '📝', label: 'Marks'         },
  { id: 'leave',    icon: '📋', label: 'Leave Requests'},
  { id: 'reports',  icon: '📊', label: 'Reports'       },
];

/* ───────────── tiny reusable table shell ───────────── */
function Table({ cols, rows, renderRow, loading }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #1a2236' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#0b0f1c', borderBottom: '1px solid #1a2236' }}>
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={cols.length} className="py-12 text-center"><Spinner /></td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={cols.length}><Empty /></td></tr>
          ) : rows.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════ STUDENTS ══════════════ */
function StudentsTab({ token, onToast }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ name: '', roll_number: '', class_name: '' });
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setStudents(await studentsApi.getAll(token)); }
    catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name || !form.roll_number || !form.class_name) return onToast('All fields required.', 'error');
    setSaving(true);
    try {
      await studentsApi.create(token, { ...form, roll_number: Number(form.roll_number) });
      onToast('Student added!');
      setModal(false);
      setForm({ name: '', roll_number: '', class_name: '' });
      load();
    } catch (e) { onToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">Students</h2>
          <p className="text-sm text-slate-500 mt-0.5">{students.length} registered</p>
        </div>
        <Btn onClick={() => setModal(true)}>＋ Add Student</Btn>
      </div>

      <Table
        loading={loading}
        cols={['Name', 'Roll Number', 'Class', 'Student ID']}
        rows={students}
        renderRow={(s) => (
          <tr key={s.id} className="border-t" style={{ borderColor: '#1a2236' }}
              onMouseEnter={e => e.currentTarget.style.background='#ffffff05'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <td className="px-4 py-3 font-medium text-white">{s.name}</td>
            <td className="px-4 py-3 text-slate-400">{s.roll_number}</td>
            <td className="px-4 py-3 text-slate-400">{s.class_name}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.id}</td>
          </tr>
        )}
      />

      {modal && (
        <Modal title="Add New Student" onClose={() => setModal(false)}>
          <div className="flex flex-col gap-4">
            <Field label="Full Name"><Input placeholder="Jane Smith" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></Field>
            <Field label="Roll Number"><Input type="number" placeholder="101" value={form.roll_number} onChange={e => setForm(f=>({...f,roll_number:e.target.value}))} /></Field>
            <Field label="Class"><Input placeholder="10-A" value={form.class_name} onChange={e => setForm(f=>({...f,class_name:e.target.value}))} /></Field>
            <div className="flex gap-2 mt-1">
              <Btn variant="ghost" onClick={() => setModal(false)} className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1">{saving ? <Spinner size={14}/> : 'Add Student'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════ MARKS ══════════════ */
function MarksTab({ token, onToast }) {
  const [marks,    setMarks]    = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filters,  setFilters]  = useState({ student_id: '', subject: '', exam: '' });
  const [modal,    setModal]    = useState(null); // null | 'add' | markObj
  const [form,     setForm]     = useState({ student_id:'', subject:'', exam:'', marks:'', max_marks:'' });
  const [saving,   setSaving]   = useState(false);

  const loadStudents = useCallback(async () => {
    try { setStudents(await studentsApi.getAll(token)); }
    catch {}
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMarks(await marksApi.getAll(token, filters)); }
    catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token, filters]);

  useEffect(() => { loadStudents(); }, [loadStudents]);
  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({ student_id:'', subject:'', exam:'', marks:'', max_marks:'' }); setModal('add'); };
  const openEdit = (m) => { setForm({ student_id:m.student_id, subject:m.subject, exam:m.exam, marks:String(m.marks), max_marks:String(m.max_marks) }); setModal(m); };

  const save = async () => {
    if (!form.student_id || !form.subject || !form.exam || !form.marks || !form.max_marks)
      return onToast('All fields required.', 'error');
    setSaving(true);
    try {
      const payload = { ...form, marks: Number(form.marks), max_marks: Number(form.max_marks) };
      if (modal === 'add') await marksApi.create(token, payload);
      else                 await marksApi.update(token, modal.id, payload);
      onToast(modal === 'add' ? 'Marks added!' : 'Marks updated!');
      setModal(null);
      load();
    } catch (e) { onToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this mark entry?')) return;
    try { await marksApi.delete(token, id); onToast('Deleted.'); load(); }
    catch (e) { onToast(e.message, 'error'); }
  };

  const pct = (m, mx) => mx ? Math.round((m / mx) * 100) : 0;

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">Marks</h2>
          <p className="text-sm text-slate-500 mt-0.5">{marks.length} entries</p>
        </div>
        <Btn onClick={openAdd}>＋ Add Marks</Btn>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Select value={filters.student_id} onChange={e => setFilters(f=>({...f,student_id:e.target.value}))}>
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
        </Select>
        <Input placeholder="Filter by subject…" value={filters.subject} onChange={e => setFilters(f=>({...f,subject:e.target.value}))} />
        <Input placeholder="Filter by exam…"    value={filters.exam}    onChange={e => setFilters(f=>({...f,exam:e.target.value}))} />
      </div>

      <Table
        loading={loading}
        cols={['Student ID', 'Subject', 'Exam', 'Score', '%', 'Actions']}
        rows={marks}
        renderRow={(m) => (
          <tr key={m.id} className="border-t" style={{ borderColor: '#1a2236' }}
              onMouseEnter={e => e.currentTarget.style.background='#ffffff05'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <td className="px-4 py-3 font-mono text-xs text-slate-500">{m.student_id}</td>
            <td className="px-4 py-3 text-white font-medium">{m.subject}</td>
            <td className="px-4 py-3 text-slate-400">{m.exam}</td>
            <td className="px-4 py-3 text-white">{m.marks}<span className="text-slate-600">/{m.max_marks}</span></td>
            <td className="px-4 py-3">
              <span style={{ color: pct(m.marks,m.max_marks)>=75?'#4ade80':pct(m.marks,m.max_marks)>=50?'#fbbf24':'#f87171' }}>
                {pct(m.marks,m.max_marks)}%
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <Btn variant="ghost" className="px-2 py-1 text-xs" onClick={() => openEdit(m)}>Edit</Btn>
                <Btn variant="danger" className="px-2 py-1 text-xs" onClick={() => del(m.id)}>Del</Btn>
              </div>
            </td>
          </tr>
        )}
      />

      {modal && (
        <Modal title={modal === 'add' ? 'Add Marks' : 'Edit Marks'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <Field label="Student">
              <Select value={form.student_id} onChange={e => setForm(f=>({...f,student_id:e.target.value}))}>
                <option value="">Select student…</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Subject"><Input placeholder="Mathematics" value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} /></Field>
              <Field label="Exam"><Input placeholder="Mid-Term" value={form.exam} onChange={e => setForm(f=>({...f,exam:e.target.value}))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marks"><Input type="number" placeholder="85" value={form.marks} onChange={e => setForm(f=>({...f,marks:e.target.value}))} /></Field>
              <Field label="Max Marks"><Input type="number" placeholder="100" value={form.max_marks} onChange={e => setForm(f=>({...f,max_marks:e.target.value}))} /></Field>
            </div>
            <div className="flex gap-2 mt-1">
              <Btn variant="ghost" onClick={() => setModal(null)} className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1">{saving ? <Spinner size={14}/> : 'Save'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════ LEAVE ══════════════ */
function LeaveTab({ token, onToast }) {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setLeaves(await leaveApi.getAll(token)); }
    catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    try {
      if (action === 'approve') await leaveApi.approve(token, id);
      else                      await leaveApi.reject(token, id);
      onToast(action === 'approve' ? 'Leave approved.' : 'Leave rejected.');
      load();
    } catch (e) { onToast(e.message, 'error'); }
  };

  return (
    <div className="fade-up">
      <div className="mb-5">
        <h2 className="font-heading text-xl font-semibold text-white">Leave Requests</h2>
        <p className="text-sm text-slate-500 mt-0.5">{leaves.length} total requests</p>
      </div>

      <Table
        loading={loading}
        cols={['Student ID', 'Reason', 'From', 'To', 'Status', 'Actions']}
        rows={leaves}
        renderRow={(l) => (
          <tr key={l.id} className="border-t" style={{ borderColor: '#1a2236' }}
              onMouseEnter={e => e.currentTarget.style.background='#ffffff05'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.student_id}</td>
            <td className="px-4 py-3 text-white max-w-xs truncate">{l.reason}</td>
            <td className="px-4 py-3 text-slate-400">{l.from_date}</td>
            <td className="px-4 py-3 text-slate-400">{l.to_date}</td>
            <td className="px-4 py-3"><Badge status={l.status} /></td>
            <td className="px-4 py-3">
              {l.status === 'pending' && (
                <div className="flex gap-2">
                  <Btn variant="success" className="px-2 py-1 text-xs" onClick={() => act(l.id,'approve')}>Approve</Btn>
                  <Btn variant="danger"  className="px-2 py-1 text-xs" onClick={() => act(l.id,'reject')}>Reject</Btn>
                </div>
              )}
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* ══════════════ REPORTS ══════════════ */
function ReportsTab({ token, onToast }) {
  const [students,   setStudents]   = useState([]);
  const [studentId,  setStudentId]  = useState('');
  const [report,     setReport]     = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    studentsApi.getAll(token).then(setStudents).catch(() => {});
  }, [token]);

  const fetch_ = async () => {
    if (!studentId) return onToast('Select a student.', 'error');
    setLoading(true);
    try { setReport(await reportApi.get(token, studentId)); }
    catch (e) { onToast(e.message, 'error'); setReport(null); }
    finally { setLoading(false); }
  };

  const student = students.find(s => s.id === studentId);

  const gradeColor = (g) =>
    ({ A:'#4ade80', B:'#60a5fa', C:'#fbbf24', D:'#fb923c', F:'#f87171' }[g] || '#94a3b8');

  return (
    <div className="fade-up">
      <div className="mb-5">
        <h2 className="font-heading text-xl font-semibold text-white">Student Reports</h2>
        <p className="text-sm text-slate-500 mt-0.5">Subject-wise performance</p>
      </div>

      <div className="flex gap-3 mb-6">
        <Select className="max-w-xs" value={studentId} onChange={e => { setStudentId(e.target.value); setReport(null); }}>
          <option value="">Select a student…</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} — Roll {s.roll_number}</option>)}
        </Select>
        <Btn onClick={fetch_} disabled={loading}>
          {loading ? <Spinner size={14}/> : 'Generate Report'}
        </Btn>
      </div>

      {report && student && (
        <div className="scale-in">
          {/* Header card */}
          <div
            className="rounded-2xl p-5 mb-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', border: '1px solid #312e81' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                 style={{ background: '#6366f1' }}>
              {student.name[0]}
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-white">{student.name}</p>
              <p className="text-sm text-indigo-300">Roll #{student.roll_number} · Class {student.class_name}</p>
            </div>
          </div>

          {Object.keys(report).length === 0 ? (
            <Empty message="No marks data available for this student." />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(report).map(([subject, data]) => (
                <div
                  key={subject}
                  className="rounded-xl px-5 py-4 flex items-center justify-between"
                  style={{ background: '#0f1623', border: '1px solid #1a2236' }}
                >
                  <div>
                    <p className="font-medium text-white">{subject}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Average: <span className="text-slate-300">{data.average?.toFixed(1)}</span>
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-heading text-xl font-bold"
                    style={{ background: gradeColor(data.grade) + '22', color: gradeColor(data.grade) }}
                  >
                    {data.grade}
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
export default function TeacherDashboard({ auth, onLogout }) {
  const [tab,   setTab]   = useState('students');
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => setToast({ message, type });

  const renderTab = () => {
    const props = { token: auth.token, onToast: notify };
    switch (tab) {
      case 'students': return <StudentsTab {...props} />;
      case 'marks':    return <MarksTab    {...props} />;
      case 'leave':    return <LeaveTab    {...props} />;
      case 'reports':  return <ReportsTab  {...props} />;
      default:         return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <Sidebar
        tabs={TABS}
        active={tab}
        onSelect={setTab}
        userName="Teacher"
        role="teacher"
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-y-auto p-8" style={{ background: '#080b14' }}>
        {renderTab()}
      </main>
    </div>
  );
}
