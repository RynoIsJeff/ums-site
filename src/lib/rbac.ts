import type { AuthScope } from "@/lib/auth";

/**
 * RBAC: use canAccessClient for route guards, clientWhere/clientIdWhere for
 * Prisma queries. In server actions call requireHubAuth() from @/lib/auth
 * then mergeClientIdScope(scope, yourWhere) for client-scoped models.
 */

/**
 * Returns true if the user is allowed to access the given client.
 * ADMIN: always true. STAFF: only if clientId is in assignedClientIds.
 */
export function canAccessClient(scope: AuthScope, clientId: string): boolean {
  if (scope.role === "ADMIN") return true;
  if (!scope.assignedClientIds) return false;
  return scope.assignedClientIds.includes(clientId);
}

/**
 * Prisma WHERE clause to scope Client queries.
 * ADMIN: {} (no filter). STAFF: { id: { in: assignedClientIds } }.
 * Use in: prisma.client.findMany({ where: { ...clientWhere(scope) } })
 */
export function clientWhere(scope: AuthScope): { id?: { in: string[] } } {
  if (scope.role === "ADMIN") return {};
  const ids = scope.assignedClientIds ?? [];
  return { id: { in: ids } };
}

/**
 * Prisma WHERE clause to scope any model that has clientId (Invoice, Payment, Task, SocialPost, etc.).
 * ADMIN: {} (no filter). STAFF: { clientId: { in: assignedClientIds } } (empty array = no rows).
 */
export function clientIdWhere(
  scope: AuthScope
): { clientId?: { in: string[] } } {
  if (scope.role === "ADMIN") return {};
  const ids = scope.assignedClientIds ?? [];
  return { clientId: { in: ids } };
}

/**
 * Combine with existing where: merge clientId scope into your where object.
 * Example: prisma.invoice.findMany({ where: { ...clientIdWhere(scope), status: 'SENT' } })
 */
export function mergeClientIdScope<T extends Record<string, unknown>>(
  scope: AuthScope,
  where: T
): T & { clientId?: { in: string[] } } {
  const scopeWhere = clientIdWhere(scope);
  if (Object.keys(scopeWhere).length === 0) return where as T & { clientId?: { in: string[] } };
  return { ...where, ...scopeWhere } as T & { clientId?: { in: string[] } };
}

/**
 * Whether the current scope can access settings (e.g. user management, global config).
 * Only ADMIN for now; STAFF cannot.
 */
export function canAccessSettings(scope: AuthScope): boolean {
  return scope.role === "ADMIN";
}

/**
 * Prisma WHERE clause for Task (clientId optional).
 * ADMIN: {}. STAFF: clientId is null OR clientId in assignedClientIds.
 */
export function taskWhere(
  scope: AuthScope
): Record<string, unknown> {
  if (scope.role === "ADMIN") return {};
  const ids = scope.assignedClientIds ?? [];
  return { OR: [{ clientId: null }, { clientId: { in: ids } }] };
}
