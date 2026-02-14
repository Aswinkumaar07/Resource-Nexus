
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import AuthFlow from './components/AuthFlow';
import Dashboard from './components/Dashboard';
import ScanModule from './components/ScanModule';
import Marketplace from './components/Marketplace';
import Impact from './components/Impact';
import { UserProfile, ScanResult, Transaction } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'dashboard' | 'scan' | 'market' | 'impact'>('dashboard');
  const [activeScanResult, setActiveScanResult] = useState<ScanResult | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const watchId = useRef<number | null>(null);

  // Load persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    const savedTxs = localStorage.getItem('nexus_txs');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedTxs) setTransactions(JSON.parse(savedTxs));
  }, []);

  // Live Location Tracking
  useEffect(() => {
    if (user && "geolocation" in navigator) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }

      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          setUser(prev => {
            if (!prev) return null;
            const updated = {
              ...prev,
              location: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              }
            };
            localStorage.setItem('nexus_user', JSON.stringify(updated));
            return updated;
          });
        },
        (err) => {
          console.warn("Live location tracking error:", err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [user?.id]);

  const handleAuthComplete = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('nexus_user', JSON.stringify(profile));
  };

  const handleLogout = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  const handleScanResults = (results: ScanResult) => {
    setActiveScanResult(results);
    setView('market');
  };

  const handleTradeComplete = (tx: Transaction) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('nexus_txs', JSON.stringify(updated));
    setView('dashboard');
    setActiveScanResult(null);
  };

  if (!user) {
    return (
      <Layout>
        <AuthFlow onComplete={handleAuthComplete} />
      </Layout>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeView={view} 
      onViewChange={(v) => {
        setView(v as any);
        if (v !== 'market') setActiveScanResult(null);
      }}
    >
      {view === 'dashboard' && (
        <Dashboard 
          user={user} 
          transactions={transactions} 
          onStartScan={() => setView('scan')} 
        />
      )}
      
      {view === 'scan' && (
        <ScanModule 
          onResultsFound={handleScanResults}
          onCancel={() => setView('dashboard')}
        />
      )}

      {view === 'market' && (
        <Marketplace 
          user={user}
          scanResult={activeScanResult || undefined}
          onTradeComplete={handleTradeComplete}
          onClose={() => setView('dashboard')}
        />
      )}

      {view === 'impact' && (
        <Impact 
          transactions={transactions} 
        />
      )}
    </Layout>
  );
};

export default App;
