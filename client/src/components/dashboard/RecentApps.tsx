'use client';

import { useEffect, useState } from 'react';
import { applicationService } from '@/services/applicationService';
import { useUser } from '@/hooks/useUser';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "outline" | "destructive" }> = {
  submitted: { label: 'Submitted', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
  queued: { label: 'Queued', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'default' },
};

export function RecentApps() {
  const { user } = useUser();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchApps = async () => {
      try {
        const data = await applicationService.getRecentApplications(user.id);
        setApps(data);
      } catch (err) {
        console.error('Failed to fetch recent apps:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [user]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />;

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
        <p className="text-sm text-zinc-500">Your latest job submissions</p>
      </div>
      
      <div className="border-t">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Portal</TableHead>
              <TableHead>Job URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium capitalize">{app.portal}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <a href={app.job_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {app.job_url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[app.status]?.variant || 'outline'}>
                      {statusMap[app.status]?.label || app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-zinc-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
