import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    /* This flex container keeps Sidebar on left and Content on right */
    <div className="flex min-h-screen bg-slate-50">
      
      {/* 1. Sidebar (Fixed to left) */}
      <Sidebar />

      {/* 2. Main Area (Scrollable) */}
      <main className="flex-1 ml-64 p-12">
        <Dashboard />
      </main>

    </div>
  );
}