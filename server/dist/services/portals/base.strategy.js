export class PortalStrategy {
    constructor(page, masterProfile, credentials, applicationId) {
        this.page = page;
        this.masterProfile = masterProfile;
        this.credentials = credentials;
        this.applicationId = applicationId;
    }
    // Template method pattern — defines the application flow
    async apply(jobUrl) {
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
        }
        catch (error) {
            if (this.isCaptcha(error)) {
                return { status: 'captcha_paused', message: 'CAPTCHA detected' };
            }
            throw error;
        }
    }
    isCaptcha(error) {
        const message = error.message?.toLowerCase() || '';
        return message.includes('captcha') || message.includes('security check');
    }
    // Shared methods
    async humanDelay(min = 500, max = 2000) {
        const delay = Math.random() * (max - min) + min;
        await this.page.waitForTimeout(delay);
    }
    async humanType(selector, text) {
        await this.page.click(selector);
        await this.humanDelay(100, 300);
        for (const char of text) {
            await this.page.keyboard.type(char, { delay: Math.random() * 100 + 30 });
        }
    }
    async log(step, message) {
        console.log(`[${this.portalName}][${step}] ${message}`);
    }
}
//# sourceMappingURL=base.strategy.js.map