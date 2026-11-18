import type { Project, WorkspaceRecord } from '@/lib/workspace-types';

export type PendingInvite = {
  id: string;
  email: string;
  workspaceId: string;
  projectIds: string[];
  invitedAt: string;
};

export type SessionUserLike = {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
} | null | undefined;

export const INVITES_STORAGE_KEY = 'statlab-workspace-invites-v1';

export function readPendingInvites(): PendingInvite[] {
  try {
    const raw = localStorage.getItem(INVITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as PendingInvite[] : [];
  } catch {
    return [];
  }
}

export function writePendingInvites(invites: PendingInvite[]) {
  localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites));
}

export function collaboratorsForProject(projectId: string): { email: string; invitedAt: string; inviteIds: string[] }[] {
  const byEmail = new Map<string, { email: string; invitedAt: string; inviteIds: string[] }>();
  for (const invite of readPendingInvites()) {
    if (!invite.projectIds.includes(projectId)) continue;
    const existing = byEmail.get(invite.email);
    if (!existing) {
      byEmail.set(invite.email, { email: invite.email, invitedAt: invite.invitedAt, inviteIds: [invite.id] });
      continue;
    }
    existing.inviteIds.push(invite.id);
    if (invite.invitedAt < existing.invitedAt) existing.invitedAt = invite.invitedAt;
  }
  return [...byEmail.values()].sort((a, b) => a.email.localeCompare(b.email));
}

export function addProjectCollaborator(projectId: string, workspaceId: string, email: string): PendingInvite {
  const normalized = normalizeEmail(email);
  const invites = readPendingInvites();
  const existing = invites.find(
    (invite) => invite.email === normalized && invite.workspaceId === workspaceId,
  );
  if (existing) {
    if (!existing.projectIds.includes(projectId)) {
      existing.projectIds = [...existing.projectIds, projectId];
      writePendingInvites(invites);
    }
    return existing;
  }
  const invite: PendingInvite = {
    id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email: normalized,
    workspaceId,
    projectIds: [projectId],
    invitedAt: new Date().toISOString(),
  };
  writePendingInvites([...invites, invite]);
  return invite;
}

export function removeProjectCollaborator(projectId: string, email: string) {
  const normalized = normalizeEmail(email);
  const next: PendingInvite[] = [];
  for (const invite of readPendingInvites()) {
    if (invite.email !== normalized || !invite.projectIds.includes(projectId)) {
      next.push(invite);
      continue;
    }
    const projectIds = invite.projectIds.filter((id) => id !== projectId);
    if (projectIds.length > 0) next.push({ ...invite, projectIds });
  }
  writePendingInvites(next);
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || '';
}

export function invitesForEmail(email: string | null | undefined): PendingInvite[] {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];
  return readPendingInvites().filter((invite) => invite.email === normalized);
}

export function invitedProjectIdSet(email: string | null | undefined): Set<string> {
  const ids = new Set<string>();
  for (const invite of invitesForEmail(email)) {
    for (const projectId of invite.projectIds) ids.add(projectId);
  }
  return ids;
}

export function invitedWorkspaceIdSet(email: string | null | undefined): Set<string> {
  const ids = new Set<string>();
  for (const invite of invitesForEmail(email)) ids.add(invite.workspaceId);
  return ids;
}

export function canAccessProject(project: Project, user: SessionUserLike): boolean {
  if (user) {
    if (project.ownerId === user.id) return true;
    return invitedProjectIdSet(user.primaryEmailAddress?.emailAddress).has(project.id);
  }
  return !project.ownerId;
}

export function canAccessWorkspace(workspace: WorkspaceRecord, user: SessionUserLike): boolean {
  if (workspace.isDefault) return true;
  if (user) {
    if (workspace.ownerId === user.id) return true;
    return invitedWorkspaceIdSet(user.primaryEmailAddress?.emailAddress).has(workspace.id);
  }
  return !workspace.ownerId;
}

export function visibleWorkspaces(workspaces: WorkspaceRecord[], user: SessionUserLike): WorkspaceRecord[] {
  return workspaces.filter((workspace) => canAccessWorkspace(workspace, user));
}

export function visibleProjectsInWorkspace(
  projects: Project[],
  workspaceId: string,
  user: SessionUserLike,
): Project[] {
  return projects.filter(
    (project) => project.workspaceId === workspaceId && canAccessProject(project, user),
  );
}
