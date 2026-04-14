import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { discoveryService } from '../services/portals/discovery.service.js';
import { supabase } from '../config/supabase.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware as any, async (req: AuthRequest, res) => {
  const { query, location, remoteOnly } = req.query;

  if (!query || !location) {
    return res.status(400).json({ error: 'Query and location are required' });
  }

  try {
    // Get user's master profile for match scoring
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('master_profile')
      .eq('id', req.user?.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const jobs = await discoveryService.discoverJobs({
      query: query as string,
      location: location as string,
      remoteOnly: remoteOnly === 'true'
    }, profile.master_profile);

    res.json(jobs);
  } catch (error: any) {
    console.error('Discovery route error:', error);
    res.status(500).json({ error: 'Failed to discover jobs' });
  }
});

export default router;
