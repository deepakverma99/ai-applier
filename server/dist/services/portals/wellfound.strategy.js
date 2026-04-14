// services/portals/wellfound.strategy.ts
import { PortalStrategy } from './base.strategy.js';
export class WellfoundStrategy extends PortalStrategy {
    constructor() {
        super(...arguments);
        this.portalName = 'wellfound';
    }
    async login() {
        await this.page.goto('https://wellfound.com/login');
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
//# sourceMappingURL=wellfound.strategy.js.map