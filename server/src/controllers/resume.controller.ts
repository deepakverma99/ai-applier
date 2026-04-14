import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { resumeParser } from '../services/ai/resumeParser.js';

export const resumeController = {
  async uploadResume(req: AuthRequest, res: Response) {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No resume file provided' });
    }

    try {
      // 1. Parse the PDF buffer
      const parsedData = await resumeParser.parse(file.buffer);
      
      const userId = req.user?.id;

      // 2. Save metadata to resumes table
      const { data: resumeEntry, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          file_name: file.originalname,
          file_path: req.body.filePath || `resumes/${userId}/${Date.now()}_${file.originalname}`,
          file_size: file.size,
          parsed_json: parsedData,
          is_primary: true
        })
        .select()
        .single();

      if (resumeError) throw resumeError;

      // 3. Upsert the user's master profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          master_profile: parsedData,
          full_name: parsedData.personal?.full_name || req.user?.email?.split('@')[0] || 'User',
          email: parsedData.personal?.email || req.user?.email || '',
          phone: parsedData.personal?.phone || null,
          location: parsedData.personal?.location || null,
          linkedin_url: parsedData.personal?.linkedin || null,
          portfolio_url: parsedData.personal?.portfolio || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      res.json({
        message: 'Resume uploaded and parsed successfully',
        resume: resumeEntry,
        profile: parsedData
      });
    } catch (error: any) {
      console.error('Resume upload/parse error:', error);
      res.status(500).json({ error: error.message || 'Failed to process resume' });
    }
  },

  async getMasterProfile(req: AuthRequest, res: Response) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user?.id)
      .single();

    if (error) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  }
};
