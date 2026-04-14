// services/portals/indeed.strategy.ts
import { PortalStrategy } from './base.strategy.js';
import type { FieldMapping, JobDiscoveryResult, SearchFilters } from '../../types/index.js';
import { analyzeFormFields } from '../ai/domAnalyzer.js';
import { getNestedValue } from '../../utils/helpers.js';

export class IndeedStrategy extends PortalStrategy {
  portalName = 'indeed';

  async login(): Promise<void> {
    await this.page.goto('https://secure.indeed.com/account/login');
    await this.humanDelay();
    // Use a more generic selector if possible, or keep as is if it works
    const emailInput = await this.page.$('#ifl-InputFormField-3') || await this.page.$('input[name="email"]');
    if (emailInput) {
      await emailInput.click();
      await this.page.keyboard.type(this.credentials.email, { delay: 50 });
      await this.page.click('button[type="submit"]');
      await this.humanDelay(1000, 2000);
    }
    
    if (this.credentials.password) {
      const passInput = await this.page.$('#ifl-InputFormField-7') || await this.page.$('input[name="password"]');
      if (passInput) {
        await passInput.click();
        await this.page.keyboard.type(this.credentials.password, { delay: 50 });
        await this.page.click('button[type="submit"]');
        await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      }
    }
  }

  async navigateToJob(url: string): Promise<void> {
    await this.page.goto(url);
    await this.humanDelay();
    
    const easyApply = await this.page.$('[data-indeed-apply-button]');
    if (easyApply) {
      await easyApply.click();
      await this.humanDelay();
    } else {
      const applyButton = await this.page.$('.jobsearch-IndeedApplyButton-newDesign');
      if (applyButton) await applyButton.click();
    }
  }

  async detectForm(): Promise<FieldMapping[]> {
    return await analyzeFormFields(this.page);
  }

  async fillForm(fields: FieldMapping[]): Promise<void> {
    for (const field of fields) {
      if (!field.profileKey || field.confidence < 0.7) continue;
      
      const value = getNestedValue(this.masterProfile, field.profileKey);
      if (!value) continue;

      await this.humanDelay(300, 800);
      
      try {
        switch (field.action) {
          case 'fill':
            await this.humanType(field.selector, String(value));
            break;
          case 'select':
            await this.page.selectOption(field.selector, { label: String(value) });
            break;
          case 'click':
            await this.page.click(field.selector);
            break;
        }
      } catch (err) {
        console.warn(`Failed to fill field ${field.selector}:`, err);
      }
    }
  }

  async submit(): Promise<void> {
    const submitBtn = await this.page.$(
      'button[type="submit"], .indeed-apply-button-container button'
    );
    if (submitBtn) {
      await this.humanDelay(500, 1000);
      await submitBtn.click();
      await this.page.waitForTimeout(3000);
    }
  }

  async searchJobs(filters: SearchFilters): Promise<JobDiscoveryResult[]> {
    const { query, location, remoteOnly } = filters;
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}${remoteOnly ? '&sc=0kf%3Aattr%28DS7P8%29%3B' : ''}`;
    
    console.log(`[Indeed] Searching jobs: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.humanDelay(2000, 4000);

    const jobs = await this.page.evaluate(() => {
      const results: any[] = [];
      const cards = document.querySelectorAll('.job_seen_beacon');
      
      cards.forEach((card) => {
        const titleEl = card.querySelector('h2.jobTitle span');
        const companyEl = card.querySelector('[data-testid="company-name"] entry'); // Indeed changes selectors often
        const companyName = card.querySelector('[data-testid="company-name"]')?.textContent || 'Unknown';
        const locationEl = card.querySelector('[data-testid="text-location"]');
        const linkEl = card.querySelector('h2.jobTitle a');
        const salaryEl = card.querySelector('.salary-snippet-container') || card.querySelector('.estimated-salary');

        if (titleEl && linkEl) {
          results.push({
            id: linkEl.getAttribute('data-jk') || Math.random().toString(36).substr(2, 9),
            title: titleEl.textContent?.trim(),
            company: companyName.trim(),
            location: locationEl?.textContent?.trim() || 'Unknown',
            url: 'https://www.indeed.com' + linkEl.getAttribute('href'),
            portal: 'indeed',
            salary: salaryEl?.textContent?.trim() || undefined
          });
        }
      });
      return results;
    });

    return jobs;
  }
}