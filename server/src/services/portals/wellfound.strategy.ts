// services/portals/wellfound.strategy.ts
import { PortalStrategy } from './base.strategy.js';
import type { FieldMapping } from '../../types/index.js';

export class WellfoundStrategy extends PortalStrategy {
  portalName = 'wellfound';

  async login(): Promise<void> {
    await this.page.goto('https://wellfound.com/login');
    await this.humanDelay();
  }

  async navigateToJob(url: string): Promise<void> {
    await this.page.goto(url);
    await this.humanDelay();
  }

  async detectForm(): Promise<FieldMapping[]> {
    return [];
  }

  async fillForm(fields: FieldMapping[]): Promise<void> {
    // Stub
  }

  async submit(): Promise<void> {
    // Stub
  }
}
