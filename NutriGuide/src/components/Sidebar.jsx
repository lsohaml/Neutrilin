import { LayoutDashboard, Utensils, Brain, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Utensils, label: 'Food Log', to: '/log' },
    { icon: Brain, label: 'Insights', to: '/insights' },
    { icon: User, label: 'Profile', to: '/profile' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col p-4 fixed left-0 top-0">
      <div className="p-4 mb-8">
        <h1 className="text-2xl font-black text-brand-600 tracking-tighter italic">Neutrilin</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link key={item.label} to={item.to} className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all group">
            <item.icon size={20} className="group-hover:text-brand-600" />
            <span className="font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}