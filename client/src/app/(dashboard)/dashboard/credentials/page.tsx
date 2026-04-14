'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Loader2, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Credential {
  id: string;
  portal_name: string;
  updated_at: string;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [portal, setPortal] = useState('indeed');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    };
  };

  const fetchCredentials = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch(getApiUrl('/api/v1/credentials'), { headers });
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      const headers = await getHeaders();
      const res = await fetch(getApiUrl('/api/v1/credentials'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ portal, email, password })
      });

      if (res.ok) {
        setEmail('');
        setPassword('');
        fetchCredentials();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save credentials');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove these credentials?')) return;
    
    try {
      const headers = await getHeaders();
      const res = await fetch(getApiUrl(`/api/v1/credentials/${id}`), {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchCredentials();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Portal Credentials</h1>
        <p className="text-muted-foreground">Manage your job portal accounts securely for AI auto-applying.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Add Account</CardTitle>
              <CardDescription>Enter your credentials for Indeed, Glassdoor, or Wellfound.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Portal</Label>
                  <select 
                    value={portal} 
                    onChange={(e) => setPortal(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="indeed">Indeed</option>
                    <option value="glassdoor">Glassdoor</option>
                    <option value="wellfound">Wellfound</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Portal Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Portal Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={adding}>
                  {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Save Credentials
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 text-[10px] text-muted-foreground italic leading-tight">
                <Key className="h-3 w-3 shrink-0" />
                <span>Your credentials are encrypted using AES-256 before being stored. Only the automation worker can access them.</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold px-1">Saved Accounts</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary/50" /></div>
          ) : credentials.length === 0 ? (
            <Card className="border-dashed flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="bg-muted p-4 rounded-full">
                <Key className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium">No accounts connected yet</p>
                <p className="text-sm text-muted-foreground">Add your first portal account to start using the AI Apply features.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((cred) => (
                <Card key={cred.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg capitalize">{cred.portal_name}</p>
                          <p className="text-xs text-muted-foreground">Updated on {new Date(cred.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cred.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="h-5 h-5" />
                      </Button>
                    </div>
                    <div className="bg-muted/30 px-6 py-2 text-[10px] text-muted-foreground flex justify-between">
                       <span>Encrypted Storage: Verified</span>
                       <span>Auto-Apply Enbled</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
