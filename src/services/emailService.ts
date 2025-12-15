import { ParentData, EmailStatus } from '../types';
import { createMimeMessage, base64urlEncode } from '../utils/emailUtils';
import { SupabaseService } from './supabaseService';

const PICA_API_URL = 'https://api.picaos.com/v1/passthrough/users/me/messages/send';
const PICA_ACTION_ID = 'conn_mod_def::F_JeJ_A_TKg::cc2kvVQQTiiIiLEDauy6zQ';

export class EmailService {
  private secretKey: string;
  private connectionKey: string;

  constructor() {
    this.secretKey = import.meta.env.VITE_PICA_SECRET_KEY;
    this.connectionKey = import.meta.env.VITE_PICA_GMAIL_CONNECTION_KEY;

    if (!this.secretKey || !this.connectionKey) {
      throw new Error('Missing required environment variables: VITE_PICA_SECRET_KEY and VITE_PICA_GMAIL_CONNECTION_KEY');
    }
  }

  async sendEmail(parent: ParentData): Promise<any> {
    const mimeMessage = createMimeMessage(parent);
    const raw = base64urlEncode(mimeMessage);

    const response = await fetch(PICA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': this.secretKey,
        'x-pica-connection-key': this.connectionKey,
        'x-pica-action-id': PICA_ACTION_ID,
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async sendBulkEmails(
    parents: ParentData[],
    onProgress: (status: EmailStatus) => void,
    delayMs: number = 1000,
    logToSupabase: boolean = false
  ): Promise<EmailStatus[]> {
    const results: EmailStatus[] = [];
    const supabaseService = logToSupabase ? new SupabaseService() : null;

    for (const parent of parents) {
      const status: EmailStatus = {
        parentEmail: parent.parentEmail,
        parentName: parent.parentName,
        status: 'sending',
      };

      onProgress(status);

      try {
        const response = await this.sendEmail(parent);
        status.status = 'success';
        status.response = response;
        
        if (supabaseService && 'childId' in parent) {
          await supabaseService.logEmail(parent.childId as string, parent.parentEmail, 'sent');
        }
      } catch (error) {
        status.status = 'error';
        status.error = error instanceof Error ? error.message : 'Unknown error';
        
        if (supabaseService && 'childId' in parent) {
          await supabaseService.logEmail(parent.childId as string, parent.parentEmail, 'failed', status.error);
        }
      }

      results.push(status);
      onProgress(status);

      // Add delay between emails to avoid rate limiting
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}