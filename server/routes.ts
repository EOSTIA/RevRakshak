import express from 'express';
import { store } from './data/store.js';
import { compileNaturalLanguagePolicy } from './services/policyCompiler.js';

export const apiRouter = express.Router();

// Middleware to parse JSON
apiRouter.use(express.json());

// 1. Dashboard Summary
apiRouter.get('/dashboard/summary', (req, res) => {
  try {
    const summary = store.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Recovery Queue & Filter
apiRouter.get('/recovery', (req, res) => {
  try {
    const { status, cause, risk, search, sortBy } = req.query;
    let results = [...store.cases];

    if (status && status !== 'ALL') {
      results = results.filter(c => c.status === status);
    }
    if (cause && cause !== 'ALL') {
      results = results.filter(c => c.failureCause === cause);
    }
    if (risk && risk !== 'ALL') {
      results = results.filter(c => c.anomalyResult.decision === risk);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      results = results.filter(c =>
        c.caseNumber.toLowerCase().includes(q) ||
        c.customer.name.toLowerCase().includes(q) ||
        c.paymentId.toLowerCase().includes(q) ||
        c.orderId.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'AMOUNT_DESC') {
      results.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'EXPECTED_VALUE_DESC') {
      results.sort((a, b) => {
        const topA = a.candidateActions.find(x => x.recommended) || a.candidateActions[0];
        const topB = b.candidateActions.find(x => x.recommended) || b.candidateActions[0];
        return (topB?.expectedNetRecoveryValue || 0) - (topA?.expectedNetRecoveryValue || 0);
      });
    } else if (sortBy === 'ANOMALY_DESC') {
      results.sort((a, b) => b.anomalyResult.anomalyScore - a.anomalyResult.anomalyScore);
    } else {
      // Default: recency
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Dashboard opportunity / risk / exceptions summaries
apiRouter.get('/dashboard/opportunities', (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 5);
    res.json({ success: true, data: store.getOpportunityCandidates(Number.isFinite(limit) ? Math.max(1, limit) : 5) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/dashboard/risk-gate-summary', (req, res) => {
  try {
    res.json({ success: true, data: store.getRiskGateSummary() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/dashboard/exceptions', (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    res.json({ success: true, data: store.getExceptions(Number.isFinite(limit) ? Math.max(1, limit) : 10) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Single Case Detail and supporting views
apiRouter.get('/recovery/:id/events', (req, res) => {
  try {
    const item = store.getCaseById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Recovery case not found' });
    }
    res.json({ success: true, data: store.getCaseEvents(req.params.id) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/recovery/:id/decision-trace', (req, res) => {
  try {
    const trace = store.getDecisionTrace(req.params.id);
    if (!trace) {
      return res.status(404).json({ success: false, error: 'Decision trace not found' });
    }
    res.json({ success: true, data: trace });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/recovery/:id', (req, res) => {
  try {
    const item = store.getCaseById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Recovery case not found' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Action Gateway Execute
apiRouter.post('/recovery/:id/execute', (req, res) => {
  try {
    const { actionType, reason } = req.body;
    if (!actionType) {
      return res.status(400).json({ success: false, error: 'actionType is required' });
    }
    const result = store.executeAction(req.params.id, actionType, reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Simulate Razorpay Webhook Confirmation
apiRouter.post('/recovery/:id/simulate-webhook', (req, res) => {
  try {
    const result = store.simulatePaymentWebhook(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 7. ML Anomaly prediction endpoint
apiRouter.get('/ml/predictions/:paymentId', (req, res) => {
  try {
    const prediction = store.getAnomalyPrediction(req.params.paymentId);
    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found for payment id' });
    }
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Batch Recovery Execution
apiRouter.post('/recovery/batch-run', (req, res) => {
  try {
    const result = store.runBatchRecovery();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Customers / Customer Profile
apiRouter.get('/customers/:id', (req, res) => {
  try {
    const item = store.cases.find(c => c.customer.id === req.params.id || c.customer.email === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: item.customer, activeCases: store.cases.filter(c => c.customer.id === item.customer.id) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Policy Management
apiRouter.get('/policies', (req, res) => {
  res.json({ success: true, data: store.policy });
});

apiRouter.put('/policies', (req, res) => {
  try {
    store.policy = {
      ...store.policy,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({ success: true, data: store.policy });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/policies/compile', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }
    const result = await compileNaturalLanguagePolicy(prompt, store.policy);
    store.policy = result.compiledPolicy;
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Promise to Pay
apiRouter.get('/promises', (req, res) => {
  res.json({ success: true, data: store.promises });
});

apiRouter.post('/promises', (req, res) => {
  try {
    const newPromise = {
      ...req.body,
      id: `ptp_${Date.now()}`
    };
    store.promises.unshift(newPromise);
    res.json({ success: true, data: newPromise });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 10. Audit Trail
apiRouter.get('/audit', (req, res) => {
  res.json({ success: true, count: store.auditLogs.length, data: store.auditLogs });
});

// 11. ML Observability & Metrics
apiRouter.get('/ml/metrics', (req, res) => {
  res.json({ success: true, data: store.mlMetrics });
});

apiRouter.get('/recovery/pipeline', (req, res) => {
  try {
    res.json({ success: true, data: store.getRecoveryPipelineFlow() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/agent/summary', (req, res) => {
  try {
    res.json({ success: true, data: store.getAgentSummaries() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/ml/train', (req, res) => {
  try {
    res.json({ success: true, data: store.getMlTrainingStatus() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/ml/batch-evaluation', (req, res) => {
  try {
    res.json({ success: true, data: store.getBatchEvaluation() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/system/kafka', async (req, res) => {
  try {
    const { kafkaBus } = await import('./services/kafkaBus.js');
    res.json({ success: true, data: { topics: kafkaBus.getTopics(), traffic: kafkaBus.getTrafficSnapshot() } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/system/redis', (req, res) => {
  try {
    const { redisStore } = require('./services/redisStore.js');
    void redisStore.keys().then((keys) => {
      res.json({ success: true, data: { keys, status: 'ACTIVE' } });
    }).catch((error: any) => {
      res.status(500).json({ success: false, error: error.message });
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/compliance/:id', (req, res) => {
  try {
    const caseItem = store.getCaseById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, error: 'Recovery case not found' });
    }

    const { evaluateCompliance } = require('./services/compliance.js');
    const actionType = caseItem.selectedAction || 'CREATE_PAYMENT_LINK';
    const result = evaluateCompliance(caseItem, actionType, store.policy);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/sms/simulate', (req, res) => {
  try {
    res.json({ success: true, data: store.getSmsSimulations() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Microservice & System Health
apiRouter.get('/system/health', (req, res) => {
  res.json({
    success: true,
    data: {
      services: store.health,
      faultInjections: store.faultInjections
    }
  });
});

apiRouter.post('/system/fault-toggle', (req, res) => {
  try {
    const { fault, value } = req.body;
    if (!fault || typeof value !== 'boolean') {
      return res.status(400).json({ success: false, error: 'fault and boolean value are required' });
    }
    store.setFault(fault, value);
    res.json({
      success: true,
      message: `Fault state for ${fault} set to ${value}`,
      data: {
        services: store.health,
        faultInjections: store.faultInjections
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 13. Recovery Flight Simulator
apiRouter.post('/simulator/run', (req, res) => {
  try {
    const results = store.runFlightSimulation(req.body);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
