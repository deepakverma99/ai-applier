import { useState, useEffect } from 'react';
import { applicationService } from '../services/applicationService';
import { useUser } from './useUser';

export const useStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    failed: 0,
    pending: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const data = await applicationService.getApplicationStats(user.id);
        const successRate = data.total > 0 ? (data.submitted / data.total) * 100 : 0;
        
        setStats({ ...data, successRate });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};
