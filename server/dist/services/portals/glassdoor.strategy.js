// services/portals/glassdoor.strategy.ts
import { PortalStrategy } from './base.strategy.js';
export class GlassdoorStrategy extends PortalStrategy {
    constructor() {
        super(...arguments);
        this.portalName = 'glassdoor';
    }
    async login() {
        // Basic implementation placeholder
        await this.page.goto('https://www.glassdoor.com/index.htm');
        await this.humanDelay();
    }
    async navigateToJob(url) {
        await this.page.goto(url);
        await this.humanDelay();
    }
    async detectForm() {
        return [];
    }
    async fillForm(fields) {
        // Stub
    }
    async submit() {
        // Stub
    }
}
//# sourceMappingURL=glassdoor.strategy.js.map