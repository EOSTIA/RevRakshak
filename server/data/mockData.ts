import {
  RecoveryCase,
  MerchantPolicy,
  PromiseToPay,
  AuditLogEntry,
  MicroserviceHealth,
  MLModelPerformance,
  DashboardSummary
} from '../../src/types.js';

export const INITIAL_MERCHANT_POLICY: MerchantPolicy = {
  id: 'pol_std_merchant_01',
  name: 'Standard Growth Tier Policy',
  maxAutomatedRecoveryAmount: 25000,
  maxContactsPerCustomer24h: 2,
  cooldownPeriodHours: 6,
  anomalyThreshold: 0.65,
  minRecoveryConfidence: 0.60,
  allowVoiceRecovery: true,
  allowSmsRecovery: true,
  allowPaymentLinks: true,
  allowedContactStartHour: 9, // 9:00 AM
  allowedContactEndHour: 21, // 9:00 PM
  requireHumanApprovalAbove: 20000,
  requireConsentForOutreach: true,
  updatedAt: new Date().toISOString()
};

export const INITIAL_HEALTH_STATUS: MicroserviceHealth[] = [
  {
    name: 'api_gateway',
    displayName: 'API Gateway',
    status: 'HEALTHY',
    latencyMs: 14,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0002,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Reverse proxy, TLS termination, and rate-limiting ingress'
  },
  {
    name: 'webhook_gateway',
    displayName: 'Webhook Gateway',
    status: 'HEALTHY',
    latencyMs: 19,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0005,
    circuitBreakerState: 'CLOSED',
    queueDepth: 4,
    fallbackActive: false,
    description: 'Razorpay webhook receiver with HMAC signature verification'
  },
  {
    name: 'kafka_broker',
    displayName: 'Kafka Event Bus (KRaft)',
    status: 'HEALTHY',
    latencyMs: 8,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0001,
    circuitBreakerState: 'CLOSED',
    queueDepth: 12,
    fallbackActive: false,
    description: 'Distributed event log for payment.failed and recovery.action topics'
  },
  {
    name: 'redis_hot_state',
    displayName: 'Redis Hot Store',
    status: 'HEALTHY',
    latencyMs: 3,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0000,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Idempotency keys, velocity features, and hot customer state'
  },
  {
    name: 'postgres_db',
    displayName: 'PostgreSQL System of Record',
    status: 'HEALTHY',
    latencyMs: 22,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0004,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Persistent relational store for recovery cases, policies & audit'
  },
  {
    name: 'diagnosis_service',
    displayName: 'Failure Cause Classifier',
    status: 'HEALTHY',
    latencyMs: 38,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0012,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'LightGBM model classifying 8 distinct payment failure causes'
  },
  {
    name: 'lstm_anomaly_service',
    displayName: 'LSTM Anomaly Gate',
    status: 'HEALTHY',
    latencyMs: 44,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0018,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Sequence autoencoder scoring reconstruction error on retry patterns'
  },
  {
    name: 'recovery_propensity_service',
    displayName: 'Recovery Propensity Engine',
    status: 'HEALTHY',
    latencyMs: 31,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0009,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Multi-armed bandit & expected recovery value estimator'
  },
  {
    name: 'action_gateway',
    displayName: 'Action Gateway & Policy Gate',
    status: 'HEALTHY',
    latencyMs: 12,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0001,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Deterministic policy firewall enforcing bounds & limits on AI actions'
  },
  {
    name: 'razorpay_adapter',
    displayName: 'Razorpay Test Adapter',
    status: 'HEALTHY',
    latencyMs: 110,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.0035,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Payment Links, Mandate retry, and Order API orchestration'
  },
  {
    name: 'voice_adapter',
    displayName: 'Hinglish Voice Engine (Bland/Sarvam)',
    status: 'HEALTHY',
    latencyMs: 165,
    lastHeartbeat: new Date().toISOString(),
    errorRate: 0.012,
    circuitBreakerState: 'CLOSED',
    fallbackActive: false,
    description: 'Outbound conversational voice nudges with auto-fallback to SMS'
  }
];

export const INITIAL_ML_METRICS: MLModelPerformance[] = [
  {
    modelName: 'LSTM Autoencoder Anomaly Gate',
    version: 'v2.4-seq10',
    modelType: 'Bidirectional LSTM Sequence Autoencoder',
    lastTrained: '2026-08-28T04:00:00Z',
    trainingSamples: 84200,
    testSamples: 14500,
    threshold: 0.65,
    metrics: {
      precision: 0.942,
      recall: 0.918,
      f1Score: 0.930,
      fpr: 0.034,
      prAuc: 0.965,
      falsePositiveCostEstimated: 18450
    },
    featureImportance: [
      { feature: 'Amount Volatility Sequence (ΔAmount)', importance: 0.34, category: 'Transaction' },
      { feature: 'Payment Method Switching Velocity', importance: 0.28, category: 'Behavioral' },
      { feature: 'Inter-attempt Time Gap Irregularity', importance: 0.21, category: 'Temporal' },
      { feature: 'Device Fingerprint Variance', importance: 0.11, category: 'Device' },
      { feature: 'BIN / Card Issuer Dispersion', importance: 0.06, category: 'Card' }
    ],
    confusionMatrix: {
      truePositive: 1331,
      falsePositive: 44,
      trueNegative: 13010,
      falseNegative: 115
    }
  },
  {
    modelName: 'Failure Cause Diagnosis Classifier',
    version: 'v3.1-lgbm',
    modelType: 'LightGBM Multi-class Classifier',
    lastTrained: '2026-08-25T08:00:00Z',
    trainingSamples: 128000,
    testSamples: 22000,
    threshold: 0.70,
    metrics: {
      precision: 0.936,
      recall: 0.924,
      f1Score: 0.930,
      fpr: 0.028,
      prAuc: 0.958,
      falsePositiveCostEstimated: 9200
    },
    featureImportance: [
      { feature: 'Razorpay Raw Error Code & Subcode', importance: 0.42, category: 'Gateway' },
      { feature: 'Customer Bank UPI Health Status', importance: 0.23, category: 'Banking' },
      { feature: 'Historical Account Balance Trend', importance: 0.17, category: 'Customer' },
      { feature: 'Card Type (Credit vs Debit Limit)', importance: 0.12, category: 'Card' },
      { feature: 'Time of Month (Salary Cycle Day)', importance: 0.06, category: 'Temporal' }
    ],
    confusionMatrix: {
      truePositive: 18480,
      falsePositive: 420,
      trueNegative: 2800,
      falseNegative: 300
    }
  },
  {
    modelName: 'Recovery Propensity & Channel Optimizer',
    version: 'v4.0-mab',
    modelType: 'Contextual Bandit with Logistic Calibration',
    lastTrained: '2026-08-30T01:30:00Z',
    trainingSamples: 96000,
    testSamples: 16000,
    threshold: 0.55,
    metrics: {
      precision: 0.887,
      recall: 0.865,
      f1Score: 0.876,
      fpr: 0.052,
      prAuc: 0.912,
      falsePositiveCostEstimated: 14200
    },
    featureImportance: [
      { feature: 'Customer Historical Recovery Rate', importance: 0.38, category: 'Customer' },
      { feature: 'Intervention Channel Propensity', importance: 0.26, category: 'Channel' },
      { feature: 'Invoice Amount Relative to Median', importance: 0.18, category: 'Financial' },
      { feature: 'Preferred Communication Language', importance: 0.11, category: 'Demographic' },
      { feature: 'Days Since Last Successful Order', importance: 0.07, category: 'Recency' }
    ],
    confusionMatrix: {
      truePositive: 11245,
      falsePositive: 610,
      trueNegative: 3820,
      falseNegative: 325
    }
  }
];

// Seed 52 realistic cases representing the full synthetic batch
export const INITIAL_RECOVERY_CASES: RecoveryCase[] = [
  {
    id: 'case_001',
    caseNumber: 'RX-10492',
    paymentId: 'pay_Oih82Kjd819',
    orderId: 'order_Mkd91Ksn01',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    amount: 7450,
    customer: {
      id: 'cust_rahul_9921',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@techcorp.in',
      phone: '+91 98201 44821',
      preferredLanguage: 'Hinglish',
      lifetimeProcessedValue: 142800,
      totalTransactions: 19,
      successfulTransactions: 17,
      failedTransactions: 2,
      historicalRecoveryRate: 0.91,
      averageTicketSize: 6950,
      primaryPaymentMethod: 'UPI (GPay)',
      contactConsentGranted: true,
      contactsInLast24h: 0,
      currentAnomalyScore: 0.08,
      paymentSequence: [
        { id: 'seq_1', timestamp: '2026-08-25T10:14:00Z', amount: 6950, status: 'SUCCESS', paymentMethod: 'UPI', timeDeltaMinutes: 0, reconstructionError: 0.04 },
        { id: 'seq_2', timestamp: '2026-08-28T15:20:00Z', amount: 7200, status: 'SUCCESS', paymentMethod: 'UPI', timeDeltaMinutes: 4620, reconstructionError: 0.05 },
        { id: 'seq_3', timestamp: '2026-08-31T06:40:00Z', amount: 7450, status: 'FAILED', paymentMethod: 'UPI', timeDeltaMinutes: 3800, reconstructionError: 0.08 }
      ]
    },
    failureCause: 'INSUFFICIENT_FUNDS',
    failureCode: 'BAD_REQUEST_ERROR / INSUFFICIENT_FUNDS_IN_ACCOUNT',
    failureReasonDetails: 'UPI debit request declined by issuing bank due to daily limit / balance threshold. High recovery probability via Payment Link.',
    diagnosisConfidence: 0.91,
    status: 'ACTION_QUEUED',
    anomalyResult: {
      anomalyScore: 0.08,
      threshold: 0.65,
      decision: 'PASS',
      reason: 'Low variance in transaction amounts and normal temporal pacing. No card testing indicators.',
      isFallbackActive: false,
      latencyMs: 38,
      featureErrors: [
        { featureName: 'Amount Volatility', inputScore: 0.12, reconstructedScore: 0.11, reconstructionError: 0.01, contributionPercent: 12, description: 'Consistent ticket size matching history' },
        { featureName: 'Payment Method Switching', inputScore: 0.00, reconstructedScore: 0.00, reconstructionError: 0.00, contributionPercent: 0, description: 'Single verified UPI handle used' },
        { featureName: 'Timing Irregularity', inputScore: 0.09, reconstructedScore: 0.08, reconstructionError: 0.01, contributionPercent: 14, description: 'Normal business-hour spacing' }
      ]
    },
    candidateActions: [
      {
        actionType: 'CREATE_PAYMENT_LINK',
        label: 'Razorpay Payment Link (WhatsApp + SMS)',
        channel: 'PAYMENT_LINK',
        recoveryProbability: 0.82,
        interventionCost: 4.50,
        incentiveCost: 0,
        expectedContactCost: 1.20,
        expectedRecoveryGross: 6109,
        expectedNetRecoveryValue: 6103.30,
        recommended: true
      },
      {
        actionType: 'SEND_HINGLISH_SMS_NUDGE',
        label: 'Hinglish Conversational SMS Nudge',
        channel: 'SMS',
        recoveryProbability: 0.69,
        interventionCost: 1.20,
        incentiveCost: 0,
        expectedContactCost: 2.10,
        expectedRecoveryGross: 5140,
        expectedNetRecoveryValue: 5136.70,
        recommended: false
      },
      {
        actionType: 'OUTBOUND_VOICE_CALL',
        label: 'AI Interactive Voice Recovery (Sarvam Hindi)',
        channel: 'VOICE',
        recoveryProbability: 0.57,
        interventionCost: 18.00,
        incentiveCost: 0,
        expectedContactCost: 45.00,
        expectedRecoveryGross: 4246,
        expectedNetRecoveryValue: 4183.00,
        recommended: false
      },
      {
        actionType: 'DO_NOTHING_VETOED',
        label: 'No Action / Passive Wait',
        channel: 'DIRECT_RETRY',
        recoveryProbability: 0.08,
        interventionCost: 0,
        incentiveCost: 0,
        expectedContactCost: 0,
        expectedRecoveryGross: 596,
        expectedNetRecoveryValue: 596.00,
        recommended: false
      }
    ],
    selectedAction: 'CREATE_PAYMENT_LINK',
    policyEvaluation: {
      overallResult: 'APPROVED',
      executedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      deterministic: true,
      explanation: 'Transaction satisfies all merchant recovery bounds (amount < ₹25,000, 0 contacts in 24h, active consent, low anomaly score 0.08 < 0.65).',
      checks: [
        { ruleId: 'POL_MAX_AMOUNT', ruleName: 'Max Automated Amount Limit', passed: true, thresholdValue: '₹25,000', actualValue: '₹7,450', severity: 'BLOCKING', explanation: 'Within permissible automated recovery ceiling' },
        { ruleId: 'POL_CONTACT_LIMIT', ruleName: '24-Hour Contact Cap', passed: true, thresholdValue: 'Max 2 contacts', actualValue: '0 contacts', severity: 'BLOCKING', explanation: 'Customer not fatigued by outreach' },
        { ruleId: 'POL_RISK_GATE', ruleName: 'LSTM Anomaly Gate Score', passed: true, thresholdValue: 'Threshold ≤ 0.65', actualValue: 'Score = 0.08', severity: 'BLOCKING', explanation: 'Sequence reconstructs cleanly without fraud indicators' },
        { ruleId: 'POL_HOURS_CHECK', ruleName: 'TRAI Calling Hours Compliance', passed: true, thresholdValue: '09:00 - 21:00 IST', actualValue: 'Current: 14:45 IST', severity: 'BLOCKING', explanation: 'Within permitted consumer engagement window' }
      ]
    },
    messageContent: {
      language: 'Hinglish',
      template: 'PAYMENT_LINK_FRIENDLY',
      text: 'Namaste Rahul ji! Aapka ₹7,450 ka payment technical issue ki wajah se complete nahi ho paya. Order confirm karne ke liye yahan click karein: https://rzp.io/i/plink_rx10492'
    },
    timelineEvents: [
      { id: 't1', stage: 'DETECTED', title: 'Payment Failure Ingested', description: 'Razorpay webhook payment.failed received for ₹7,450', timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), actorService: 'Webhook Gateway', status: 'COMPLETED' },
      { id: 't2', stage: 'DIAGNOSING', title: 'Root Cause Diagnosed', description: 'LightGBM model identified Temporary Insufficient Funds (Confidence: 91%)', timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(), actorService: 'Diagnosis Service', status: 'COMPLETED' },
      { id: 't3', stage: 'RISK_CHECK', title: 'LSTM Anomaly Gate Passed', description: 'Reconstruction error 0.08 < 0.65. Normal behavioral trajectory verified.', timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(), actorService: 'LSTM Anomaly Gate', status: 'COMPLETED' },
      { id: 't4', stage: 'STRATEGY_SELECTED', title: 'Strategy & Expected Value Computed', description: 'Payment Link identified as optimal strategy (E[V] = ₹6,103.30)', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), actorService: 'Recovery Propensity Engine', status: 'COMPLETED' },
      { id: 't5', stage: 'POLICY_APPROVED', title: 'Action Gateway Validation', description: 'Deterministic policy passed all 4 compliance checks.', timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), actorService: 'Action Gateway', status: 'COMPLETED' }
    ]
  },
  {
    id: 'case_002',
    caseNumber: 'RX-10493',
    paymentId: 'pay_Abc9921Ksm18',
    orderId: 'order_Zks8819La02',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    amount: 129,
    customer: {
      id: 'cust_unknown_anon02',
      name: 'Pooja Varma',
      email: 'p.varma8129@tempmail.co',
      phone: '+91 97110 09812',
      preferredLanguage: 'English',
      lifetimeProcessedValue: 129,
      totalTransactions: 6,
      successfulTransactions: 1,
      failedTransactions: 5,
      historicalRecoveryRate: 0.16,
      averageTicketSize: 110,
      primaryPaymentMethod: 'Credit Card (Multiple)',
      contactConsentGranted: false,
      contactsInLast24h: 0,
      currentAnomalyScore: 0.94,
      paymentSequence: [
        { id: 'seq_v1', timestamp: '2026-08-31T06:55:00Z', amount: 99, status: 'SUCCESS', paymentMethod: 'CREDIT_CARD', timeDeltaMinutes: 0, reconstructionError: 0.12 },
        { id: 'seq_v2', timestamp: '2026-08-31T06:56:10Z', amount: 102, status: 'FAILED', paymentMethod: 'CREDIT_CARD', timeDeltaMinutes: 1, reconstructionError: 0.76 },
        { id: 'seq_v3', timestamp: '2026-08-31T06:57:05Z', amount: 98, status: 'FAILED', paymentMethod: 'DEBIT_CARD', timeDeltaMinutes: 1, reconstructionError: 0.88 },
        { id: 'seq_v4', timestamp: '2026-08-31T06:57:55Z', amount: 101, status: 'FAILED', paymentMethod: 'CREDIT_CARD', timeDeltaMinutes: 1, reconstructionError: 0.92 },
        { id: 'seq_v5', timestamp: '2026-08-31T06:58:30Z', amount: 129, status: 'FAILED', paymentMethod: 'CREDIT_CARD', timeDeltaMinutes: 1, reconstructionError: 0.95 }
      ]
    },
    failureCause: 'SUSPICIOUS_VELOCITY_ABUSE',
    failureCode: 'GATEWAY_ERROR / CARD_TESTING_SUSPICION',
    failureReasonDetails: '5 rapid attempts within 3.5 minutes cycling across 4 different card BINs. Typical card testing signature.',
    diagnosisConfidence: 0.97,
    status: 'POLICY_BLOCKED',
    anomalyResult: {
      anomalyScore: 0.94,
      threshold: 0.65,
      decision: 'VETO',
      reason: 'Reconstruction error (0.94) exceeds threshold (0.65). Detected card-testing velocity pattern and amount cycling.',
      isFallbackActive: false,
      latencyMs: 42,
      featureErrors: [
        { featureName: 'Payment Method Switching Velocity', inputScore: 0.91, reconstructedScore: 0.08, reconstructionError: 0.83, contributionPercent: 44, description: '4 distinct cards tried in under 4 minutes' },
        { featureName: 'Timing Irregularity', inputScore: 0.93, reconstructedScore: 0.12, reconstructionError: 0.81, contributionPercent: 32, description: 'Automated rapid-fire sub-minute intervals' },
        { featureName: 'Amount Cycling & Micro-probing', inputScore: 0.88, reconstructedScore: 0.15, reconstructionError: 0.73, contributionPercent: 24, description: 'Probing micro-transactions ₹98 - ₹129' }
      ]
    },
    candidateActions: [
      {
        actionType: 'DO_NOTHING_VETOED',
        label: 'Block & Suppress Outreach (Vetoed)',
        channel: 'DIRECT_RETRY',
        recoveryProbability: 0.02,
        interventionCost: 0,
        incentiveCost: 0,
        expectedContactCost: 0,
        expectedRecoveryGross: 2.58,
        expectedNetRecoveryValue: 2.58,
        recommended: true
      },
      {
        actionType: 'ESCALATE_HUMAN_REVIEW',
        label: 'Escalate to Risk Compliance Officer',
        channel: 'HUMAN',
        recoveryProbability: 0.05,
        interventionCost: 25.00,
        incentiveCost: 0,
        expectedContactCost: 50.00,
        expectedRecoveryGross: 6.45,
        expectedNetRecoveryValue: -68.55,
        recommended: false
      }
    ],
    selectedAction: 'DO_NOTHING_VETOED',
    policyEvaluation: {
      overallResult: 'BLOCKED',
      executedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      deterministic: true,
      explanation: 'VETOED by Risk Gate: LSTM Anomaly Score 0.94 breached security threshold (0.65). Automated outreach suppressed to protect merchant reputation.',
      checks: [
        { ruleId: 'POL_RISK_GATE', ruleName: 'LSTM Anomaly Gate Score', passed: false, thresholdValue: 'Score ≤ 0.65', actualValue: 'Score = 0.94', severity: 'BLOCKING', explanation: 'Severe reconstruction mismatch indicative of automated card testing' },
        { ruleId: 'POL_CONSENT_CHECK', ruleName: 'Merchant Outreach Consent', passed: false, thresholdValue: 'Consent = TRUE', actualValue: 'Consent = FALSE', severity: 'BLOCKING', explanation: 'Disposable email and unverified user' },
        { ruleId: 'POL_MAX_AMOUNT', ruleName: 'Max Automated Amount Limit', passed: true, thresholdValue: '₹25,000', actualValue: '₹129', severity: 'INFO', explanation: 'Micro ticket size' }
      ]
    },
    timelineEvents: [
      { id: 't1', stage: 'DETECTED', title: 'Payment Event Ingested', description: 'Failed transaction ₹129 ingested via Kafka', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), actorService: 'Kafka Broker', status: 'COMPLETED' },
      { id: 't2', stage: 'DIAGNOSING', title: 'Suspicious Pattern Diagnosed', description: 'LightGBM model flagged Card Testing Velocity (97% confidence)', timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(), actorService: 'Diagnosis Service', status: 'COMPLETED' },
      { id: 't3', stage: 'RISK_CHECK', title: 'LSTM Anomaly Gate: VETO TRIGGERED', description: 'Anomaly score 0.94 > 0.65. Auto-action blocked.', timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), actorService: 'LSTM Anomaly Gate', status: 'COMPLETED' },
      { id: 't4', stage: 'POLICY_BLOCKED', title: 'Policy Engine Hard Stop', description: 'Deterministic firewall enforced blocking action. Reason: CARD_TESTING_SUSPICION', timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), actorService: 'Action Gateway', status: 'COMPLETED' }
    ]
  },
  {
    id: 'case_003',
    caseNumber: 'RX-10494',
    paymentId: 'pay_Plm7710Ksw09',
    orderId: 'order_Nmb19921Ka03',
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    amount: 18500,
    customer: {
      id: 'cust_ananya_4401',
      name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@finadvisors.com',
      phone: '+91 99302 11099',
      preferredLanguage: 'English',
      lifetimeProcessedValue: 284000,
      totalTransactions: 14,
      successfulTransactions: 13,
      failedTransactions: 1,
      historicalRecoveryRate: 0.93,
      averageTicketSize: 18000,
      primaryPaymentMethod: 'HDFC Corporate Credit Card',
      contactConsentGranted: true,
      contactsInLast24h: 1,
      currentAnomalyScore: 0.11,
      paymentSequence: [
        { id: 'seq_a1', timestamp: '2026-08-20T11:00:00Z', amount: 18000, status: 'SUCCESS', paymentMethod: 'CREDIT_CARD', timeDeltaMinutes: 0, reconstructionError: 0.06 },
        { id: 'seq_a2', timestamp: '2026-08-31T05:20:00Z', amount: 18500, status: 'FAILED', paymentMethod: 'CREDIT_CARD', timeDeltaMinutes: 15400, reconstructionError: 0.11 }
      ]
    },
    failureCause: 'AUTHENTICATION_3DS_TIMEOUT',
    failureCode: 'GATEWAY_TIMEOUT / 3DS_OTP_EXPIRED',
    failureReasonDetails: 'Issuing bank SMS OTP timed out on checkout. Legitimate high-value subscription invoice.',
    diagnosisConfidence: 0.89,
    status: 'PAYMENT_RECOVERED',
    recoveredAmount: 18500,
    recoveredAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    anomalyResult: {
      anomalyScore: 0.11,
      threshold: 0.65,
      decision: 'PASS',
      reason: 'High trust corporate profile with verified payment history. Zero anomaly flags.',
      isFallbackActive: false,
      latencyMs: 35,
      featureErrors: [
        { featureName: 'Amount Volatility', inputScore: 0.08, reconstructedScore: 0.07, reconstructionError: 0.01, contributionPercent: 9, description: 'Matches historical B2B billing pattern' },
        { featureName: 'Timing Irregularity', inputScore: 0.05, reconstructedScore: 0.05, reconstructionError: 0.00, contributionPercent: 0, description: 'Regular billing cycle spacing' }
      ]
    },
    candidateActions: [
      {
        actionType: 'CREATE_PAYMENT_LINK',
        label: 'Razorpay Instant Payment Link with Card Pre-fill',
        channel: 'PAYMENT_LINK',
        recoveryProbability: 0.88,
        interventionCost: 4.50,
        incentiveCost: 0,
        expectedContactCost: 1.50,
        expectedRecoveryGross: 16280,
        expectedNetRecoveryValue: 16274.00,
        recommended: true
      }
    ],
    selectedAction: 'CREATE_PAYMENT_LINK',
    policyEvaluation: {
      overallResult: 'APPROVED',
      executedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      deterministic: true,
      explanation: 'All safety gates satisfied for high-tier customer recovery.',
      checks: [
        { ruleId: 'POL_MAX_AMOUNT', ruleName: 'Max Automated Amount Limit', passed: true, thresholdValue: '₹25,000', actualValue: '₹18,500', severity: 'BLOCKING', explanation: 'Below automated upper bound' },
        { ruleId: 'POL_RISK_GATE', ruleName: 'LSTM Anomaly Gate Score', passed: true, thresholdValue: 'Score ≤ 0.65', actualValue: 'Score = 0.11', severity: 'BLOCKING', explanation: 'Healthy profile' }
      ]
    },
    razorpayDetails: {
      paymentLinkId: 'plink_Oiw928Ksm01',
      shortUrl: 'https://rzp.io/i/plink_Oiw928Ksm01',
      razorpayOrderId: 'order_Nmb19921Ka03',
      razorpayPaymentId: 'pay_Recov992019918',
      amount: 18500,
      currency: 'INR',
      status: 'paid',
      simulatedWebhookReceived: true
    },
    timelineEvents: [
      { id: 't1', stage: 'DETECTED', title: 'Payment 3DS Failure Ingested', description: 'OTP timeout for ₹18,500', timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(), actorService: 'Webhook Gateway', status: 'COMPLETED' },
      { id: 't2', stage: 'STRATEGY_SELECTED', title: 'Payment Link Strategy Triggered', description: 'Generated Razorpay Payment Link plink_Oiw928Ksm01', timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(), actorService: 'Razorpay Adapter', status: 'COMPLETED' },
      { id: 't3', stage: 'CUSTOMER_CONTACTED', title: 'Payment Link Delivered via WhatsApp & Email', description: 'Delivery confirmation received from notification gateway', timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), actorService: 'Notification Adapter', status: 'COMPLETED' },
      { id: 't4', stage: 'PAYMENT_RECOVERED', title: 'Payment Webhook Verified: ₹18,500 RECOVERED', description: 'Razorpay payment.authorized webhook received. Revenue credited.', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), actorService: 'Verification Service', status: 'COMPLETED' }
    ]
  },
  {
    id: 'case_004',
    caseNumber: 'RX-10495',
    paymentId: 'pay_Kjn8819Lsa04',
    orderId: 'order_Uha7710Ksm04',
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    amount: 32000,
    customer: {
      id: 'cust_vikram_8812',
      name: 'Vikramaditya Rao',
      email: 'vikram.rao@enterpriseindia.org',
      phone: '+91 98450 33819',
      preferredLanguage: 'English',
      lifetimeProcessedValue: 480000,
      totalTransactions: 8,
      successfulTransactions: 7,
      failedTransactions: 1,
      historicalRecoveryRate: 0.85,
      averageTicketSize: 35000,
      primaryPaymentMethod: 'NetBanking (ICICI)',
      contactConsentGranted: true,
      contactsInLast24h: 0,
      currentAnomalyScore: 0.14,
      paymentSequence: []
    },
    failureCause: 'NETWORK_FAILURE',
    failureCode: 'BANK_SERVER_ERROR / ICICI_NETBANKING_DOWN',
    failureReasonDetails: 'ICICI Corporate NetBanking gateway timeout during peak server maintenance window.',
    diagnosisConfidence: 0.94,
    status: 'HUMAN_REVIEW',
    anomalyResult: {
      anomalyScore: 0.14,
      threshold: 0.65,
      decision: 'PASS',
      reason: 'Low anomaly score, but amount exceeds autonomous limit.',
      isFallbackActive: false,
      latencyMs: 30,
      featureErrors: []
    },
    candidateActions: [
      {
        actionType: 'ESCALATE_HUMAN_REVIEW',
        label: 'Escalate to Merchant Account Manager (High Value > ₹20k)',
        channel: 'HUMAN',
        recoveryProbability: 0.92,
        interventionCost: 50.00,
        incentiveCost: 0,
        expectedContactCost: 10.00,
        expectedRecoveryGross: 29440,
        expectedNetRecoveryValue: 29380.00,
        recommended: true
      }
    ],
    selectedAction: 'ESCALATE_HUMAN_REVIEW',
    policyEvaluation: {
      overallResult: 'HUMAN_REVIEW_REQUIRED',
      executedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      deterministic: true,
      explanation: 'Policy Rule Triggered: Amount ₹32,000 > Human Approval Threshold (₹20,000). Automated dispatch held for manual confirmation.',
      checks: [
        { ruleId: 'POL_APPROVAL_THRESHOLD', ruleName: 'Human Approval Ceiling', passed: false, thresholdValue: 'Auto limit ≤ ₹20,000', actualValue: '₹32,000', severity: 'WARNING', explanation: 'High value transaction requires explicit merchant sign-off' }
      ]
    },
    timelineEvents: [
      { id: 't1', stage: 'DETECTED', title: 'High-Value Payment Failed', description: 'NetBanking timeout on ₹32,000 invoice', timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), actorService: 'Webhook Gateway', status: 'COMPLETED' },
      { id: 't2', stage: 'HUMAN_REVIEW', title: 'Held in Human Review Queue', description: 'Assigned to Senior Account Manager. Awaiting approval to dispatch VIP Payment Link.', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), actorService: 'Action Gateway', status: 'IN_PROGRESS' }
    ]
  },
  {
    id: 'case_005',
    caseNumber: 'RX-10496',
    paymentId: 'pay_Yhn99201La05',
    orderId: 'order_Bvc1928Ksa05',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    amount: 2499,
    customer: {
      id: 'cust_deepak_7719',
      name: 'Deepak Nair',
      email: 'deepak.nair@startup.in',
      phone: '+91 94471 22910',
      preferredLanguage: 'English',
      lifetimeProcessedValue: 14994,
      totalTransactions: 6,
      successfulTransactions: 5,
      failedTransactions: 1,
      historicalRecoveryRate: 0.80,
      averageTicketSize: 2499,
      primaryPaymentMethod: 'eMandate / Recurring UPI',
      contactConsentGranted: true,
      contactsInLast24h: 0,
      currentAnomalyScore: 0.06,
      paymentSequence: []
    },
    failureCause: 'SUBSCRIPTION_MANDATE_FAILED',
    failureCode: 'MANDATE_ERROR / PRE_DEBIT_NOTIFICATION_FAILED',
    failureReasonDetails: 'NPCI eMandate 24-hour pre-debit SMS acknowledgment dropped. Safe to trigger smart bounded retry.',
    diagnosisConfidence: 0.95,
    status: 'ACTION_EXECUTED',
    anomalyResult: {
      anomalyScore: 0.06,
      threshold: 0.65,
      decision: 'PASS',
      reason: 'Healthy recurring subscription mandate behavior.',
      isFallbackActive: false,
      latencyMs: 28,
      featureErrors: []
    },
    candidateActions: [
      {
        actionType: 'RETRY_SUBSCRIPTION_MANDATE',
        label: 'Bounded Recurring Mandate Retry (Resilience4j Exponential Backoff)',
        channel: 'DIRECT_RETRY',
        recoveryProbability: 0.78,
        interventionCost: 1.50,
        incentiveCost: 0,
        expectedContactCost: 0,
        expectedRecoveryGross: 1949.22,
        expectedNetRecoveryValue: 1947.72,
        recommended: true
      }
    ],
    selectedAction: 'RETRY_SUBSCRIPTION_MANDATE',
    policyEvaluation: {
      overallResult: 'APPROVED',
      executedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      deterministic: true,
      explanation: 'Bounded retry policy approved: Attempt 1 of 3 scheduled.',
      checks: [
        { ruleId: 'POL_RETRY_CAP', ruleName: 'Max Retry Sequences', passed: true, thresholdValue: 'Max 3 retries', actualValue: 'Attempt 1', severity: 'BLOCKING', explanation: 'Bounded backoff protocol' }
      ]
    },
    timelineEvents: [
      { id: 't1', stage: 'DETECTED', title: 'Recurring Mandate Debit Dropped', description: '₹2,499 SaaS subscription mandate failed', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), actorService: 'Webhook Gateway', status: 'COMPLETED' },
      { id: 't2', stage: 'ACTION_EXECUTED', title: 'Bounded Retry Sequenced', description: 'Scheduled retry window with NPCI pre-debit trigger', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), actorService: 'Razorpay Adapter', status: 'COMPLETED' }
    ]
  },
  {
    id: 'case_006',
    caseNumber: 'RX-10497',
    paymentId: 'pay_Zxc19283La06',
    orderId: 'order_Qwe88192Ka06',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
    amount: 14500,
    customer: {
      id: 'cust_sanjay_3310',
      name: 'Sanjay Mukherjee',
      email: 'sanjay.m@creativestudio.in',
      phone: '+91 98310 55491',
      preferredLanguage: 'Hinglish',
      lifetimeProcessedValue: 87000,
      totalTransactions: 7,
      successfulTransactions: 6,
      failedTransactions: 1,
      historicalRecoveryRate: 0.83,
      averageTicketSize: 12500,
      primaryPaymentMethod: 'UPI',
      contactConsentGranted: true,
      contactsInLast24h: 0,
      currentAnomalyScore: 0.09,
      paymentSequence: []
    },
    failureCause: 'INSUFFICIENT_FUNDS',
    failureCode: 'BANK_DECLINE / SALARY_DATE_PENDING',
    failureReasonDetails: 'Customer requested payment deferral until salary credit (1st of month).',
    diagnosisConfidence: 0.90,
    status: 'CUSTOMER_CONTACTED',
    anomalyResult: {
      anomalyScore: 0.09,
      threshold: 0.65,
      decision: 'PASS',
      reason: 'Clean customer history',
      isFallbackActive: false,
      latencyMs: 25,
      featureErrors: []
    },
    candidateActions: [
      {
        actionType: 'REQUEST_PROMISE_TO_PAY',
        label: 'Promise-to-Pay Commitment Schedule',
        channel: 'VOICE',
        recoveryProbability: 0.84,
        interventionCost: 15.00,
        incentiveCost: 0,
        expectedContactCost: 5.00,
        expectedRecoveryGross: 12180,
        expectedNetRecoveryValue: 12160.00,
        recommended: true
      }
    ],
    selectedAction: 'REQUEST_PROMISE_TO_PAY',
    policyEvaluation: {
      overallResult: 'APPROVED',
      executedAt: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
      deterministic: true,
      explanation: 'Promise-to-pay workflow scheduled for customer specified payday.',
      checks: [
        { ruleId: 'POL_CONSENT', ruleName: 'Promise Tracking Consent', passed: true, thresholdValue: 'Active', actualValue: 'Confirmed via Voice', severity: 'BLOCKING', explanation: 'Customer committed to pay on Sept 2nd' }
      ]
    },
    timelineEvents: [
      { id: 't1', stage: 'DETECTED', title: 'Payment Incomplete', description: '₹14,500 design software renewal failed', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), actorService: 'Webhook Gateway', status: 'COMPLETED' },
      { id: 't2', stage: 'CUSTOMER_CONTACTED', title: 'Promise-to-Pay Established', description: 'Customer confirmed payment commitment for 2026-09-02', timestamp: new Date(Date.now() - 1000 * 60 * 260).toISOString(), actorService: 'Promise-to-Pay Service', status: 'COMPLETED' }
    ]
  },
  {
    id: 'case_007',
    caseNumber: 'RX-10498',
    paymentId: 'pay_Mnb99102La07',
    orderId: 'order_Poi11928Ka07',
    createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    amount: 8900,
    customer: {
      id: 'cust_karan_1920',
      name: 'Karan Mehra',
      email: 'karan.m@invalid-mail.org',
      phone: '+91 98119 00192',
      preferredLanguage: 'English',
      lifetimeProcessedValue: 8900,
      totalTransactions: 2,
      successfulTransactions: 0,
      failedTransactions: 2,
      historicalRecoveryRate: 0.0,
      averageTicketSize: 8900,
      primaryPaymentMethod: 'Credit Card',
      contactConsentGranted: false,
      contactsInLast24h: 2,
      currentAnomalyScore: 0.45,
      paymentSequence: []
    },
    failureCause: 'CARD_DECLINED_HARD',
    failureCode: 'CARD_BLOCKED_STOLEN / LOST_CARD',
    failureReasonDetails: 'Issuing bank reported card permanently disabled / stolen. Unrecoverable via this instrument.',
    diagnosisConfidence: 0.99,
    status: 'RECOVERY_FAILED',
    isException: true,
    exceptionReason: 'Card permanently deactivated by issuer. Alternative payment method not provided after 2 reminders.',
    anomalyResult: {
      anomalyScore: 0.45,
      threshold: 0.65,
      decision: 'PASS',
      reason: 'Moderate anomaly, hard card decline',
      isFallbackActive: false,
      latencyMs: 31,
      featureErrors: []
    },
    candidateActions: [
      {
        actionType: 'DO_NOTHING_VETOED',
        label: 'Hard Decline - Stop Retry Workflow',
        channel: 'DIRECT_RETRY',
        recoveryProbability: 0.01,
        interventionCost: 0,
        incentiveCost: 0,
        expectedContactCost: 0,
        expectedRecoveryGross: 89,
        expectedNetRecoveryValue: 89.00,
        recommended: true
      }
    ],
    selectedAction: 'DO_NOTHING_VETOED',
    policyEvaluation: {
      overallResult: 'BLOCKED',
      executedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
      deterministic: true,
      explanation: 'Hard decline stop-rule enforced. Do not attempt further debit.',
      checks: [
        { ruleId: 'POL_STOP_HARD_DECLINE', ruleName: 'Hard Decline Brake', passed: false, thresholdValue: 'Soft Decline Only', actualValue: 'LOST_CARD_HARD_DECLINE', severity: 'BLOCKING', explanation: 'Preventing unnecessary gateway charges' }
      ]
    },
    timelineEvents: [
      { id: 't1', stage: 'DETECTED', title: 'Hard Card Decline Ingested', description: 'Issuer code: CARD_BLOCKED', timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(), actorService: 'Webhook Gateway', status: 'COMPLETED' },
      { id: 't2', stage: 'RECOVERY_FAILED', title: 'Honest Exception: Recovery Closed', description: 'Marked as unrecoverable following stopping rules', timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(), actorService: 'Action Gateway', status: 'COMPLETED' }
    ]
  }
];

// Add additional synthetic items to represent a robust 52-case batch
for (let i = 8; i <= 52; i++) {
  const causes: Array<{ cause: any; code: string; desc: string; amount: number; rate: number }> = [
    { cause: 'INSUFFICIENT_FUNDS', code: 'BANK_DECLINE_LIMIT', desc: 'Temporary account threshold reached', amount: Math.floor(2500 + (i * 380)), rate: 0.81 },
    { cause: 'NETWORK_FAILURE', code: 'GATEWAY_TIMEOUT', desc: 'Bank switch handshake timeout', amount: Math.floor(1800 + (i * 240)), rate: 0.86 },
    { cause: 'AUTHENTICATION_3DS_TIMEOUT', code: '3DS_EXPIRED', desc: 'Customer dropped off at OTP screen', amount: Math.floor(4500 + (i * 510)), rate: 0.77 },
    { cause: 'CHECKOUT_DROP_OFF', code: 'CHECKOUT_ABANDONED', desc: 'User abandoned payment method selection', amount: Math.floor(3200 + (i * 190)), rate: 0.68 },
    { cause: 'UPI_COLLECT_EXPIRED', code: 'UPI_APP_TIMEOUT', desc: 'Collect request expired on UPI app', amount: Math.floor(1200 + (i * 150)), rate: 0.74 }
  ];
  
  const chosen = causes[i % causes.length];
  const isRecovered = i % 3 === 0;
  const isVetoed = i % 7 === 0;
  const status = isVetoed ? 'POLICY_BLOCKED' : isRecovered ? 'PAYMENT_RECOVERED' : 'ACTION_QUEUED';
  
  INITIAL_RECOVERY_CASES.push({
    id: `case_${i.toString().padStart(3, '0')}`,
    caseNumber: `RX-105${i.toString().padStart(2, '0')}`,
    paymentId: `pay_Synth${i.toString().padStart(4, '0')}La`,
    orderId: `order_Synth${i.toString().padStart(4, '0')}Ka`,
    createdAt: new Date(Date.now() - 1000 * 60 * (i * 15)).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * (i * 10)).toISOString(),
    amount: chosen.amount,
    customer: {
      id: `cust_synth_${i}`,
      name: `Customer Batch #${i}`,
      email: `merchant.user${i}@sample.in`,
      phone: `+91 98${(10000000 + i * 7321).toString().slice(0, 8)}`,
      preferredLanguage: i % 2 === 0 ? 'Hinglish' : 'English',
      lifetimeProcessedValue: chosen.amount * 4,
      totalTransactions: 6,
      successfulTransactions: 5,
      failedTransactions: 1,
      historicalRecoveryRate: chosen.rate,
      averageTicketSize: chosen.amount,
      primaryPaymentMethod: 'UPI',
      contactConsentGranted: true,
      contactsInLast24h: 0,
      currentAnomalyScore: isVetoed ? 0.88 : 0.12,
      paymentSequence: []
    },
    failureCause: isVetoed ? 'SUSPICIOUS_VELOCITY_ABUSE' : chosen.cause,
    failureCode: isVetoed ? 'CARD_TESTING_SUSPICION' : chosen.code,
    failureReasonDetails: chosen.desc,
    diagnosisConfidence: 0.92,
    status: status as any,
    recoveredAmount: isRecovered ? chosen.amount : undefined,
    recoveredAt: isRecovered ? new Date(Date.now() - 1000 * 60 * (i * 8)).toISOString() : undefined,
    anomalyResult: {
      anomalyScore: isVetoed ? 0.88 : 0.12,
      threshold: 0.65,
      decision: isVetoed ? 'VETO' : 'PASS',
      reason: isVetoed ? 'High sequence anomaly score (0.88) triggered risk gate' : 'Normal behavioral sequence',
      isFallbackActive: false,
      latencyMs: 32,
      featureErrors: []
    },
    candidateActions: [
      {
        actionType: 'CREATE_PAYMENT_LINK',
        label: 'Razorpay Payment Link',
        channel: 'PAYMENT_LINK',
        recoveryProbability: chosen.rate,
        interventionCost: 4.5,
        incentiveCost: 0,
        expectedContactCost: 1.5,
        expectedRecoveryGross: Math.round(chosen.amount * chosen.rate),
        expectedNetRecoveryValue: Math.round(chosen.amount * chosen.rate - 6),
        recommended: true
      }
    ],
    selectedAction: isVetoed ? 'DO_NOTHING_VETOED' : 'CREATE_PAYMENT_LINK',
    policyEvaluation: {
      overallResult: isVetoed ? 'BLOCKED' : 'APPROVED',
      executedAt: new Date(Date.now() - 1000 * 60 * (i * 10)).toISOString(),
      deterministic: true,
      explanation: isVetoed ? 'Blocked by LSTM Anomaly Gate' : 'Passed standard merchant bounds',
      checks: [
        { ruleId: 'POL_RISK', ruleName: 'LSTM Anomaly Check', passed: !isVetoed, thresholdValue: '0.65', actualValue: isVetoed ? '0.88' : '0.12', severity: 'BLOCKING', explanation: 'Sequence evaluation' }
      ]
    },
    timelineEvents: [
      { id: `t1_${i}`, stage: 'DETECTED', title: 'Payment Ingested', description: `Failed event for ₹${chosen.amount}`, timestamp: new Date(Date.now() - 1000 * 60 * (i * 15)).toISOString(), actorService: 'Kafka', status: 'COMPLETED' },
      { id: `t2_${i}`, stage: status as any, title: `State: ${status}`, description: 'Updated pipeline state', timestamp: new Date(Date.now() - 1000 * 60 * (i * 10)).toISOString(), actorService: 'Revenue Orchestrator', status: 'COMPLETED' }
    ]
  });
}

export const INITIAL_PROMISES: PromiseToPay[] = [
  {
    id: 'ptp_001',
    caseId: 'case_006',
    caseNumber: 'RX-10497',
    customerName: 'Sanjay Mukherjee',
    customerPhone: '+91 98310 55491',
    amount: 14500,
    promisedDate: '2026-09-02',
    status: 'ACTIVE',
    channel: 'VOICE_CALL',
    reminderScheduledAt: '2026-09-02T09:30:00Z',
    notes: 'Customer confirmed payment will be completed immediately upon monthly salary deposit.',
    lastFollowUpAt: new Date().toISOString()
  },
  {
    id: 'ptp_002',
    caseId: 'case_012',
    caseNumber: 'RX-10503',
    customerName: 'Meera Nambiar',
    customerPhone: '+91 98401 22910',
    amount: 6800,
    promisedDate: '2026-08-31',
    status: 'DUE_TODAY',
    channel: 'PAYMENT_LINK',
    reminderScheduledAt: '2026-08-31T12:00:00Z',
    notes: 'Automated SMS reminder queued for 12 PM.',
    lastFollowUpAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 'ptp_003',
    caseId: 'case_018',
    caseNumber: 'RX-10509',
    customerName: 'Kishore Kumar',
    customerPhone: '+91 97110 88201',
    amount: 9200,
    promisedDate: '2026-08-28',
    status: 'KEPT',
    channel: 'SMS_CONVERSATION',
    reminderScheduledAt: '2026-08-28T10:00:00Z',
    notes: 'Paid successfully via Razorpay UPI link on promised date.',
    lastFollowUpAt: '2026-08-28T11:15:00Z'
  },
  {
    id: 'ptp_004',
    caseId: 'case_024',
    caseNumber: 'RX-10515',
    customerName: 'Priya Iyer',
    customerPhone: '+91 99201 77319',
    amount: 11400,
    promisedDate: '2026-08-27',
    status: 'BROKEN',
    channel: 'VOICE_CALL',
    reminderScheduledAt: '2026-08-27T09:00:00Z',
    notes: 'Payment link expired without completion. Re-entering diagnostic scoring pipeline.',
    lastFollowUpAt: '2026-08-29T14:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    eventId: 'evt_99218La',
    paymentId: 'pay_Oih82Kjd819',
    caseNumber: 'RX-10492',
    actorService: 'Action Gateway',
    decision: 'APPROVED_ACTION',
    reason: 'Complies with all deterministic merchant limits: Amount ₹7,450 < ₹25,000, 0 contacts in 24h, Anomaly Score 0.08 < 0.65',
    mlScores: {
      diagnosisConfidence: 0.91,
      anomalyScore: 0.08,
      recoveryPropensity: 0.82
    },
    policyResult: 'APPROVED',
    actionTaken: 'CREATE_PAYMENT_LINK (Razorpay Test API)',
    apiStatusCode: 200,
    payloadDigest: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    metadata: {
      channel: 'PAYMENT_LINK',
      shortUrl: 'https://rzp.io/i/plink_rx10492',
      language: 'Hinglish'
    }
  },
  {
    id: 'aud_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    eventId: 'evt_77192Ka',
    paymentId: 'pay_Abc9921Ksm18',
    caseNumber: 'RX-10493',
    actorService: 'LSTM Anomaly Gate',
    decision: 'VETO_ENFORCED',
    reason: 'Sequence reconstruction error 0.94 exceeded threshold 0.65. Abusive card-testing velocity pattern detected across 4 cards.',
    mlScores: {
      diagnosisConfidence: 0.97,
      anomalyScore: 0.94,
      recoveryPropensity: 0.02
    },
    policyResult: 'BLOCKED',
    actionTaken: 'DO_NOTHING_VETOED (Outreach Suppressed)',
    payloadDigest: 'sha256:4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123',
    metadata: {
      distinctCards: 4,
      windowMinutes: 3.5,
      fraudBrake: 'ACTIVE'
    }
  },
  {
    id: 'aud_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    eventId: 'evt_66102Ma',
    paymentId: 'pay_Plm7710Ksw09',
    caseNumber: 'RX-10494',
    actorService: 'Verification Service',
    decision: 'PAYMENT_VERIFIED',
    reason: 'Razorpay webhook signature verified. Amount ₹18,500 successfully recovered.',
    mlScores: {
      diagnosisConfidence: 0.89,
      anomalyScore: 0.11,
      recoveryPropensity: 0.88
    },
    policyResult: 'APPROVED',
    actionTaken: 'MONEY_RECOVERED_CREDITED',
    apiStatusCode: 200,
    payloadDigest: 'sha256:8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
    metadata: {
      recoveredAmount: 18500,
      orderId: 'order_Nmb19921Ka03'
    }
  }
];
