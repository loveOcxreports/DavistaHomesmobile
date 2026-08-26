export type Line = { desc: string; unit: number; nights: number; price: number };

export type Invoice = {
  id: string;
  invoiceNo: string;
  companyAddr: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  checkIn: string;
  checkOut: string;
  inTime: string;
  outTime: string;
  lines: Line[];
  terms: string;
  payment: string;
  signName: string;
  signRole: string;
  total?: number;
  savedAt: string | null;
};

export type Client = { name: string; phone: string; email: string };

export type Tab = 'invoice' | 'saved' | 'guests';
