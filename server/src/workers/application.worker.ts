// workers/application.worker.ts
import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { BrowserManager } from '../services/automation/browserManager.js';
import { IndeedStrategy } from '../services/portals/indeed.strategy.js';
import { GlassdoorStrategy } from '../services/portals/glassdoor.strategy.js';
import { WellfoundStrategy } from '../services/portals/wellfound.strategy.js';
import { decrypt } from '../services/encryption.service.js';
import { supabase } from '../config/supabase.js';
import type { Page } from 'playwright';
import type { 
  MasterProfile, 
  DecryptedCredentials, 
  ApplicationResult, 
  FieldMapping 
} from '../types/index.js';

const STRATEGY_MAP: Record<string, any> = {
  indeed: IndeedStrategy,
  glassdoor: GlassdoorStrategy,
  wellfound: WellfoundStrategy,
};

// Helper Functions
async function updateApplicationStatus(id: string, status: string, message?: string) {
  console.log(`Updating application ${id} to ${status}: ${message || ''}`);
  const { error } = await supabase
    .from('applications')
    .update({ status, last_error: message, updated_at: new Date() })
    .eq('id', id);
  if (error) console.error('Failed to update status:', error);
}

async function emitSocketEvent(userId: string, event: string, data: any) {
  // Placeholder for Socket.io integration
  console.log(`Socket event to ${userId}: ${event}`, data);
}

async function getAndDecryptCredentials(credentialId: string): Promise<DecryptedCredentials> {
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('id', credentialId)
    .single();

  if (error || !data) throw new Error('Credentials not found');

  return {
    email: decrypt(data.encrypted_email, data.iv_email),
    password: data.encrypted_password ? decrypt(data.encrypted_password, data.iv_password) : undefined
  };
}

async function getMasterProfile(userId: string): Promise<MasterProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('content')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('Profile not found');
  return data.content as MasterProfile;
}

async function getNextProxy(): Promise<string | undefined> {
  return process.env.PROXY_URL;
}

const worker = new Worker(
  'job-applications',
  async (job: Job) => {
    const { applicationId, userId, jobUrl, portalName, credentialId } = job.data;
    
    await updateApplicationStatus(applicationId, 'in_progress');
    await emitSocketEvent(userId, 'application:status_update', {
      applicationId,
      status: 'in_progress',
      message: 'Starting application...'
    });

    const credentials = await getAndDecryptCredentials(credentialId);
    const profile = await getMasterProfile(userId);

    const context = await BrowserManager.create({
      headless: true,
      proxy: await getNextProxy(),
      stealth: true
    });

    try {
      const page = await context.newPage();
      const StrategyClass = STRATEGY_MAP[portalName];
      if (!StrategyClass) throw new Error(`Unsupported portal: ${portalName}`);
      
      const strategy = new StrategyClass(page, profile, credentials, applicationId);
      const result = await strategy.apply(jobUrl);
      
      await updateApplicationStatus(applicationId, result.status);
      await emitSocketEvent(userId, 'application:status_update', {
        applicationId,
        status: result.status,
        message: result.status === 'submitted' 
          ? 'Application submitted successfully!' 
          : 'CAPTCHA encountered — please check dashboard'
      });
      
    } catch (error: any) {
      console.error('Worker job failed:', error);
      await updateApplicationStatus(applicationId, 'failed', error.message);
      await emitSocketEvent(userId, 'application:status_update', {
        applicationId,
        status: 'failed',
        message: error.message
      });
    } finally {
      await context.close();
    }
  },
  {
    connection: redis,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60 * 1000
    }
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});