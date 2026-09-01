export default function Card({ children, title, subtitle }) {
  return (
    /* 
      bg-white: white background
      rounded-3xl: very round corners (modern look)
      border-slate-100: very subtle grey border
      shadow-sm: soft shadow so it looks like it's floating
    */
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
      {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}