import { PortalStrategy } from './base.strategy.js';
import type { FieldMapping } from '../../types/index.js';
export declare class GlassdoorStrategy extends PortalStrategy {
    portalName: string;
    login(): Promise<void>;
    navigateToJob(url: string): Promise<void>;
    detectForm(): Promise<FieldMapping[]>;
    fillForm(fields: FieldMapping[]): Promise<void>;
    submit(): Promise<void>;
}
//# sourceMappingURL=glassdoor.strategy.d.ts.map