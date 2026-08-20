import { DiagnosticsService } from './diagnostics.service';
export declare class DiagnosticsController {
    private readonly diagnosticsService;
    constructor(diagnosticsService: DiagnosticsService);
    checkEmailHealth(req: any): Promise<import("./diagnostics.service").EmailDiagnosticsResult>;
}
