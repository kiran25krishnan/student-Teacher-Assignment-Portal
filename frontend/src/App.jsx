import { useState } from 'react';
import AuthPage from './pages/AuthPage.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import { parseJwt } from './api.js';

export default function App() {
  const [auth, setAuth] = useState(null); // { token, role, userId }

  const handleLogin = (token) => {
    const payload = parseJwt(token);
    setAuth({ token, role: payload?.role || 'student', userId: payload?.user_id });
  };

  const handleLogout = () => setAuth(null);

  if (!auth)
    return <AuthPage onLogin={handleLogin} />;

  if (auth.role === 'teacher')
    return <TeacherDashboard auth={auth} onLogout={handleLogout} />;

  return <StudentDashboard auth={auth} onLogout={handleLogout} />;
}
