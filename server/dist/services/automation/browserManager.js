// services/automation/browserManager.ts
import { chromium } from 'playwright';
export class BrowserManager {
    static async create(options) {
        const launchOptions = {
            headless: options.headless,
        };
        if (options.proxy) {
            launchOptions.proxy = {
                server: options.proxy,
                // username and password if needed
            };
        }
        const browser = await chromium.launch(launchOptions);
        const context = await browser.newContext({
            // Mimic a real browser
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            locale: 'en-US',
            timezoneId: 'America/New_York',
            geolocation: { longitude: -73.935242, latitude: 40.730610 },
            permissions: ['geolocation'],
            // Anti-fingerprinting
            javaScriptEnabled: true,
            hasTouch: false,
            isMobile: false,
            deviceScaleFactor: 1,
        });
        if (options.stealth) {
            // Override navigator properties to avoid detection
            await context.addInitScript(() => {
                // Hide webdriver flag
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                // Fake plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
                // Fake languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
                // Override chrome object
                // @ts-ignore
                window.chrome = {
                    runtime: {},
                    loadTimes: function () { },
                    csi: function () { },
                    app: {},
                };
                // Pass webGL renderer check
                const getParameter = WebGLRenderingContext.prototype.getParameter;
                WebGLRenderingContext.prototype.getParameter = function (parameter) {
                    if (parameter === 37445) {
                        return 'Intel Inc.';
                    }
                    if (parameter === 37446) {
                        return 'Intel Iris OpenGL Engine';
                    }
                    return getParameter.call(this, parameter);
                };
            });
        }
        return context;
    }
}
//# sourceMappingURL=browserManager.js.map