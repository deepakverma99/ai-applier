export class ProxyManager {
  static async getNextProxy(): Promise<string | undefined> {
    // Current simple implementation using ENV
    // Future: Logic to rotate through a list of proxies
    return process.env.PROXY_URL;
  }
}
