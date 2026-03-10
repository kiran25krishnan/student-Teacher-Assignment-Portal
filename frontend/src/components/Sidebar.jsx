export default function Sidebar({ tabs, active, onSelect, userName, role, onLogout }) {
  return (
    <aside
      className="flex flex-col h-screen w-60 flex-shrink-0"
      style={{ background: '#0b0f1c', borderRight: '1px solid #1a2236' }}
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b" style={{ borderColor: '#1a2236' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            🎓
          </div>
          <div>
            <p className="font-heading font-bold text-white text-sm leading-tight">School Portal</p>
            <p className="text-xs text-indigo-400 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all w-full"
              style={{
                background: isActive ? '#6366f115' : 'transparent',
                color: isActive ? '#818cf8' : '#64748b',
                borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t" style={{ borderColor: '#1a2236' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: '#6366f1' }}
          >
            {userName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <span>⎋</span> Sign out
        </button>
      </div>
    </aside>
  );
}
