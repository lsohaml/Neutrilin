import React from 'react';
import { Plus } from 'lucide-react';

export default function AddFoodForm() {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-10">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Log Meal</h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* The Polished Input */}
        <input 
          type="text" 
          placeholder="What did you eat? (e.g. Avocado Toast)"
          className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
        />
        
        <input 
          type="number" 
          placeholder="Calories"
          className="w-full md:w-32 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
        />

        <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-100">
          <Plus size={20} /> Add to Log
        </button>
      </div>
    </div>
  );
}