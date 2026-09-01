import {
  DashboardSummary,
  RecoveryCase,
  MerchantPolicy,
  PromiseToPay,
  AuditLogEntry,
  MicroserviceHealth,
  MLModelPerformance,
  FlightSimulatorConfig,
  FlightSimulatorResult,
  ActionType
} from '../types.js';

export const api = {
  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch('/api/dashboard/summary');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch summary');
    return json.data;
  },

  // Recovery Cases
  async getRecoveryCases(params?: {
    status?: string;
    cause?: string;
    risk?: string;
    search?: string;
    sortBy?: string;
  }): Promise<RecoveryCase[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.cause) query.set('cause', params.cause);
    if (params?.risk) query.set('risk', params.risk);
    if (params?.search) query.set('search', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`/api/recovery?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch recovery cases');
    return json.data;
  },

  async getRecoveryCaseById(id: string): Promise<RecoveryCase> {
    const res = await fetch(`/api/recovery/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch case');
    return json.data;
  },

  async getRecoveryOpportunities(limit = 5): Promise<any[]> {
    const res = await fetch(`/api/dashboard/opportunities?limit=${encodeURIComponent(String(limit))}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch recovery opportunities');
    return json.data;
  },

  async getDecisionTrace(recoveryId: string): Promise<any> {
    const res = await fetch(`/api/recovery/${encodeURIComponent(recoveryId)}/decision-trace`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch decision trace');
    return json.data;
  },

  async getCaseEvents(recoveryId: string): Promise<any[]> {
    const res = await fetch(`/api/recovery/${encodeURIComponent(recoveryId)}/events`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch recovery events');
    return json.data;
  },

  async getRiskGateSummary(): Promise<any> {
    const res = await fetch('/api/dashboard/risk-gate-summary');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch risk gate summary');
    return json.data;
  },

  async getExceptions(limit = 10): Promise<any[]> {
    const res = await fetch(`/api/dashboard/exceptions?limit=${encodeURIComponent(String(limit))}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch exceptions');
    return json.data;
  },

  async getAnomalyPrediction(paymentId: string): Promise<any> {
    const res = await fetch(`/api/ml/predictions/${encodeURIComponent(paymentId)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch anomaly prediction');
    return json.data;
  },

  async executeAction(
    caseId: string,
    actionType: ActionType,
    reason?: string
  ): Promise<{ success: boolean; case: RecoveryCase; message: string }> {
    const res = await fetch(`/api/recovery/${encodeURIComponent(caseId)}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, reason })
    });
    return res.json();
  },

  async simulatePaymentWebhook(
    caseId: string
  ): Promise<{ success: boolean; case: RecoveryCase; message: string }> {
    const res = await fetch(`/api/recovery/${encodeURIComponent(caseId)}/simulate-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async runBatchRecovery(): Promise<{
    totalProcessed: number;
    totalRecovered: number;
    recoveredAmount: number;
    vetoedCount: number;
  }> {
    const res = await fetch('/api/recovery/batch-run', { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Batch recovery failed');
    return json.data;
  },

  // Customer Profile
  async getCustomerProfile(id: string): Promise<{ customer: any; activeCases: RecoveryCase[] }> {
    const res = await fetch(`/api/customers/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Customer not found');
    return { customer: json.data, activeCases: json.activeCases };
  },

  // Policy Center
  async getPolicies(): Promise<MerchantPolicy> {
    const res = await fetch('/api/policies');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch policy');
    return json.data;
  },

  async updatePolicies(policy: Partial<MerchantPolicy>): Promise<MerchantPolicy> {
    const res = await fetch('/api/policies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update policy');
    return json.data;
  },

  async compileNaturalLanguagePolicy(prompt: string): Promise<{
    compiledPolicy: MerchantPolicy;
    explanation: string;
    deterministicRuleCount: number;
  }> {
    const res = await fetch('/api/policies/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to compile policy');
    return json.data;
  },

  // Promises to Pay
  async getPromises(): Promise<PromiseToPay[]> {
    const res = await fetch('/api/promises');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch promises');
    return json.data;
  },

  async createPromise(promise: Partial<PromiseToPay>): Promise<PromiseToPay> {
    const res = await fetch('/api/promises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promise)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create promise');
    return json.data;
  },

  // Audit Trail
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/audit');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch audit logs');
    return json.data;
  },

  // ML Observability
  async getMlMetrics(): Promise<MLModelPerformance[]> {
    const res = await fetch('/api/ml/metrics');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch ML metrics');
    return json.data;
  },

  // System Health & Fault Injections
  async getSystemHealth(): Promise<{
    services: MicroserviceHealth[];
    faultInjections: {
      lstmDown: boolean;
      voiceDown: boolean;
      razorpayDegraded: boolean;
      kafkaLag: boolean;
    };
  }> {
    const res = await fetch('/api/system/health');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch system health');
    return json.data;
  },

  async getPipelineFlow(): Promise<any[]> {
    const res = await fetch('/api/recovery/pipeline');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch pipeline flow');
    return json.data;
  },

  async getAgentSummary(): Promise<any[]> {
    const res = await fetch('/api/agent/summary');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch conversational summary');
    return json.data;
  },

  async getMlTrainingStatus(): Promise<any> {
    const res = await fetch('/api/ml/train');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch ML training status');
    return json.data;
  },

  async getBatchEvaluation(): Promise<any> {
    const res = await fetch('/api/ml/batch-evaluation');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch batch evaluation');
    return json.data;
  },

  async getKafkaStatus(): Promise<any> {
    const res = await fetch('/api/system/kafka');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch Kafka status');
    return json.data;
  },

  async getRedisStatus(): Promise<any> {
    const res = await fetch('/api/system/redis');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch Redis status');
    return json.data;
  },

  async getComplianceEvaluation(caseId: string): Promise<any> {
    const res = await fetch(`/api/compliance/${encodeURIComponent(caseId)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch compliance evaluation');
    return json.data;
  },

  async getSmsSimulations(): Promise<any[]> {
    const res = await fetch('/api/sms/simulate');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch SMS simulations');
    return json.data;
  },

  async toggleFault(fault: string, value: boolean): Promise<any> {
    const res = await fetch('/api/system/fault-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fault, value })
    });
    return res.json();
  },

  // Flight Simulator
  async runSimulator(config: FlightSimulatorConfig): Promise<FlightSimulatorResult[]> {
    const res = await fetch('/api/simulator/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Simulator run failed');
    return json.data;
  },

  // Payment Events
  async getPaymentEvents(): Promise<any[]> {
    const res = await fetch('/api/recovery');
    const json = await res.json();
    if (!json.success) return [];
    return (json.data || []).map((c: any) => ({
      id: `ev_${c.id}`,
      paymentId: c.paymentId,
      orderId: c.orderId,
      amount: c.amount,
      currency: 'INR',
      method: c.customer.primaryPaymentMethod || 'UPI',
      bank: 'HDFC Bank',
      status: c.status === 'PAYMENT_RECOVERED' ? 'CAPTURED' : 'FAILED',
      errorCode: c.failureCode || 'GATEWAY_ERROR',
      errorDescription: c.failureReasonDetails,
      customerName: c.customer.name,
      customerPhone: c.customer.phone,
      timestamp: c.createdAt,
      associatedCaseId: c.id
    }));
  }
};
