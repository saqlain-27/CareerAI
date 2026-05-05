import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ResumeAnalyzer from './pages/ResumeAnalyzer';

function App() {
  return (
    <Routes>

      <Route path="/" element={<Landing />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;
