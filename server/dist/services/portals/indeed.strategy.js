// services/portals/indeed.strategy.ts
import { PortalStrategy } from './base.strategy.js';
import { analyzeFormFields } from '../ai/domAnalyzer.js';
import { getNestedValue } from '../../utils/helpers.js';
export class IndeedStrategy extends PortalStrategy {
    constructor() {
        super(...arguments);
        this.portalName = 'indeed';
    }
    async login() {
        await this.page.goto('https://secure.indeed.com/account/login');
        await this.humanDelay();
        await this.humanType('#ifl-InputFormField-3', this.credentials.email);
        await this.page.click('[data-tn-element="auth-page-sign-in-submit"]');
        await this.humanDelay(1000, 2000);
        if (this.credentials.password) {
            await this.humanType('#ifl-InputFormField-7', this.credentials.password);
            await this.page.click('[data-tn-element="auth-page-sign-in-password-submit"]');
            await this.page.waitForNavigation({ waitUntil: 'networkidle' });
        }
    }
    async navigateToJob(url) {
        await this.page.goto(url);
        await this.humanDelay();
        const easyApply = await this.page.$('[data-indeed-apply-button]');
        if (easyApply) {
            await easyApply.click();
            await this.humanDelay();
        }
        else {
            const applyButton = await this.page.$('.jobsearch-IndeedApplyButton-newDesign');
            if (applyButton)
                await applyButton.click();
        }
    }
    async detectForm() {
        return await analyzeFormFields(this.page);
    }
    async fillForm(fields) {
        for (const field of fields) {
            if (!field.profileKey || field.confidence < 0.7)
                continue;
            const value = getNestedValue(this.masterProfile, field.profileKey);
            if (!value)
                continue;
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
            }
            catch (err) {
                console.warn(`Failed to fill field ${field.selector}:`, err);
            }
        }
    }
    async submit() {
        const submitBtn = await this.page.$('button[type="submit"], .indeed-apply-button-container button');
        if (submitBtn) {
            await this.humanDelay(500, 1000);
            await submitBtn.click();
            await this.page.waitForTimeout(3000);
        }
    }
}
//# sourceMappingURL=indeed.strategy.js.map