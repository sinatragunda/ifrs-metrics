import { httpService } from '@/lib/http-service';

export type WorkspaceMember = {
  id: string;
  username: string;
  scope: string;
  email?: string;
  workspace?: string;
};

const INVITATION_MEMBER_KEY = 'statlab-invitation-member-v1';

function readString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export function parseWorkspaceMember(value: unknown): WorkspaceMember | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const nested = record.member && typeof record.member === 'object'
    ? record.member as Record<string, unknown>
    : record.workspace_member && typeof record.workspace_member === 'object'
      ? record.workspace_member as Record<string, unknown>
      : record.workspaceMember && typeof record.workspaceMember === 'object'
        ? record.workspaceMember as Record<string, unknown>
        : record.data && typeof record.data === 'object' && !Array.isArray(record.data)
          ? record.data as Record<string, unknown>
          : record;

  const id = readString(nested.id, nested.member_id, nested.user_id, nested.userId);
  const email = readString(nested.email, nested.email_address, nested.emailAddress) || undefined;
  const username = readString(
    nested.username,
    nested.user_name,
    nested.name,
    nested.full_name,
    email,
  );
  const scope = readString(
    nested.scope,
    nested.access_scope,
    nested.role,
    nested.role_name,
    nested.roleName,
  ) || '—';
  const workspace = readString(
    nested.workspace,
    nested.workspace_id,
    nested.workspaceId,
  ) || undefined;

  if (!id && !username && !email) return null;
  return {
    id: id || email || username,
    username: username || email || 'Member',
    scope,
    email,
    workspace,
  };
}

function extractMembers(payload: unknown): WorkspaceMember[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { members?: unknown }).members)
      ? (payload as { members: unknown[] }).members
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : [];

  return list.map(parseWorkspaceMember).filter((member): member is WorkspaceMember => Boolean(member));
}

export async function fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const payload = await httpService.get(`/workspace/${encodeURIComponent(workspaceId)}/members`);
  return extractMembers(payload);
}

export async function revokeWorkspaceMember(workspaceId: string, memberId: string): Promise<void> {
  await httpService.delete(`/workspace/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(memberId)}`);
}

export function storeInvitationMember(member: WorkspaceMember) {
  sessionStorage.setItem(INVITATION_MEMBER_KEY, JSON.stringify(member));
}

export function readInvitationMember(): WorkspaceMember | null {
  try {
    const raw = sessionStorage.getItem(INVITATION_MEMBER_KEY);
    if (!raw) return null;
    return parseWorkspaceMember(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function clearInvitationMember() {
  sessionStorage.removeItem(INVITATION_MEMBER_KEY);
}
