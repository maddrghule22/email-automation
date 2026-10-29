// ============================================================================
// Hierarchy of Power & Role Access Specifiers
// ============================================================================

export type PowerLevel = 100 | 75 | 50 | 25;

export type RoleIdentifier = 
  | 'SUPER_ADMIN' 
  | 'OPERATIONS_MANAGER' 
  | 'AUTOMATION_OPERATOR' 
  | 'COMPLIANCE_AUDITOR';

export interface PowerRole {
  id: string;
  key: RoleIdentifier;
  name: string;
  level: PowerLevel;
  tier: number; // 4, 3, 2, 1
  badge: string;
  badgeColor: string;
  description: string;
  maxApprovalLimitUsd: number; // Max financial dollar amount user can approve
  canPublishWorkflows: boolean;
  canExecuteWorkflows: boolean;
  canManageIntegrations: boolean;
  canModifySecurityPolicies: boolean;
  canViewAuditLogs: boolean;
}

export const HIERARCHY_ROLES: Record<RoleIdentifier, PowerRole> = {
  SUPER_ADMIN: {
    id: 'role-super-admin',
    key: 'SUPER_ADMIN',
    name: 'Super Admin / Managing Director',
    level: 100,
    tier: 4,
    badge: '⚡ Level 4: Super Admin',
    badgeColor: '#7c3aed',
    description: 'Supreme executive authority. Unlimited financial approval, system governance, and cross-databrick policy control.',
    maxApprovalLimitUsd: Infinity,
    canPublishWorkflows: true,
    canExecuteWorkflows: true,
    canManageIntegrations: true,
    canModifySecurityPolicies: true,
    canViewAuditLogs: true,
  },
  OPERATIONS_MANAGER: {
    id: 'role-operations-manager',
    key: 'OPERATIONS_MANAGER',
    name: 'Operations Director / Manager',
    level: 75,
    tier: 3,
    badge: '🛡️ Level 3: Ops Manager',
    badgeColor: '#2563eb',
    description: 'Senior operations supervisor. Workflow lifecycle management and financial sign-off up to $25,000.',
    maxApprovalLimitUsd: 25000,
    canPublishWorkflows: true,
    canExecuteWorkflows: true,
    canManageIntegrations: true,
    canModifySecurityPolicies: false,
    canViewAuditLogs: true,
  },
  AUTOMATION_OPERATOR: {
    id: 'role-automation-operator',
    key: 'AUTOMATION_OPERATOR',
    name: 'Automation Specialist / Operator',
    level: 50,
    tier: 2,
    badge: '⚙️ Level 2: Operator',
    badgeColor: '#059669',
    description: 'Day-to-day workflow specialist. Runs pipelines, reviews OCR anomalies, and approves transactions up to $5,000.',
    maxApprovalLimitUsd: 5000,
    canPublishWorkflows: false,
    canExecuteWorkflows: true,
    canManageIntegrations: false,
    canModifySecurityPolicies: false,
    canViewAuditLogs: true,
  },
  COMPLIANCE_AUDITOR: {
    id: 'role-compliance-auditor',
    key: 'COMPLIANCE_AUDITOR',
    name: 'Compliance Auditor / Viewer',
    level: 25,
    tier: 1,
    badge: '👁️ Level 1: Auditor',
    badgeColor: '#d97706',
    description: 'Independent oversight & compliance inspection. Full read-only transparency into logs, metrics, and data bricks without execution power.',
    maxApprovalLimitUsd: 0,
    canPublishWorkflows: false,
    canExecuteWorkflows: false,
    canManageIntegrations: false,
    canModifySecurityPolicies: false,
    canViewAuditLogs: true,
  },
};

export type AccessSpecifierKey =
  | 'WORKFLOW_CREATE'
  | 'WORKFLOW_PUBLISH'
  | 'WORKFLOW_EXECUTE'
  | 'WORKFLOW_DELETE'
  | 'FINANCIAL_APPROVAL'
  | 'INTEGRATION_MANAGE'
  | 'EXCEPTION_RESOLVE'
  | 'AUDIT_EXPORT'
  | 'PLATFORM_SETTINGS';

export interface AccessCheckResult {
  allowed: boolean;
  requiredTier: number;
  currentTier: number;
  requiredRoleName: string;
  reason?: string;
}

/**
 * Access Specifier evaluation engine: evaluates if a given role possesses
 * sufficient power in the hierarchy to execute an action.
 */
export function checkAccessSpecifier(
  roleIdentifier: RoleIdentifier | string,
  specifier: AccessSpecifierKey,
  context?: { amountUsd?: number }
): AccessCheckResult {
  const normalizedKey = (
    roleIdentifier.toUpperCase().includes('ADMIN')
      ? 'SUPER_ADMIN'
      : roleIdentifier.toUpperCase().includes('MANAGER')
      ? 'OPERATIONS_MANAGER'
      : roleIdentifier.toUpperCase().includes('OPERATOR')
      ? 'AUTOMATION_OPERATOR'
      : 'COMPLIANCE_AUDITOR'
  ) as RoleIdentifier;

  const currentRole = HIERARCHY_ROLES[normalizedKey] || HIERARCHY_ROLES.AUTOMATION_OPERATOR;

  switch (specifier) {
    case 'WORKFLOW_DELETE':
    case 'PLATFORM_SETTINGS':
      if (currentRole.tier < 4) {
        return {
          allowed: false,
          requiredTier: 4,
          currentTier: currentRole.tier,
          requiredRoleName: 'Super Admin (Level 4)',
          reason: 'This action is restricted to Level 4 (Super Admin) executive power.',
        };
      }
      return { allowed: true, requiredTier: 4, currentTier: currentRole.tier, requiredRoleName: 'Super Admin' };

    case 'WORKFLOW_CREATE':
    case 'WORKFLOW_PUBLISH':
    case 'INTEGRATION_MANAGE':
      if (currentRole.tier < 3) {
        return {
          allowed: false,
          requiredTier: 3,
          currentTier: currentRole.tier,
          requiredRoleName: 'Operations Manager (Level 3)',
          reason: 'Publishing workflows or configuring integrations requires Level 3 (Manager) or higher clearance.',
        };
      }
      return { allowed: true, requiredTier: 3, currentTier: currentRole.tier, requiredRoleName: 'Operations Manager' };

    case 'WORKFLOW_EXECUTE':
      if (currentRole.tier < 2) {
        return {
          allowed: false,
          requiredTier: 2,
          currentTier: currentRole.tier,
          requiredRoleName: 'Automation Operator (Level 2)',
          reason: 'Read-only Auditor accounts cannot execute workflows.',
        };
      }
      return { allowed: true, requiredTier: 2, currentTier: currentRole.tier, requiredRoleName: 'Automation Operator' };

    case 'FINANCIAL_APPROVAL':
    case 'EXCEPTION_RESOLVE': {
      const amount = context?.amountUsd || 0;
      if (currentRole.tier === 1) {
        return {
          allowed: false,
          requiredTier: 2,
          currentTier: currentRole.tier,
          requiredRoleName: 'Automation Operator (Level 2)',
          reason: 'Auditor accounts have read-only permissions and cannot sign off on approvals.',
        };
      }
      if (amount > currentRole.maxApprovalLimitUsd) {
        const requiredTier = amount > 25000 ? 4 : 3;
        const requiredRole = requiredTier === 4 ? 'Super Admin (Level 4)' : 'Operations Manager (Level 3)';
        return {
          allowed: false,
          requiredTier,
          currentTier: currentRole.tier,
          requiredRoleName: requiredRole,
          reason: `Transaction amount ($${amount.toLocaleString()}) exceeds your power limit of $${currentRole.maxApprovalLimitUsd.toLocaleString()}. Requires ${requiredRole}.`,
        };
      }
      return { allowed: true, requiredTier: currentRole.tier, currentTier: currentRole.tier, requiredRoleName: currentRole.name };
    }

    case 'AUDIT_EXPORT':
      return { allowed: true, requiredTier: 1, currentTier: currentRole.tier, requiredRoleName: 'Auditor' };

    default:
      return { allowed: true, requiredTier: 1, currentTier: currentRole.tier, requiredRoleName: 'Standard' };
  }
}
