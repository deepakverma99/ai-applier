import type { BrowserContext } from 'playwright';
export declare class BrowserManager {
    static create(options: {
        headless: boolean;
        proxy?: string | undefined;
        stealth: boolean;
    }): Promise<BrowserContext>;
}
//# sourceMappingURL=browserManager.d.ts.map