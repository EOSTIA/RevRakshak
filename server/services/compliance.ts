import type { MerchantPolicy, RecoveryCase, ActionType } from '../../src/types.js';

export type ComplianceResult = {
  approved: boolean;
  checks: Array<{
    rule: string;
    passed: boolean;
    detail: string;
  }>;
  explanation: string;
};

export function evaluateCompliance(caseItem: RecoveryCase, actionType: ActionType, policy: MerchantPolicy): ComplianceResult {
  const checks: ComplianceResult['checks'] = [];

  const customer = caseItem.customer;
  const hour = new Date().getHours();
  const isOutreach = ['OUTBOUND_VOICE_CALL', 'SEND_HINGLISH_SMS_NUDGE', 'CREATE_PAYMENT_LINK'].includes(actionType);

  if (caseItem.amount > policy.maxAutomatedRecoveryAmount && actionType !== 'ESCALATE_HUMAN_REVIEW' && actionType !== 'DO_NOTHING_VETOED') {
    checks.push({
      rule: 'automated_amount_cap',
      passed: false,
      detail: `Amount ₹${caseItem.amount.toLocaleString('en-IN')} exceeds the automated recovery cap of ₹${policy.maxAutomatedRecoveryAmount.toLocaleString('en-IN')}.`
    });
  } else {
    checks.push({
      rule: 'automated_amount_cap',
      passed: true,
      detail: 'Amount is within the automated recovery cap or the action is non-automated.'
    });
  }

  if (isOutreach && policy.requireConsentForOutreach && !customer.contactConsentGranted) {
    checks.push({
      rule: 'customer_consent',
      passed: false,
      detail: 'Customer consent is required before outreach, and no valid consent was recorded.'
    });
  } else {
    checks.push({
      rule: 'customer_consent',
      passed: true,
      detail: 'Consent present or outreach allowed by policy.'
    });
  }

  if (isOutreach && customer.contactsInLast24h >= policy.maxContactsPerCustomer24h) {
    checks.push({
      rule: 'contact_limit',
      passed: false,
      detail: `Customer already has ${customer.contactsInLast24h} contacts in 24h, exceeding cap of ${policy.maxContactsPerCustomer24h}.`
    });
  } else {
    checks.push({
      rule: 'contact_limit',
      passed: true,
      detail: `Contact count ${customer.contactsInLast24h} is within the 24h cap.`
    });
  }

  if (isOutreach && (hour < policy.allowedContactStartHour || hour > policy.allowedContactEndHour)) {
    checks.push({
      rule: 'contact_window',
      passed: false,
      detail: `Current local hour ${hour} is outside the allowed outreach window ${policy.allowedContactStartHour}:00-${policy.allowedContactEndHour}:00.`
    });
  } else {
    checks.push({
      rule: 'contact_window',
      passed: true,
      detail: 'Current hour is within the permitted outreach window.'
    });
  }

  if (actionType === 'OUTBOUND_VOICE_CALL' && !policy.allowVoiceRecovery) {
    checks.push({
      rule: 'voice_permission',
      passed: false,
      detail: 'Voice recovery is disabled by policy.'
    });
  } else if (actionType === 'SEND_HINGLISH_SMS_NUDGE' && !policy.allowSmsRecovery) {
    checks.push({
      rule: 'sms_permission',
      passed: false,
      detail: 'SMS outreach is disabled by policy.'
    });
  } else if (actionType === 'CREATE_PAYMENT_LINK' && !policy.allowPaymentLinks) {
    checks.push({
      rule: 'payment_link_permission',
      passed: false,
      detail: 'Payment-link outreach is disabled by policy.'
    });
  } else {
    checks.push({
      rule: 'channel_permission',
      passed: true,
      detail: 'Selected channel is permitted under policy.'
    });
  }

  if (caseItem.amount > policy.requireHumanApprovalAbove) {
    checks.push({
      rule: 'human_approval',
      passed: actionType === 'ESCALATE_HUMAN_REVIEW' || actionType === 'DO_NOTHING_VETOED',
      detail: `High-value payment amount ₹${caseItem.amount.toLocaleString('en-IN')} requires human review before automated recovery.`
    });
  } else {
    checks.push({
      rule: 'human_approval',
      passed: true,
      detail: 'Payment amount is within the automated approval threshold.'
    });
  }

  const failed = checks.filter((check) => !check.passed);
  const approved = failed.length === 0;

  return {
    approved,
    checks,
    explanation: approved
      ? 'Action complies with consent, risk, and channel policy guardrails.'
      : `Action blocked by compliance gate: ${failed.map((check) => check.rule).join(', ')}`
  };
}
