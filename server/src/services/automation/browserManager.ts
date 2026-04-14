import { chromium } from 'playwright';
import type { Browser, BrowserContext } from 'playwright';
import { stealthPlugin } from './stealthPlugin.js';

export class BrowserManager {
  static async create(options: {
    headless: boolean;
    proxy?: string | undefined;
    stealth: boolean;
  }): Promise<BrowserContext> {
    
    const launchOptions: any = {
      headless: options.headless,
    };

    if (options.proxy) {
      launchOptions.proxy = {
        server: options.proxy,
      };
    }

    const browser = await chromium.launch(launchOptions);
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      geolocation: { longitude: -73.935242, latitude: 40.730610 },
      permissions: ['geolocation'],
      javaScriptEnabled: true,
      hasTouch: false,
      isMobile: false,
      deviceScaleFactor: 1,
    });

    if (options.stealth) {
      await stealthPlugin.apply(context);
    }

    return context;
  }
}