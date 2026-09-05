import { z } from 'zod';

export const ActionRequestSchema = z.object({
  actionType: z.enum([
    'CREATE_PAYMENT_LINK', 'RETRY_SUBSCRIPTION_MANDATE', 'SEND_HINGLISH_SMS_NUDGE',
    'OUTBOUND_VOICE_CALL', 'REQUEST_PROMISE_TO_PAY', 'SWITCH_PAYMENT_METHOD',
    'ESCALATE_HUMAN_REVIEW', 'DO_NOTHING_VETOED'
  ]),
  reason: z.string().trim().max(500).optional()
}).strict();

export const PolicyUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  maxAutomatedRecoveryAmount: z.number().finite().min(0).optional(),
  maxContactsPerCustomer24h: z.number().int().min(0).max(20).optional(),
  cooldownPeriodHours: z.number().finite().min(0).max(168).optional(),
  anomalyThreshold: z.number().finite().min(0).max(1).optional(),
  minRecoveryConfidence: z.number().finite().min(0).max(1).optional(),
  allowVoiceRecovery: z.boolean().optional(),
  allowSmsRecovery: z.boolean().optional(),
  allowPaymentLinks: z.boolean().optional(),
  allowedContactStartHour: z.number().int().min(0).max(23).optional(),
  allowedContactEndHour: z.number().int().min(0).max(23).optional(),
  requireHumanApprovalAbove: z.number().finite().min(0).optional(),
  requireConsentForOutreach: z.boolean().optional()
}).strict();

export const TranslationRequestSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  from: z.string().trim().default('en'),
  to: z.enum(['en', 'hi', 'ta', 'te', 'hinglish']).default('hi')
}).strict();

export const PromiseRequestSchema = z.object({
  caseId: z.string().min(1),
  caseNumber: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(5),
  amount: z.number().finite().positive(),
  promisedDate: z.string().datetime(),
  status: z.enum(['ACTIVE', 'DUE_TODAY', 'KEPT', 'BROKEN', 'EXPIRED']).default('ACTIVE'),
  channel: z.enum(['VOICE_CALL', 'SMS_CONVERSATION', 'PAYMENT_LINK']),
  reminderScheduledAt: z.string().datetime(),
  notes: z.string().max(1000).default('')
}).strict();