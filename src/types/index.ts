export interface ParentData {
  parentEmail: string;
  parentName: string;
  childNames: string;
  qrCodeUrl: string;
  childId?: string;
}

export interface EmailStatus {
  parentEmail: string;
  parentName: string;
  status: 'pending' | 'sending' | 'success' | 'error';
  error?: string;
  response?: any;
}

export interface EmailProgress {
  total: number;
  sent: number;
  failed: number;
  current?: string;
}