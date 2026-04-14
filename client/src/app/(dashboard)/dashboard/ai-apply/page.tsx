'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Loader2, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  portal: string;
  salary?: string;
  matchScore?: number;
}

interface Credential {
  id: string;
  portal_name: string;
}

export default function AIApplyPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredId, setSelectedCredId] = useState<string>('');

  useEffect(() => {
    // Fetch credentials to use for applications
    const fetchCredentials = async () => {
      try {
        const res = await fetch(getApiUrl('/api/v1/credentials'), {
           headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCredentials(data);
          if (data.length > 0) setSelectedCredId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch credentials:', err);
      }
    };
    fetchCredentials();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/discovery?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` 
        }
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
      // Fallback for demo
      setJobs([
        { id: '1', title: 'Senior Software Engineer', company: 'Google', location: 'Mountain View, CA', url: 'https://example.com/job1', portal: 'indeed', matchScore: 95 },
        { id: '2', title: 'React Developer', company: 'Meta', location: 'Remote', url: 'https://example.com/job2', portal: 'indeed', matchScore: 88 },
        { id: '3', title: 'Fullstack Engineer', company: 'OpenAI', location: 'San Francisco, CA', url: 'https://example.com/job3', portal: 'indeed', matchScore: 72 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleJob = (id: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedJobs(newSelected);
  };

  const handleBulkApply = async () => {
    if (!selectedCredId) {
      alert('Please add portal credentials first in the settings!');
      return;
    }

    setApplying(true);
    try {
      const jobsToApply = jobs.filter(j => selectedJobs.has(j.id));
      const res = await fetch(getApiUrl('/api/v1/applications/bulk'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          jobs: jobsToApply,
          credentialsId: selectedCredId
        })
      });

      if (res.ok) {
        alert(`Successfully queued ${selectedJobs.size} applications!`);
        setSelectedJobs(new Set());
      } else {
        throw new Error('Bulk application failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start bulk application process.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Bulk Apply</h1>
        <p className="text-muted-foreground">Discover jobs across multiple portals and apply automatically using AI.</p>
      </div>

      {!selectedCredId && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">You need to add at least one Portal Credential in your settings to start applying.</p>
        </div>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Job Discovery</CardTitle>
          <CardDescription>Enter keywords and location to start crawling multiple portals simultaneously.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Job Title, Skills, or Keywords" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="w-full md:w-64">
              <Input 
                placeholder="City, State, or Zip" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Discover Jobs
            </Button>
          </form>
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-semibold">Found {jobs.length} Matches</h2>
            <div className="flex gap-4 items-center w-full md:w-auto">
              {credentials.length > 0 && (
                 <select 
                    className="bg-background border rounded p-2 text-sm"
                    value={selectedCredId}
                    onChange={(e) => setSelectedCredId(e.target.value)}
                 >
                    {credentials.map(c => (
                        <option key={c.id} value={c.id}>{c.portal_name} Account</option>
                    ))}
                 </select>
              )}
              <p className="text-sm text-muted-foreground whitespace-nowrap">{selectedJobs.size} selected</p>
              <Button 
                onClick={handleBulkApply} 
                disabled={selectedJobs.size === 0 || applying}
                variant="default"
                className="flex-1 md:flex-none shadow-lg shadow-primary/20"
              >
                {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Apply to Selected
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card 
                key={job.id} 
                className={`cursor-pointer transition-all border-2 relative overflow-hidden ${selectedJobs.has(job.id) ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'}`}
                onClick={() => toggleJob(job.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="capitalize font-semibold border-primary/30 text-primary">{job.portal}</Badge>
                    {job.matchScore && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">AI Match</span>
                        <Badge variant="secondary" className={`${job.matchScore > 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'} border-none font-bold tabular-nums`}>
                          {job.matchScore}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{job.title}</h3>
                  <p className="text-md font-medium text-zinc-600 dark:text-zinc-400 mb-2">{job.company}</p>
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                    <span className="shrink-0">📍</span> {job.location}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    {selectedJobs.has(job.id) ? (
                      <Badge className="bg-primary text-primary-foreground"><CheckCircle2 className="w-3 h-3 mr-1" /> Selected</Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Click to select</p>
                    )}
                    {job.salary && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{job.salary}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
           <div className="bg-background p-4 rounded-full shadow-sm">
             <Search className="w-8 h-8 text-muted-foreground" />
           </div>
           <div className="space-y-1">
             <p className="text-lg font-medium">No jobs discovered yet</p>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto">Enter keywords and a location to start crawling.</p>
           </div>
        </div>
      )}
    </div>
  );
}
