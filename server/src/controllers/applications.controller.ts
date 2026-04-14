import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { queueService } from '../services/queue.service.js';

export const applicationsController = {
  async getApplications(req: AuthRequest, res: Response) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', req.user?.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  },

  async createApplication(req: AuthRequest, res: Response) {
    const { jobUrl, portalName, credentialsId } = req.body;
    
    if (!jobUrl || !portalName || !credentialsId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: req.user?.id,
        job_url: jobUrl,
        portal: portalName,
        credentials_id: credentialsId,
        status: 'queued'
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Add to BullMQ queue
    await queueService.addJob('job-applications', {
      applicationId: data.id,
      userId: req.user?.id,
      jobUrl,
      portalName,
      credentialId: credentialsId
    });

    res.status(201).json(data);
  },

  async bulkCreateApplications(req: AuthRequest, res: Response) {
    const { jobs, credentialsId } = req.body;
    
    if (!Array.isArray(jobs) || jobs.length === 0 || !credentialsId) {
      return res.status(400).json({ error: 'Missing required fields or empty job list' });
    }

    try {
      const userId = req.user?.id;
      const appEntries = jobs.map(job => ({
        user_id: userId,
        job_url: job.url,
        portal: job.portal,
        credentials_id: credentialsId,
        status: 'queued'
      }));

      const { data, error } = await supabase
        .from('applications')
        .insert(appEntries)
        .select();

      if (error) throw error;

      // Queue all jobs
      for (const app of data) {
         await queueService.addJob('job-applications', {
           applicationId: app.id,
           userId,
           jobUrl: app.job_url,
           portalName: app.portal,
           credentialId: credentialsId
         });
      }

      res.status(201).json({ 
        message: `Successfully queued ${data.length} applications`, 
        count: data.length 
      });
    } catch (error: any) {
      console.error('Bulk application error:', error);
      res.status(500).json({ error: error.message || 'Failed to queue bulk applications' });
    }
  },

  async getApplicationById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user?.id)
      .single();

    if (error) return res.status(404).json({ error: 'Application not found' });
    res.json(data);
  }
};
