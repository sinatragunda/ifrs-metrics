import { httpService } from '@/lib/http-service';

export type WorkspaceMember = {
  id: string;
  username: string;
  scope: string;
  email?: string;
};

function asMember(value: unknown): WorkspaceMember | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const id = String(
    record.id
      ?? record.member_id
      ?? record.user_id
      ?? record.userId
      ?? '',
  );
  const username = String(
    record.username
      ?? record.user_name
      ?? record.name
      ?? record.full_name
      ?? record.email
      ?? '',
  );
  const scope = String(
    record.scope
      ?? record.access_scope
      ?? record.role
      ?? record.role_name
      ?? record.roleName
      ?? '',
  );
  if (!id || !username) return null;
  const email = typeof record.email === 'string' ? record.email : undefined;
  return { id, username, scope: scope || '—', email };
}

function extractMembers(payload: unknown): WorkspaceMember[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { members?: unknown }).members)
      ? (payload as { members: unknown[] }).members
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : [];

  return list.map(asMember).filter((member): member is WorkspaceMember => Boolean(member));
}

export async function fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const payload = await httpService.get(`/workspace/${encodeURIComponent(workspaceId)}/members`);
  return extractMembers(payload);
}

export async function revokeWorkspaceMember(workspaceId: string, memberId: string): Promise<void> {
  await httpService.delete(`/workspace/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(memberId)}`);
}
