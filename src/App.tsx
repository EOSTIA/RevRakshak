import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { AppShell } from './components/layout/AppShell.js';
import { ControlTowerView } from './views/ControlTowerView.js';
import { RecoveryQueueView } from './views/RecoveryQueueView.js';
import { RecoveryDetailView } from './views/RecoveryDetailView.js';
import { TransactionsView } from './views/TransactionsView.js';
import { CustomerIntelligenceView } from './views/CustomerIntelligenceView.js';
import { MlInsightsView } from './views/MlInsightsView.js';
import { SimulatorView } from './views/SimulatorView.js';
import { PromisesView } from './views/PromisesView.js';
import { PoliciesView } from './views/PoliciesView.js';
import { AuditView } from './views/AuditView.js';
import { SystemHealthView } from './views/SystemHealthView.js';
import { RecoveryPipelineView } from './views/RecoveryPipelineView.js';
import { RecoveryAgentView } from './views/RecoveryAgentView.js';

const MainViewRouter: React.FC = () => {
  const { activeView } = useApp();

  switch (activeView) {
    case 'control-tower':
      return <ControlTowerView />;
    case 'recovery-pipeline':
      return <RecoveryPipelineView />;
    case 'recovery-agent':
      return <RecoveryAgentView />;
    case 'recovery-queue':
      return <RecoveryQueueView />;
    case 'recovery-detail':
      return <RecoveryDetailView />;
    case 'transactions':
      return <TransactionsView />;
    case 'customers':
      return <CustomerIntelligenceView />;
    case 'ai-insights':
      return <MlInsightsView />;
    case 'simulator':
      return <SimulatorView />;
    case 'promises':
      return <PromisesView />;
    case 'policies':
      return <PoliciesView />;
    case 'audit':
      return <AuditView />;
    case 'system':
      return <SystemHealthView />;
    default:
      return <ControlTowerView />;
  }
};

export function App() {
  return (
    <AppProvider>
      <AppShell>
        <MainViewRouter />
      </AppShell>
    </AppProvider>
  );
}

export default App;
