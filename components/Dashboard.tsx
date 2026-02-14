
import React from 'react';
import { UserProfile, Transaction } from '../types';

interface DashboardProps {
  user: UserProfile;
  transactions: Transaction[];
  onStartScan: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, transactions, onStartScan }) => {
  const totalWeight = transactions.reduce((acc, curr) => acc + curr.weight, 0);
  const totalCO2 = transactions.reduce((acc, curr) => acc + curr.co2Saved, 0);
  const treesEquivalent = Math.floor(totalCO2 / 20); // Average 20kg/year per tree

  return (
    <div className="flex-1 p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Hello, {user.fullName.split(' ')[0]}</h2>
          <div className="flex items-center gap-2">
             <p className="text-slate-400 text-sm">Let's minimize your waste today.</p>
             {user.location && (
               <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live GPS</span>
               </div>
             )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border border-white/10">
          <span className="text-lg">🌿</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="glass p-6 rounded-3xl relative overflow-hidden emerald-glow">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 012.49-2.333c.051 0 .102.004.151.011a2.59 2.59 0 002.428 2.103 3.12 3.12 0 011.133.19c.245.096.436.213.63.34a1 1 0 001.275-1.528 2.59 2.59 0 01-.525-.429c-.19-.19-.39-.386-.615-.567a1 1 0 00-1.427 1.414c.224.227.421.455.594.673a.596.596 0 00.316.216 1.12 1.12 0 00-.85-.14 1.05 1.05 0 00-.81-.433c-.01 0-.019 0-.029.001a1.04 1.04 0 00-.974.721c-.134.426-.26.864-.378 1.303a13.91 13.91 0 01-.53 1.83 1.016 1.016 0 00.957 1.344h.01c.548 0 1.001-.436 1.053-.984.137-1.446.401-2.883.784-4.29a3.12 3.12 0 01.378-.962c.113-.19.232-.375.358-.553a1 1 0 00-1.664-1.107z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Nexus Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{totalCO2.toFixed(1)}</span>
            <span className="text-slate-400 text-sm">kg CO2 saved</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="bg-white/10 rounded-2xl px-4 py-3 flex-1">
            <p className="text-[10px] text-slate-400 uppercase font-medium">Materials</p>
            <p className="text-lg font-bold">{totalWeight.toFixed(1)}kg</p>
          </div>
          <div className="bg-emerald-500/20 rounded-2xl px-4 py-3 flex-1 border border-emerald-500/30">
            <p className="text-[10px] text-emerald-400 uppercase font-medium">Trees Equivalent</p>
            <p className="text-lg font-bold text-emerald-300">{treesEquivalent} 🌳</p>
          </div>
        </div>
      </div>

      {/* Main Action */}
      <button 
        onClick={onStartScan}
        className="w-full bg-emerald-600 hover:bg-emerald-500 p-8 rounded-[40px] flex items-center justify-between group transition-all shadow-xl shadow-emerald-900/40 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-left relative z-10">
          <h3 className="text-2xl font-bold text-white mb-1">Smart Scan</h3>
          <p className="text-emerald-100/70 text-sm">Identify waste with Gemini Vision</p>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </button>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">Recent Transactions</h4>
          <button className="text-xs text-emerald-400 font-medium">See All</button>
        </div>
        
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="glass p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <span className="text-sm">♻️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.material}</p>
                    <p className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">+₹{tx.total.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">{tx.weight}kg</p>
                </div>
              </div>
            ))
          ) : (
            <div className="glass p-8 rounded-2xl text-center">
              <p className="text-slate-500 text-sm">No transactions yet. Start by scanning waste!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
