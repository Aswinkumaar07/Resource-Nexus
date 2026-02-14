
import React, { useState } from 'react';
import { EntityType, UserProfile } from '../types';

interface AuthFlowProps {
  onComplete: (profile: UserProfile) => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    entityType: EntityType.HOME,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleGetLocation = () => {
    setLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoadingLocation(false);
        },
        (err) => {
          alert("Error fetching location. Please check permissions.");
          setLoadingLocation(false);
        }
      );
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      onComplete({
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        location: location || undefined
      });
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col justify-center animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
        <p className="text-slate-400">Join the circular economy in a few steps.</p>
        
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={`h-1.5 w-12 rounded-full transition-all duration-300 ${s <= step ? 'bg-emerald-500' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Identity</h3>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="John Doe"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Entity Type</label>
              <select 
                value={formData.entityType}
                onChange={e => setFormData({...formData, entityType: e.target.value as EntityType})}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {Object.values(EntityType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Contact Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
              <input 
                type="tel" 
                value={formData.contactNumber}
                onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                placeholder="+1 234 567 890"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Global Presence</h3>
            <p className="text-sm text-slate-400">Enable location to find the nearest waste buyers and partners.</p>
            <button 
              onClick={handleGetLocation}
              disabled={loadingLocation}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${location ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            >
              <svg className={`w-5 h-5 ${loadingLocation ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {loadingLocation ? 'Locating...' : location ? 'Location Verified' : 'Share My Location'}
            </button>
            {location && (
              <p className="text-[10px] text-center text-slate-500">
                Coords: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
        )}

        <button 
          onClick={handleNext}
          disabled={!formData.fullName && step === 1}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl mt-8 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 3 ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AuthFlow;
