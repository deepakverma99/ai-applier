import { chromium } from 'playwright';
import { IndeedStrategy } from './indeed.strategy.js';
import type { JobDiscoveryResult, SearchFilters, MasterProfile, DecryptedCredentials } from '../../types/index.js';

export class DiscoveryService {
  async discoverJobs(filters: SearchFilters, profile: MasterProfile): Promise<JobDiscoveryResult[]> {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      });
      const page = await context.newPage();

      // Mock credentials for discovery phase
      const mockCreds: DecryptedCredentials = { email: 'guest@example.com' };
      
      const indeed = new IndeedStrategy(page, profile, mockCreds, 'discovery');
      const jobs = await indeed.searchJobs(filters);
      
      // Add match scores based on title/summary (Basic logic for now)
      return jobs.map(job => ({
        ...job,
        matchScore: this.calculateMatchScore(job, profile)
      })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    } catch (error) {
      console.error('DiscoveryService error:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private calculateMatchScore(job: JobDiscoveryResult, profile: MasterProfile): number {
    const title = job.title.toLowerCase();
    const experience = profile.experience.map(e => e.title.toLowerCase());
    const skills = [...profile.skills.languages, ...profile.skills.frameworks].map(s => s.toLowerCase());

    let score = 0;

    // Title match
    if (experience.some(exp => title.includes(exp) || exp.includes(title))) score += 50;
    
    // Skill match
    const skillMatches = skills.filter(skill => title.includes(skill));
    score += skillMatches.length * 10;

    return Math.min(score, 100);
  }
}

export const discoveryService = new DiscoveryService();
