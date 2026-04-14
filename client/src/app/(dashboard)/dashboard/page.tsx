'use client';

import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentApps } from '@/components/dashboard/RecentApps';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Here&apos;s what&apos;s happening with your job applications today.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/resume">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Update Resume
            </Button>
          </Link>
          <Link href="/dashboard/apply">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      <StatsGrid />

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentApps />
        
        {/* Placeholder for Profile Completeness or Quick Help */}
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">Quick Tip</h4>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            Ensure your <strong>Master Profile</strong> is up to date. Our AI use this data to fill out your applications accurately. 
            You can verify your details in the Resumes section.
          </p>
          <Link href="/dashboard/resume">
            <Button variant="link" className="mt-4 h-auto p-0 text-blue-600">
              Edit Master Profile →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
