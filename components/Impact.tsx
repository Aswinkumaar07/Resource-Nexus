
import React from 'react';
import { Transaction } from '../types';

interface ImpactProps {
  transactions: Transaction[];
}

const Impact: React.FC<ImpactProps> = ({ transactions }) => {
  // Ensure we are working with numbers for all calculations
  const totalCO2 = transactions.reduce((acc: number, curr: Transaction) => acc + (curr.co2Saved || 0), 0);
  const totalWeight = transactions.reduce((acc: number, curr: Transaction) => acc + (curr.weight || 0), 0);
  const treesEquivalent = (totalCO2 / 20).toFixed(1);
  const carsRemovedHours = (totalCO2 / 0.4).toFixed(0); // Avg car emits 400g/km

  const materialBreakdown = transactions.reduce((acc, tx) => {
    acc[tx.material] = (acc[tx.material] || 0) + tx.weight;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 p-6 space-y-8 animate-in slide-in-from-right-8 duration-300 overflow-y-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white">Your Impact</h2>
        <p className="text-slate-400 text-sm">Quantifying your contribution to the planet.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="glass p-6 rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
            🌱
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Carbon Sequestered</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{totalCO2.toFixed(1)}</span>
              <span className="text-slate-400 font-bold">KG CO2</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-[32px] border border-white/5 space-y-2">
            <span className="text-2xl">🌳</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tree Power</p>
            <p className="text-xl font-black text-white">{treesEquivalent} <span className="text-xs font-normal text-slate-400">Trees</span></p>
          </div>
          <div className="glass p-5 rounded-[32px] border border-white/5 space-y-2">
            <span className="text-2xl">🚗</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Miles Offset</p>
            <p className="text-xl font-black text-white">{carsRemovedHours} <span className="text-xs font-normal text-slate-400">km</span></p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-white pl-2">Resource Diversion</h3>
        <div className="space-y-3">
          {Object.entries(materialBreakdown).length > 0 ? (
            // Explicitly cast Object.entries to fix 'unknown' type error on line 65
            (Object.entries(materialBreakdown) as [string, number][]).map(([material, weight]) => (
              <div key={material} className="glass p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="font-medium text-white">{material}</span>
                </div>
                <p className="font-black text-emerald-400">{weight.toFixed(1)} <span className="text-[10px] font-normal text-slate-500 uppercase">KG</span></p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 opacity-30 italic">
              No data yet. Start trading to see your footprint.
            </div>
          )}
        </div>
      </div>

      <div className="glass p-6 rounded-[32px] border border-white/10 space-y-4">
        <h3 className="font-bold text-white">Next Milestone</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-widest">Earth Guardian</span>
            <span className="text-emerald-400">{(totalCO2 % 100).toFixed(0)}/100 kg</span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
              style={{ width: `${totalCO2 % 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 italic">Save another {(100 - (totalCO2 % 100)).toFixed(1)}kg of CO2 to unlock the 'Earth Guardian' badge.</p>
        </div>
      </div>
    </div>
  );
};

export default Impact;
