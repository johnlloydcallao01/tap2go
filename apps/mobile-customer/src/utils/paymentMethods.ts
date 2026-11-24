import type { ImageSourcePropType } from 'react-native';

export type PaymentMethod =
  | 'gcash'
  | 'grab_pay'
  | 'paymaya'
  | 'billease'
  | 'dob'
  | 'brankas'
  | 'qrph'
  | 'wallet';

export type BankCode = 'bpi' | 'ubp' | 'bdo' | 'landbank' | 'metrobank';

export type BankOption = {
  code: BankCode;
  label: string;
};

export const BANK_OPTIONS: Partial<Record<PaymentMethod, BankOption[]>> = {
  dob: [
    { code: 'bpi', label: 'BPI' },
    { code: 'ubp', label: 'UnionBank' },
  ],
  brankas: [
    { code: 'bdo', label: 'BDO' },
    { code: 'metrobank', label: 'Metrobank' },
    { code: 'landbank', label: 'LandBank' },
  ],
};

export const AVAILABLE_PAYMENT_METHODS: PaymentMethod[] = [
  'gcash',
  'grab_pay',
  'paymaya',
  'billease',
  'dob',
  'brankas',
  'qrph',
  'wallet',
];

export const PAYMENT_METHOD_OPTIONS: Record<
  PaymentMethod,
  { srcs: ImageSourcePropType[]; label: string }
> = {
  gcash: {
    srcs: [require('../../assets/payment-logos/gcash.png')],
    label: 'GCash',
  },
  grab_pay: {
    srcs: [require('../../assets/payment-logos/grabpay.png')],
    label: 'GrabPay',
  },
  paymaya: {
    srcs: [require('../../assets/payment-logos/maya.png')],
    label: 'Maya',
  },
  billease: {
    srcs: [require('../../assets/payment-logos/billease.png')],
    label: 'BillEase (BNPL)',
  },
  dob: {
    srcs: [
      require('../../assets/payment-logos/bpi.png'),
      require('../../assets/payment-logos/ubp.png'),
    ],
    label: 'Online Banking (BPI/UBP)',
  },
  brankas: {
    srcs: [
      require('../../assets/payment-logos/bdo.png'),
      require('../../assets/payment-logos/metrobank.png'),
      require('../../assets/payment-logos/landbank.png'),
    ],
    label: 'Online Banking (BDO/Metrobank/LandBank)',
  },
  qrph: {
    srcs: [require('../../assets/payment-logos/qrph.png')],
    label: 'QR Ph',
  },
  wallet: {
    srcs: [],
    label: 'Tap2Go Wallet',
  },
};
