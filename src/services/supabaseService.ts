import { supabase, Child, Parent, ChildWithParent } from '../lib/supabase';

export class SupabaseService {
  async getChildrenWithParents(searchTerm?: string): Promise<ChildWithParent[]> {
    let query = supabase
      .from('children')
      .select(`
        *,
        parent:parents(*)
      `)
      .order('name', { ascending: true });

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch children: ${error.message}`);
    }

    return data || [];
  }

  async getChildById(id: string): Promise<ChildWithParent | null> {
    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        parent:parents(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch child: ${error.message}`);
    }

    return data;
  }

  async getParentById(id: string): Promise<Parent | null> {
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch parent: ${error.message}`);
    }

    return data;
  }

  async logEmail(childId: string, parentEmail: string, status: 'pending' | 'sent' | 'failed', errorMessage?: string) {
    const { error } = await supabase
      .from('email_logs')
      .insert({
        child_id: childId,
        parent_email: parentEmail,
        status,
        error_message: errorMessage,
        email_type: 'qr_code',
        sent_at: status === 'sent' ? new Date().toISOString() : null
      });

    if (error) {
      console.error('Failed to log email:', error);
    }
  }

  // Convert ChildWithParent to ParentData format for email sending
  childToParentData(child: ChildWithParent): {
    parentEmail: string;
    parentName: string;
    childNames: string;
    qrCodeUrl: string;
    childId: string;
  } | null {
    if (!child.parent?.email || !child.qr_code_url) {
      return null;
    }

    const childName = child.name || 
      [child.first_name, child.middle_name, child.last_name]
        .filter(Boolean)
        .join(' ') || 
      'Unknown Child';

    return {
      parentEmail: child.parent.email,
      parentName: child.parent.name,
      childNames: childName,
      qrCodeUrl: child.qr_code_url,
      childId: child.id
    };
  }
}