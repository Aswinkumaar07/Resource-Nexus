
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeView, onViewChange }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center emerald-glow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-emerald-400">Resource<span className="text-white">Nexus</span></span>
        </div>
        
        {user && (
          <button 
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-24">
        {children}
      </main>

      {user && onViewChange && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 py-3 px-6 flex justify-around items-center z-40 max-w-lg mx-auto">
          <button 
            onClick={() => onViewChange('dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'dashboard' ? 'text-emerald-500' : 'text-slate-500 opacity-60 hover:opacity-100'}`}
          >
            <svg className="w-6 h-6" fill={activeView === 'dashboard' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <div className="w-px h-6 bg-white/10"></div>
          
          <button 
            onClick={() => onViewChange('market')}
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'market' ? 'text-emerald-500' : 'text-slate-500 opacity-60 hover:opacity-100'}`}
          >
            <svg className="w-6 h-6" fill={activeView === 'market' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-[10px] font-medium">Market</span>
          </button>
          
          <div className="w-px h-6 bg-white/10"></div>
          
          <button 
            onClick={() => onViewChange('impact')}
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'impact' ? 'text-emerald-500' : 'text-slate-500 opacity-60 hover:opacity-100'}`}
          >
            <svg className="w-6 h-6" fill={activeView === 'impact' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">Impact</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default Layout;
