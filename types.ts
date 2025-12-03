export enum UserRole {
  GUARDIAN = 'GUARDIAN', // Опекун
  CURATOR = 'CURATOR',   // Куратор
  NONE = 'NONE'
}

export enum AppStep {
  START = 'START',
  ROLE_INFO = 'ROLE_INFO',
  PET_NAME = 'PET_NAME',
  PAYMENT_DATE = 'PAYMENT_DATE',
  AMOUNT_SELECTION = 'AMOUNT_SELECTION',
  CONFIRMATION = 'CONFIRMATION',
  PAYMENT_PROCESS = 'PAYMENT_PROCESS',
  DASHBOARD = 'DASHBOARD',
  ADMIN_PANEL = 'ADMIN_PANEL'
}

export interface UserState {
  role: UserRole;
  petName: string;
  paymentDay: number;
  amount: number;
  isRecurring: boolean;
  history: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  petName: string;
  role: UserRole;
  status: 'completed' | 'pending';
}

export const GUARDIAN_TIERS = {
  PARTIAL: { label: 'Частичная', min: 3500 },
  STANDARD: { label: 'Стандартная', amount: 8000 },
  FULL: { label: 'Полная', amount: 15000 },
};