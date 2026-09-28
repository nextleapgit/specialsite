export const commonChecks = ['lint', 'typecheck', 'unit-component', 'governance', 'build', 'budgets', 'e2e-accessibility-visual', 'dependency-audit', 'secret-scan'];
export const phaseChecks = {
  '00': [], '01': ['contract-validation', 'threat-model-review'],
  '02': ['postgres-integration', 'identity-security'],
  '03': ['postgres-integration', 'identity-security', 'content-security'],
  '04': ['postgres-integration', 'identity-security', 'content-security', 'training-integration'],
  '05': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation'],
  '06': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation', 'ai-contract-security'],
  '07': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation', 'ai-contract-security', 'delivery-security'],
  '08': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation', 'ai-contract-security', 'delivery-security', 'dast', 'load', 'restore-rollback', 'release-security'],
};
