import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, Brain, User, LogOut, Scale } from 'lucide-react';
import { api } from './api';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Log from './pages/Log';
import Insights from './pages/Insights';
import Progress from './pages/Progress';
import './index.css';

function Shell({ user, onLogout }) {
  const items = [
    ['/', 'Dashboard', LayoutDashboard], [' /log'.trim(), 'Food Log', Utensils],
    ['/insights', 'Insights', Brain], ['/progress', 'Progress', Scale], ['/profile', 'Profile', User],
  ];
  return <div className="flex min-h-screen bg-slate-50">
    <aside className="w-64 bg-white border-r border-slate-100 p-4 fixed inset-y-0 left-0">
      <div className="p-4 mb-8"><h1 className="text-2xl font-black text-brand-600 tracking-tighter italic">NutriGuide</h1><p className="text-xs text-slate-400 mt-1">Connected to Neutrilin API</p></div>
      <nav className="space-y-2">{items.map(([to,label,Icon]) => <NavLink key={to} to={to} className={({isActive}) => `flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={20}/><span className="font-semibold">{label}</span></NavLink>)}</nav>
      <div className="absolute bottom-4 left-4 right-4"><div className="text-xs text-slate-400 truncate mb-2">{user.email}</div><button onClick={onLogout} className="w-full flex items-center gap-2 p-3 text-slate-500 hover:bg-slate-50 rounded-2xl"><LogOut size={18}/> Sign out</button></div>
    </aside>
    <main className="flex-1 ml-64 p-8 md:p-12"><Routes><Route path="/" element={<Dashboard/>}/><Route path="/log" element={<Log/>}/><Route path="/insights" element={<Insights/>}/><Route path="/progress" element={<Progress/>}/><Route path="/profile" element={<Profile/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></main>
  </div>
}

function AuthenticatedApp({ user, onLogout }) { return <Shell user={user} onLogout={onLogout}/>; }

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('neutrilin_user') || 'null'));
  const [checking, setChecking] = useState(!!localStorage.getItem('neutrilin_token'));
  useEffect(() => { if (!localStorage.getItem('neutrilin_token')) return setChecking(false); api('/health/me').then(r => setUser(r.user)).catch(() => { localStorage.clear(); setUser(null); }).finally(() => setChecking(false)); }, []);
  const logout = () => { localStorage.removeItem('neutrilin_token'); localStorage.removeItem('neutrilin_user'); setUser(null); };
  if (checking) return <div className="min-h-screen grid place-items-center text-slate-500">Connecting to Neutrilin…</div>;
  return <BrowserRouter>{user ? <AuthenticatedApp user={user} onLogout={logout}/> : <Routes><Route path="*" element={<Login onLogin={u => setUser(u)}/>}/></Routes>}</BrowserRouter>;
}
