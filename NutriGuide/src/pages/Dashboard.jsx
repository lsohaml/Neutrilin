import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Brain, ArrowRight } from 'lucide-react';

// 1. IMPORT the form here
import AddFoodForm from '../components/AddFoodForm.jsx';

// 2. We define the Card component here so we can use it below
const Card = ({ children, title }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    {title && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>}
    {children}
  </div>
);

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Good morning, Alex 👋</h2>
        <p className="text-slate-500 font-medium text-lg">Here's your nutrition snapshot for today.</p>
      </header>

      {/* 3. PLACE THE FORM HERE (Above the grid) */}
      <AddFoodForm />

      {/* 4. THE GRID (Below the form) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        
        {/* Card 1: Daily Intake */}
        <Card title="Daily Intake">
          <div className="mt-2 flex items-baseline">
            <span className="text-4xl font-black text-slate-900 tracking-tight">1,420</span>
            <span className="ml-2 text-slate-400 font-medium text-sm italic">kcal</span>
          </div>
        </Card>

        {/* Card 2: Daily Target */}
        <Card title="Daily Target">
          <div className="mt-2 flex items-baseline">
            <span className="text-4xl font-black text-slate-900 tracking-tight">1,800</span>
            <span className="ml-2 text-slate-400 font-medium text-sm italic">kcal</span>
          </div>
        </Card>

        {/* Card 3: Remaining */}
        <Card title="Remaining">
          <div className="mt-2 flex items-baseline">
            <span className="text-4xl font-black text-emerald-600 tracking-tight">380</span>
            <span className="ml-2 text-slate-400 font-medium text-sm italic">kcal</span>
          </div>
        </Card>

        {/* Card 4: Goal Progress */}
        <Card title="Goal Progress">
          <div className="mt-2 flex items-baseline">
            <span className="text-4xl font-black text-slate-900 tracking-tight">75</span>
            <span className="ml-1 text-slate-400 font-bold text-lg">%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{width: '75%'}}></div>
          </div>
        </Card>

      </div>

      {/* Insight Card (Bottom Section) */}
      <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-200 flex justify-between items-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 rounded-xl"><Brain size={28} /></div>
            <h3 className="text-2xl font-bold">Smart Insight</h3>
          </div>
          <p className="text-xl opacity-90 leading-relaxed font-medium">
            "You've used about 79% of your daily calorie target and still have room for your evening meal. Focus on high-protein options to stay full."
          </p>
        </div>
        <button className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg">
          View Details
        </button>
      </div>

    </motion.div>
  );
}