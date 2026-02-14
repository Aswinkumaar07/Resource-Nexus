
import React, { useState, useEffect, useMemo } from 'react';
import { ScanResult, BuyerQuote, Transaction, UserProfile, MaterialComponent } from '../types';
import { CO2_FACTORS } from '../constants';
import { findLocalBuyers } from '../services/geminiService';

interface MarketplaceProps {
  user: UserProfile;
  scanResult?: ScanResult;
  onTradeComplete: (tx: Transaction) => void;
  onClose: () => void;
}

type ExtendedQuote = BuyerQuote & { componentWeight: number; uri?: string };

const Marketplace: React.FC<MarketplaceProps> = ({ user, scanResult, onTradeComplete, onClose }) => {
  const [filter, setFilter] = useState<'highest' | 'closest' | 'material'>('highest');
  const [isTrading, setIsTrading] = useState(false);
  const [pendingQuote, setPendingQuote] = useState<ExtendedQuote | null>(null);
  const [finalTx, setFinalTx] = useState<Transaction | null>(null);
  const [realBuyers, setRealBuyers] = useState<ExtendedQuote[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);

  useEffect(() => {
    const fetchRealData = async () => {
      if (!user.location) return;
      setLoadingBuyers(true);
      try {
        const materialToSearch = scanResult?.components[0]?.name;
        const results = await findLocalBuyers(user.location.lat, user.location.lng, materialToSearch);
        
        const mappedResults: ExtendedQuote[] = results.map(r => ({
          ...r,
          componentWeight: scanResult?.components.find(c => c.name.toLowerCase() === r.material.toLowerCase())?.weightKg || 1.0
        }));

        setRealBuyers(mappedResults);
      } catch (err) {
        console.error("Failed to fetch real buyers", err);
      } finally {
        setLoadingBuyers(false);
      }
    };

    fetchRealData();
  }, [user.location, scanResult]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const matchedQuotes = useMemo(() => {
    let quotes = [...realBuyers];

    if (filter === 'highest') {
      return quotes.sort((a, b) => b.ratePerKg - a.ratePerKg);
    } else if (filter === 'closest' && user.location) {
      return quotes.sort((a, b) => {
        if (!a.coords && !b.coords) return 0;
        if (!a.coords) return 1;
        if (!b.coords) return -1;
        const distA = getDistance(user.location!.lat, user.location!.lng, a.coords.lat, a.coords.lng);
        const distB = getDistance(user.location!.lat, user.location!.lng, b.coords.lat, b.coords.lng);
        return distA - distB;
      });
    } else if (filter === 'material') {
      return quotes.sort((a, b) => a.material.localeCompare(b.material));
    }
    return quotes;
  }, [realBuyers, filter, user.location]);

  const initiateTrade = (quote: ExtendedQuote) => {
    if (!scanResult) {
      alert("Please perform a 'Smart Scan' from the Home screen before attempting a trade.");
      return;
    }
    setPendingQuote(quote);
  };

  const confirmTrade = () => {
    if (!pendingQuote) return;
    setIsTrading(true);
    
    setTimeout(() => {
      const factor = CO2_FACTORS[pendingQuote.material] || CO2_FACTORS['Default'];
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        material: pendingQuote.material,
        weight: pendingQuote.componentWeight,
        rate: pendingQuote.ratePerKg,
        total: pendingQuote.componentWeight * pendingQuote.ratePerKg,
        buyerName: pendingQuote.buyerName,
        sellerName: user.fullName,
        timestamp: Date.now(),
        co2Saved: pendingQuote.componentWeight * factor
      };
      setFinalTx(tx);
      setIsTrading(false);
    }, 1500);
  };

  const handleFinish = () => {
    if (finalTx) onTradeComplete(finalTx);
  };

  const totalDetectedWeight = scanResult ? scanResult.components.reduce((acc, curr) => acc + curr.weightKg, 0) : 0;

  if (finalTx && pendingQuote) {
    return (
      <div className="flex-1 p-6 space-y-8 animate-in zoom-in-95 duration-500 overflow-y-auto pb-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto emerald-glow shadow-emerald-500/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Trade Secured!</h2>
            <p className="text-slate-400">The Nexus has matched you with an authorized buyer.</p>
          </div>
        </div>

        <div className="glass p-6 rounded-[32px] border border-white/10 space-y-6">
          <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Contact Information</h3>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 opacity-50">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] uppercase font-bold text-white tracking-widest">Buyer Details</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <p className="text-lg font-bold text-white">{pendingQuote.buyerName}</p>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-emerald-400">📍</span>
                  <span>{pendingQuote.location}</span>
                </div>
                {pendingQuote.uri && (
                  <a href={pendingQuote.uri} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-500 underline uppercase font-bold">View on Google Maps</a>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 opacity-50">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[10px] uppercase font-bold text-white tracking-widest">Seller Details (You)</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <p className="text-lg font-bold text-white">{user.fullName}</p>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-blue-400">📞</span>
                  <span>{user.contactNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleFinish}
          className="w-full bg-white text-slate-950 font-black py-5 rounded-3xl hover:bg-emerald-50 transition-all shadow-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 animate-in slide-in-from-right-8 duration-300 overflow-y-auto relative">
      <div className="flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-sm z-10 py-2">
        <h2 className="text-xl font-bold text-white">{scanResult ? 'Marketplace' : 'Browse Buyers'}</h2>
      </div>

      {scanResult && (
        <div className="glass p-5 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h3 className="font-bold text-white">Composition</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total: {totalDetectedWeight.toFixed(2)}kg</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {scanResult.components.map((comp, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{comp.name}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white">{comp.weightKg.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 font-medium">kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
             <h3 className="font-semibold text-white">Nearby Opportunities</h3>
             {loadingBuyers && <div className="text-[9px] text-emerald-400 animate-pulse font-bold uppercase tracking-widest">Searching Authorized Records...</div>}
          </div>
          <div className="flex glass rounded-lg p-1 w-fit">
            {['highest', 'closest', 'material'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`text-[10px] px-3 py-1.5 rounded-md transition-all capitalize ${filter === f ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pb-12">
          {loadingBuyers && realBuyers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center opacity-40">
               <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
               <p className="text-xs">Connecting to CPCB/Authorized data...</p>
            </div>
          ) : (
            matchedQuotes.map(quote => {
              const distance = (user.location && quote.coords) 
                ? getDistance(user.location.lat, user.location.lng, quote.coords.lat, quote.coords.lng) 
                : null;

              return (
                <div key={quote.id} className="glass p-5 rounded-3xl border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-xl">
                        🏢
                      </div>
                      <div className="flex-1 pr-2">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{quote.buyerName}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {quote.location} {distance !== null && <span className="text-emerald-500 ml-1">• {distance.toFixed(1)}km</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-400">₹{quote.ratePerKg.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 font-medium">per KG</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs text-slate-300 uppercase tracking-wide font-medium">{quote.material}</span>
                    </div>
                    {scanResult && (
                      <div className="text-xs font-bold text-white">
                        Est: ₹{(quote.ratePerKg * quote.componentWeight).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => initiateTrade(quote)}
                    className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${scanResult ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'bg-white/5 border border-white/10 text-slate-500 opacity-50'}`}
                  >
                    {scanResult ? 'Initiate Exchange' : 'Scan Required'}
                  </button>
                </div>
              );
            })
          )}
          
          {!loadingBuyers && realBuyers.length === 0 && (
            <div className="text-center py-10 glass rounded-3xl">
               <p className="text-slate-500 text-sm px-6">No authorized recycling partners found in this vicinity. Try checking nearby Municipal Corporation hubs.</p>
            </div>
          )}
        </div>
      </div>

      {pendingQuote && !finalTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass max-w-sm w-full p-8 rounded-[40px] border border-white/20 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-white">Confirm Exchange</h3>
              <p className="text-slate-400 text-sm">Validating with authorized partner</p>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Partner</span>
                <span className="text-white font-bold text-sm truncate ml-4">{pendingQuote.buyerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Material</span>
                <span className="text-white font-bold">{pendingQuote.material}</span>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-emerald-400 text-xs uppercase tracking-widest font-black">Est. Value</span>
                <span className="text-2xl font-black text-emerald-400">₹{(pendingQuote.ratePerKg * pendingQuote.componentWeight).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmTrade}
                disabled={isTrading}
                className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                {isTrading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : 'Confirm & Generate ID'}
              </button>
              <button 
                onClick={() => setPendingQuote(null)}
                disabled={isTrading}
                className="w-full bg-white/5 text-slate-400 font-bold py-3 rounded-2xl hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
