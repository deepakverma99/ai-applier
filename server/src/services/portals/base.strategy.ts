// services/portals/base.strategy.ts
import type { Page } from 'playwright';
import type { 
  MasterProfile, 
  DecryptedCredentials, 
  ApplicationResult, 
  FieldMapping,
  JobDiscoveryResult,
  SearchFilters
} from '../../types/index.js';

export abstract class PortalStrategy {
  protected page: Page;
  protected masterProfile: MasterProfile;
  protected credentials: DecryptedCredentials;
  protected applicationId: string;

  abstract portalName: string;

  constructor(
    page: Page, 
    masterProfile: MasterProfile, 
    credentials: DecryptedCredentials, 
    applicationId: string
  ) {
    this.page = page;
    this.masterProfile = masterProfile;
    this.credentials = credentials;
    this.applicationId = applicationId;
  }
  
  // Template method pattern — defines the application flow
  async apply(jobUrl: string): Promise<ApplicationResult> {
    try {
      await this.log('navigate', `Navigating to ${jobUrl}`);
      await this.navigateToJob(jobUrl);
      
      await this.log('detect', 'Detecting application form...');
      const formFields = await this.detectForm();
      
      await this.log('fill_form', 'Filling form fields...');
      await this.fillForm(formFields);
      
      await this.log('submit', 'Submitting application...');
      await this.submit();
      
      return { status: 'submitted' };
      
    } catch (error: any) {
      if (this.isCaptcha(error)) {
        return { status: 'captcha_paused', message: 'CAPTCHA detected' };
      }
      throw error;
    }
  }

  // Each portal implements these differently
  abstract login(): Promise<void>;
  abstract navigateToJob(url: string): Promise<void>;
  abstract detectForm(): Promise<FieldMapping[]>;
  abstract fillForm(fields: FieldMapping[]): Promise<void>;
  abstract submit(): Promise<void>;
  
  // Job Discovery (New)
  abstract searchJobs(filters: SearchFilters): Promise<JobDiscoveryResult[]>;
  
  protected isCaptcha(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('captcha') || message.includes('security check');
  }

  // Shared methods
  protected async humanDelay(min = 500, max = 2000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await this.page.waitForTimeout(delay);
  }

  protected async humanType(selector: string, text: string): Promise<void> {
    await this.page.click(selector);
    await this.humanDelay(100, 300);
    for (const char of text) {
      await this.page.keyboard.type(char, { delay: Math.random() * 100 + 30 });
    }
  }

  protected async log(step: string, message: string) {
    console.log(`[${this.portalName}][${step}] ${message}`);
  }
}