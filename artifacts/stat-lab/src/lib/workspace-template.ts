import { httpService } from '@/lib/http-service';

export type WorkspaceScope = {
  id: string;
  name: string;
  description?: string;
};

/** Dummy scopes used until `/workspace/template` is populated. */
export const DUMMY_WORKSPACE_SCOPES: WorkspaceScope[] = [
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Can open shared projects and review files. Cannot edit or invite.',
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can import data, edit project files, and run analyses in shared projects.',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full workspace access, including inviting others and managing projects.',
  },
];

function asScope(value: unknown): WorkspaceScope | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string'
    ? record.id
    : typeof record.scope_id === 'string'
      ? record.scope_id
      : typeof record.role_id === 'string'
        ? record.role_id
        : typeof record.key === 'string'
          ? record.key
          : null;
  const name = typeof record.name === 'string'
    ? record.name
    : typeof record.label === 'string'
      ? record.label
      : typeof record.title === 'string'
        ? record.title
        : null;
  if (!id || !name) return null;
  const description = typeof record.description === 'string'
    ? record.description
    : typeof record.detail === 'string'
      ? record.detail
      : undefined;
  return { id, name, description };
}

function extractScopes(payload: unknown): WorkspaceScope[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object'
      ? (
          Array.isArray((payload as { scopes?: unknown }).scopes)
            ? (payload as { scopes: unknown[] }).scopes
            : Array.isArray((payload as { roles?: unknown }).roles)
              ? (payload as { roles: unknown[] }).roles
              : Array.isArray((payload as { data?: unknown }).data)
                ? (payload as { data: unknown[] }).data
                : []
        )
      : [];

  return list.map(asScope).filter((scope): scope is WorkspaceScope => Boolean(scope));
}

/**
 * Loads listable workspace roles/scopes from `/workspace/template`.
 * Falls back to configurable dummy scopes when the endpoint is unavailable.
 */
export async function fetchWorkspaceScopes(): Promise<WorkspaceScope[]> {
  try {
    const payload = await httpService.get('/workspace/template', { notifyError: false, showLoading: false });
    const scopes = extractScopes(payload);
    return scopes.length ? scopes : DUMMY_WORKSPACE_SCOPES;
  } catch {
    return DUMMY_WORKSPACE_SCOPES;
  }
}
