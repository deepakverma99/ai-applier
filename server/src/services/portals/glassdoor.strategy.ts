// services/portals/glassdoor.strategy.ts
import { PortalStrategy } from './base.strategy.js';
import type { FieldMapping } from '../../types/index.js';

export class GlassdoorStrategy extends PortalStrategy {
  portalName = 'glassdoor';

  async login(): Promise<void> {
    // Basic implementation placeholder
    await this.page.goto('https://www.glassdoor.com/index.htm');
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
