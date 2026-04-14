import type { Page } from 'playwright';
import type { MasterProfile, DecryptedCredentials, ApplicationResult, FieldMapping } from '../../types/index.js';
export declare abstract class PortalStrategy {
    protected page: Page;
    protected masterProfile: MasterProfile;
    protected credentials: DecryptedCredentials;
    protected applicationId: string;
    abstract portalName: string;
    constructor(page: Page, masterProfile: MasterProfile, credentials: DecryptedCredentials, applicationId: string);
    apply(jobUrl: string): Promise<ApplicationResult>;
    abstract login(): Promise<void>;
    abstract navigateToJob(url: string): Promise<void>;
    abstract detectForm(): Promise<FieldMapping[]>;
    abstract fillForm(fields: FieldMapping[]): Promise<void>;
    abstract submit(): Promise<void>;
    protected isCaptcha(error: any): boolean;
    protected humanDelay(min?: number, max?: number): Promise<void>;
    protected humanType(selector: string, text: string): Promise<void>;
    protected log(step: string, message: string): Promise<void>;
}
//# sourceMappingURL=base.strategy.d.ts.map