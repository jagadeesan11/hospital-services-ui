import { billingApi } from './api';

export enum BillStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  INSURANCE = 'INSURANCE',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  OTHER = 'OTHER'
}

export interface BillItemDTO {
  id?: number;
  serviceId?: number;
  serviceName: string;
  serviceType: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  taxAmount: number;
  totalAmount: number;
  appointmentId?: number;
  medicalRecordId?: number;
  labTestId?: number;
  pharmacyItemId?: number;
  // Keep old field names for backward compatibility
  total?: number;
  tax?: number;
  totalBeforeTax?: number;
}

export interface BillPayment {
  id?: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface Bill {
  id?: number;
  billNumber?: string;
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    bloodGroup?: string;
    hospital?: any;
    appointments?: any[];
    bills?: any[];
  };
  hospital?: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
  };
  patientId?: number;
  patientName?: string;
  hospitalId?: number;
  hospitalName?: string;
  billDate: string;
  dueDate: string;
  status: BillStatus;
  billItems: BillItemDTO[];
  payments?: BillPayment[];
  subTotal: number; // Changed from subtotal to match API
  taxAmount: number; // Changed from tax to match API
  discountAmount?: number; // Changed from discount to match API
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number; // Changed from balanceDue to match API
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  // Keep old field names for backward compatibility
  subtotal?: number;
  tax?: number;
  discount?: number;
  balanceDue?: number;
}

// API service for Bill Management
export const billingService = {
  //getAllBills: () => billingApi.get('/api/bills'),
  getBill: (billId: number) => billingApi.get(`/api/bills/${billId}`),
  createBill: (bill: Bill) => billingApi.post('/api/bills', bill),
  updateBillStatus: (billId: number, status: BillStatus) =>
    billingApi.put(`/api/bills/${billId}/status`, { status }),
  addPayment: (billId: number, payment: BillPayment) =>
    billingApi.post(`/api/bills/${billId}/payment`, payment),
  getPatientBills: (patientId: number) =>
    billingApi.get(`/api/bills/patient/${patientId}`),
  getOverdueBills: () => billingApi.get('/api/bills/overdue'),
  getHospitalBills: (hospitalId: number) =>
    billingApi.get(`/api/bills/hospital/${hospitalId}`),
  createPharmacyBill: (pharmacyBill: Bill) =>
    billingApi.post('/api/bills/pharmacy', pharmacyBill),
  createLabBill: (labBill: Bill) =>
    billingApi.post('/api/bills/lab', labBill),
  createConsultationBill: (appointmentId: number, consultationBill: Bill) =>
    billingApi.post(`/api/bills/consultation/${appointmentId}`, consultationBill)
};
