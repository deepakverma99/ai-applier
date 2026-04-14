import { supabase } from '../lib/supabase';

export const applicationService = {
  async getRecentApplications(userId: string, limit = 5) {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getApplicationStats(userId: string) {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: applications.length,
      submitted: applications.filter(a => a.status === 'submitted').length,
      failed: applications.filter(a => a.status === 'failed').length,
      pending: applications.filter(a => ['queued', 'in_progress'].includes(a.status)).length,
    };

    return stats;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
    return data;
  }
};
