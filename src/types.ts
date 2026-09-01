export type RecoveryStatus =
  | 'DETECTED'
  | 'DIAGNOSING'
  | 'RISK_CHECK'
  | 'STRATEGY_SELECTED'
  | 'POLICY_APPROVED'
  | 'POLICY_BLOCKED'
  | 'ACTION_QUEUED'
  | 'ACTION_EXECUTED'
  | 'CUSTOMER_CONTACTED'
  | 'PAYMENT_RECOVERED'
  | 'RECOVERY_FAILED'
  | 'HUMAN_REVIEW'
  | 'EXPIRED'
  | 'NO_ACTION';

export type FailureCause =
  | 'INSUFFICIENT_FUNDS'
  | 'NETWORK_FAILURE'
  | 'CARD_DECLINED_SOFT'
  | 'CARD_DECLINED_HARD'
  | 'SUBSCRIPTION_MANDATE_FAILED'
  | 'CHECKOUT_DROP_OFF'
  | 'AUTHENTICATION_3DS_TIMEOUT'
  | 'UPI_COLLECT_EXPIRED'
  | 'SUSPICIOUS_VELOCITY_ABUSE';

export type ActionType =
  | 'CREATE_PAYMENT_LINK'
  | 'RETRY_SUBSCRIPTION_MANDATE'
  | 'SEND_HINGLISH_SMS_NUDGE'
  | 'OUTBOUND_VOICE_CALL'
  | 'REQUEST_PROMISE_TO_PAY'
  | 'SWITCH_PAYMENT_METHOD'
  | 'ESCALATE_HUMAN_REVIEW'
  | 'DO_NOTHING_VETOED';

export type RiskDecision = 'PASS' | 'VETO' | 'MANUAL_REVIEW';

export interface FeatureReconstructionError {
  featureName: string;
  inputScore: number;
  reconstructedScore: number;
  reconstructionError: number;
  contributionPercent: number;
  description: string;
}

export interface LstmAnomalyResult {
  anomalyScore: number; // 0.0 to 1.0 (MSE)
  threshold: number; // default 0.65
  decision: RiskDecision;
  featureErrors: FeatureReconstructionError[];
  reason: string;
  isFallbackActive: boolean;
  fallbackReason?: string;
  latencyMs: number;
}

export interface PaymentSequenceEvent {
  id: string;
  timestamp: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'EMANDATE';
  timeDeltaMinutes: number;
  reconstructionError: number;
}

export type CustomerProfile = CustomerRecoveryProfile;

export interface PaymentEvent {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  bank?: string;
  status: 'FAILED' | 'AUTHORIZED' | 'CAPTURED';
  errorCode?: string;
  errorDescription?: string;
  customerName: string;
  customerPhone: string;
  timestamp: string;
  associatedCaseId?: string;
}

export interface CustomerRecoveryProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredLanguage: 'Hinglish' | 'Hindi' | 'English' | 'Tamil' | 'Telugu';
  lifetimeProcessedValue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  historicalRecoveryRate: number; // e.g. 0.88
  averageTicketSize: number;
  primaryPaymentMethod: string;
  contactConsentGranted: boolean;
  lastContactedAt?: string;
  contactsInLast24h: number;
  currentAnomalyScore: number;
  paymentSequence: PaymentSequenceEvent[];
}

export interface RecoveryCandidateAction {
  actionType: ActionType;
  label: string;
  channel: 'SMS' | 'WHATSAPP' | 'VOICE' | 'PAYMENT_LINK' | 'DIRECT_RETRY' | 'HUMAN';
  recoveryProbability: number; // 0.0 to 1.0
  interventionCost: number; // in INR
  incentiveCost: number; // in INR (e.g. discount/waiver)
  expectedContactCost: number; // false positive / reputation cost
  expectedRecoveryGross: number; // probability * amount
  expectedNetRecoveryValue: number; // expectedRecoveryGross - costs
  recommended: boolean;
}

export interface PolicyCheckResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  thresholdValue: string | number;
  actualValue: string | number;
  severity: 'BLOCKING' | 'WARNING' | 'INFO';
  explanation: string;
}

export interface PolicyEvaluation {
  overallResult: 'APPROVED' | 'BLOCKED' | 'HUMAN_REVIEW_REQUIRED';
  executedAt: string;
  deterministic: boolean;
  checks: PolicyCheckResult[];
  explanation: string;
}

export interface RazorpayActionPayload {
  paymentLinkId?: string;
  shortUrl?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: 'INR';
  status: 'created' | 'paid' | 'expired' | 'cancelled';
  customerContact?: string;
  createdEpoch?: number;
  expiresEpoch?: number;
  simulatedWebhookReceived?: boolean;
}

export interface RecoveryCase {
  id: string;
  caseNumber: string; // e.g. "RX-10492"
  paymentId: string; // e.g. "pay_Oih82Kjd819"
  orderId: string; // e.g. "order_Mkd91Ksn01"
  createdAt: string;
  updatedAt: string;
  amount: number; // In INR
  customer: CustomerRecoveryProfile;
  failureCause: FailureCause;
  failureCode: string; // e.g. "BAD_REQUEST_ERROR / INSUFFICIENT_FUNDS"
  failureReasonDetails: string;
  diagnosisConfidence: number; // e.g. 0.91
  status: RecoveryStatus;
  
  // ML & Anomaly
  anomalyResult: LstmAnomalyResult;
  candidateActions: RecoveryCandidateAction[];
  selectedAction: ActionType;
  
  // Policy & Gate
  policyEvaluation: PolicyEvaluation;
  
  // Execution & Razorpay
  razorpayDetails?: RazorpayActionPayload;
  messageContent?: {
    language: string;
    template: string;
    text: string;
  };
  
  // Resolution
  recoveredAmount?: number;
  recoveredAt?: string;
  isException?: boolean;
  exceptionReason?: string;
  
  // Audit Trail summary
  timelineEvents: CaseTimelineEvent[];
}

export interface CaseTimelineEvent {
  id: string;
  stage: RecoveryStatus;
  title: string;
  description: string;
  timestamp: string;
  actorService: string; // e.g. "Webhook Gateway", "LSTM Anomaly Gate", "Action Gateway"
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'SKIPPED';
  metadata?: Record<string, any>;
}

export interface PromiseToPay {
  id: string;
  caseId: string;
  caseNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  promisedDate: string; // ISO date
  status: 'ACTIVE' | 'DUE_TODAY' | 'KEPT' | 'BROKEN' | 'EXPIRED';
  channel: 'VOICE_CALL' | 'SMS_CONVERSATION' | 'PAYMENT_LINK';
  reminderScheduledAt: string;
  notes: string;
  lastFollowUpAt?: string;
}

export interface RecoveryPipelineStage {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  x: number;
  y: number;
  status: 'active' | 'warning' | 'success' | 'blocked';
  volume: number;
  tone: string;
}

export interface RecoveryAgentSummary {
  caseId: string;
  caseNumber: string;
  customerName: string;
  issue: string;
  summary: string;
  recommendedAction: string;
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MerchantPolicy {
  id: string;
  name: string;
  maxAutomatedRecoveryAmount: number; // e.g. 25000 INR
  maxContactsPerCustomer24h: number; // e.g. 2
  cooldownPeriodHours: number; // e.g. 12
  anomalyThreshold: number; // e.g. 0.65
  minRecoveryConfidence: number; // e.g. 0.60
  allowVoiceRecovery: boolean;
  allowSmsRecovery: boolean;
  allowPaymentLinks: boolean;
  allowedContactStartHour: number; // e.g. 9 (9 AM)
  allowedContactEndHour: number; // e.g. 21 (9 PM)
  requireHumanApprovalAbove: number; // e.g. 20000 INR
  requireConsentForOutreach: boolean;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventId?: string;
  eventType?: string;
  paymentId?: string;
  caseNumber?: string;
  actorService?: string;
  actor?: string;
  summary?: string;
  decision?: string;
  reason?: string;
  mlScores?: {
    diagnosisConfidence?: number;
    anomalyScore?: number;
    recoveryPropensity?: number;
  };
  policyResult?: 'APPROVED' | 'BLOCKED' | 'HUMAN_REVIEW';
  actionTaken?: string;
  apiStatusCode?: number;
  payloadDigest?: string;
  signatureHash?: string;
  payload?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MicroserviceHealth {
  name: string;
  displayName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  lastHeartbeat: string;
  errorRate: number; // e.g. 0.002
  circuitBreakerState: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  queueDepth?: number;
  fallbackActive: boolean;
  fallbackTarget?: string;
  description: string;
}

export interface DashboardSummary {
  revenueAtRisk: number; // INR
  recoveredToday: number; // INR
  recoveryRatePercent: number; // e.g. 68.4
  expectedRecoveryGross: number; // INR
  activeRecoveryCount: number;
  totalAtRiskCount: number;
  riskVetoCount: number;
  manualReviewCount: number;
  exceptionsCount: number;
  revenueLeakageBreakdown: {
    cause: FailureCause;
    label: string;
    amount: number;
    count: number;
    percentage: number;
    recoverabilityRating: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
  }[];
  recoveryTrend: {
    date: string;
    atRisk: number;
    recovered: number;
    rate: number;
  }[];
  funnel: {
    atRisk: number;
    diagnosed: number;
    recoverable: number;
    actioned: number;
    recovered: number;
  };
}

export interface FlightSimulatorConfig {
  datasetName: string;
  batchSize: number;
  strategies: {
    strategyId: string;
    strategyName: string;
    channel: string;
    incentiveDiscountPercent: number;
    enabled: boolean;
  }[];
}

export interface FlightSimulatorResult {
  strategyId: string;
  strategyName: string;
  totalAtRisk: number;
  projectedRecovered: number;
  projectedRecoveryRate: number;
  interventionCost: number;
  incentiveCost: number;
  netRecoveredValue: number;
  customerSatisfactionScore: number;
  isRecommended: boolean;
}

export interface MLModelPerformance {
  modelName: string;
  version: string;
  modelType: string;
  lastTrained: string;
  trainingSamples: number;
  testSamples: number;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    fpr: number; // False positive rate
    prAuc: number;
    falsePositiveCostEstimated: number; // In INR
  };
  featureImportance: {
    feature: string;
    importance: number;
    category: string;
  }[];
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  threshold: number;
}
