import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { encrypt } from '../services/encryption.service.js';

export const credentialsController = {
  async addCredentials(req: AuthRequest, res: Response) {
    const { portal, email, password } = req.body;

    if (!portal || !email || !password) {
      return res.status(400).json({ error: 'Portal, email, and password are required' });
    }

    try {
      const { encrypted: encEmail, iv: ivEmail } = encrypt(email);
      const { encrypted: encPassword, iv: ivPassword } = encrypt(password);

      const { data, error } = await supabase
        .from('portal_credentials')
        .upsert({
          user_id: req.user?.id,
          portal_name: portal,
          encrypted_email: encEmail,
          iv_email: ivEmail,
          encrypted_password: encPassword,
          iv_password: ivPassword
        }, { onConflict: 'user_id, portal_name' })
        .select('id, portal_name, updated_at')
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Add credentials error:', error);
      res.status(500).json({ error: error.message || 'Failed to save credentials' });
    }
  },

  async getCredentials(req: AuthRequest, res: Response) {
    const { data, error } = await supabase
      .from('portal_credentials')
      .select('id, portal_name, updated_at')
      .eq('user_id', req.user?.id)
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  },

  async deleteCredentials(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { error } = await supabase
      .from('portal_credentials')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user?.id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
  }
};
