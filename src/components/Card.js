export default function Card({ title, actions, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title ? <h2 className="truncate text-sm font-semibold text-slate-900">{title}</h2> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
