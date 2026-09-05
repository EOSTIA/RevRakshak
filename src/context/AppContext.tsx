import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import {
  DashboardSummary,
  RecoveryCase,
  MicroserviceHealth,
  MerchantPolicy
} from '../types.js';

export type ActiveView =
  | 'control-tower'
  | 'recovery-pipeline'
  | 'recovery-agent'
  | 'recovery-queue'
  | 'recovery-detail'
  | 'transactions'
  | 'customers'
  | 'ai-insights'
  | 'simulator'
  | 'promises'
  | 'policies'
  | 'audit'
  | 'system';

interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  selectedCaseId: string | null;
  openCaseDetail: (caseId: string) => void;
  summary: DashboardSummary | null;
  cases: RecoveryCase[];
  health: MicroserviceHealth[];
  faultInjections: {
    lstmDown: boolean;
    voiceDown: boolean;
    razorpayDegraded: boolean;
    kafkaLag: boolean;
  };
  policy: MerchantPolicy | null;
  isLoading: boolean;
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  refreshAllData: () => Promise<void>;
  toggleFault: (fault: 'lstmDown' | 'voiceDown' | 'razorpayDegraded' | 'kafkaLag', value: boolean) => Promise<void>;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('control-tower');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('case_001');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [health, setHealth] = useState<MicroserviceHealth[]>([]);
  const [faultInjections, setFaultInjections] = useState({
    lstmDown: false,
    voiceDown: false,
    razorpayDegraded: false,
    kafkaLag: false
  });
  const [policy, setPolicy] = useState<MerchantPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString()
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
      const [sumRes, caseRes, healthRes, polRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getRecoveryCases(),
        api.getSystemHealth(),
        api.getPolicies()
      ]);
      setSummary(sumRes);
      setCases(caseRes);
      setHealth(healthRes.services);
      setFaultInjections(healthRes.faultInjections);
      setPolicy(polRes);
    } catch (err: any) {
      console.error('Failed to load RevRakshak state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    // Poll every 10 seconds for simulated real-time telemetry
    const interval = setInterval(refreshAllData, 10000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  const openCaseDetail = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveView('recovery-detail');
  };

  const toggleFault = async (fault: 'lstmDown' | 'voiceDown' | 'razorpayDegraded' | 'kafkaLag', value: boolean) => {
    try {
      const res = await api.toggleFault(fault, value);
      if (res.success) {
        setHealth(res.data.services);
        setFaultInjections(res.data.faultInjections);
        addToast({
          type: value ? 'WARNING' : 'SUCCESS',
          title: value ? 'Fault Injected: Resilience Active' : 'Service Restored',
          message: res.message
        });
      }
    } catch (e: any) {
      addToast({
        type: 'ERROR',
        title: 'Fault Toggle Failed',
        message: e.message
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        globalSearch,
        setGlobalSearch,
        selectedCaseId,
        openCaseDetail,
        summary,
        cases,
        health,
        faultInjections,
        policy,
        isLoading,
        toasts,
        addToast,
        removeToast,
        refreshAllData,
        toggleFault,
        isDemoMode,
        setIsDemoMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
