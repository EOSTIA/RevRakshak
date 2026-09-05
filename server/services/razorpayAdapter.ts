import Razorpay from 'razorpay';
import crypto from 'node:crypto';

export interface OfflinePaymentLinkRequest {
  amount: number;
  currency: 'INR';
  description: string;
  reference_id: string;
  customer: { name: string; contact: string; email: string };
  notify: { sms: boolean; email: boolean };
  expire_by: number;
}

export interface OfflinePayoutRequest {
  account_number: string;
  fund_account: { account_type: 'bank_account'; bank_account: { name: string; ifsc: string; account_number: string } };
  amount: number;
  currency: 'INR';
  mode: 'NEFT' | 'RTGS' | 'IMPS' | 'UPI';
  purpose: 'refund' | 'cashback' | 'payout';
  queue_if_low_balance: boolean;
  reference_id: string;
}

export class RazorpayOfflineAdapter {
  private readonly client: Razorpay;

  constructor() {
    this.client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_offline',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'offline_secret'
    });
  }

  createPaymentLinkRequest(input: {
    amount: number;
    caseId: string;
    customer: { name: string; phone: string; email: string };
  }): OfflinePaymentLinkRequest {
    return {
      amount: Math.round(input.amount * 100),
      currency: 'INR',
      description: `RevRakshak recovery for ${input.caseId}`,
      reference_id: input.caseId,
      customer: { name: input.customer.name, contact: input.customer.phone, email: input.customer.email },
      notify: { sms: false, email: false },
      expire_by: Math.floor(Date.now() / 1000) + 86400
    };
  }

  createOfflinePaymentLink(input: Parameters<RazorpayOfflineAdapter['createPaymentLinkRequest']>[0]) {
    const request = this.createPaymentLinkRequest(input);
    const token = crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex').slice(0, 16);
    return {
      mode: 'OFFLINE_TEST_ADAPTER' as const,
      request,
      paymentLinkId: `plink_offline_${token}`,
      shortUrl: `https://rzp.io/i/offline-${token}`,
      sdkReady: Boolean(this.client)
    };
  }

  buildPayoutRequest(input: {
    caseId: string;
    amount: number;
    accountNumber: string;
    accountName: string;
    ifsc: string;
  }): OfflinePayoutRequest {
    return {
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || 'offline_account',
      fund_account: {
        account_type: 'bank_account',
        bank_account: { name: input.accountName, ifsc: input.ifsc, account_number: input.accountNumber }
      },
      amount: Math.round(input.amount * 100),
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: input.caseId
    };
  }
}

export const razorpayOfflineAdapter = new RazorpayOfflineAdapter();