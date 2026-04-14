'use client';

import React, { useState, useEffect } from 'react';
import { ResumeUploader } from '@/components/dashboard/ResumeUploader';
import { resumeService } from '@/services/resumeService';
import { 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FileJson,
  RefreshCw,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { Linkedin } from '@/components/ui/brand-icons';

export default function ResumePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await resumeService.getMasterProfile();
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUploadSuccess = (newProfile: any) => {
    setProfile(newProfile);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume & Profile</h1>
        <p className="text-muted-foreground">
          Manage your parsed resume data and master profile.
        </p>
      </div>

      {!profile ? (
        <div className="py-12">
          <ResumeUploader onSuccess={handleUploadSuccess} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience Section */}
            <section className="bg-card rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Briefcase className="h-5 w-5" />
                <h2 className="text-xl font-bold">Experience</h2>
              </div>
              <div className="space-y-6">
                {profile.experience?.map((exp: any, idx: number) => (
                  <div key={idx} className="relative pl-6 border-l border-muted pb-4 last:pb-0">
                    <div className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-foreground">{exp.title}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {exp.start_date} - {exp.end_date || 'Present'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-primary mb-2">{exp.company}</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Education Section */}
            <section className="bg-card rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <GraduationCap className="h-5 w-5" />
                <h2 className="text-xl font-bold">Education</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.education?.map((edu: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border bg-muted/30">
                    <h3 className="font-bold text-foreground">{edu.degree}</h3>
                    <p className="text-sm text-primary">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground mt-1">Class of {edu.graduation_year}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Personal Details Card */}
            <section className="bg-card rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  <h2 className="font-bold">Personal Info</h2>
                </div>
                <button
                  onClick={() => setProfile(null)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Re-upload
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.personal?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.personal?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.personal?.location || 'N/A'}</span>
                </div>
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-blue-500 truncate">{profile.personal?.linkedin || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-blue-500 truncate">{profile.personal?.portfolio || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Skills Card */}
            <section className="bg-card rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Wrench className="h-5 w-5" />
                <h2 className="font-bold">Top Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ...(profile.skills?.languages || []),
                  ...(profile.skills?.frameworks || []),
                  ...(profile.skills?.tools || [])
                ].slice(0, 15).map((skill: string, idx: number) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Raw JSON View (For Debug/Advanced Users) */}
            <section className="bg-card rounded-2xl border p-6 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <FileJson className="h-4 w-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Raw Profile Data</h2>
              </div>
              <pre className="text-[10px] overflow-auto max-h-40 bg-muted p-2 rounded custom-scrollbar">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
