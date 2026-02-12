export default function Input({ label, ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs font-medium text-slate-600">{label}</div> : null}
      <input
        {...props}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
      />
    </label>
  );
}
