import {
  DEFAULT_WORKSPACE,
  DEFAULT_WORKSPACE_ID,
  isProjectStandard,
  type ProjectStandard,
  type ProjectStore,
  type WorkspaceRecord,
} from '@/lib/workspace-types';
import { httpService } from '@/lib/http-service';

export function readProjectStore(): ProjectStore {
  try {
    const parsed = JSON.parse(localStorage.getItem('statlab-projects-v1') || '{}') as Partial<ProjectStore>;
    const workspaces = Array.isArray(parsed.workspaces) ? parsed.workspaces.filter((item): item is WorkspaceRecord => Boolean(item && typeof item.id === 'string' && typeof item.name === 'string')) : [];
    if (!workspaces.some((item) => item.id === DEFAULT_WORKSPACE_ID)) workspaces.unshift(DEFAULT_WORKSPACE);
    const activeWorkspaceId = workspaces.some((item) => item.id === parsed.activeWorkspaceId) ? parsed.activeWorkspaceId as string : DEFAULT_WORKSPACE_ID;
    const projects = Array.isArray(parsed.projects) ? parsed.projects.map((project) => ({
      ...project,
      standard: isProjectStandard(project.standard) ? project.standard : 'general' as ProjectStandard,
      workspaceId: typeof project.workspaceId === 'string' && workspaces.some((workspace) => workspace.id === project.workspaceId) ? project.workspaceId : DEFAULT_WORKSPACE_ID,
      files: Array.isArray(project.files) ? project.files : [],
    })) : [];
    return {
      projects,
      activeProjectId: parsed.activeProjectId ?? null,
      activeFileId: parsed.activeFileId ?? null,
      workspaces,
      activeWorkspaceId,
    };
  } catch {
    return { projects: [], activeProjectId: null, activeFileId: null, workspaces: [DEFAULT_WORKSPACE], activeWorkspaceId: DEFAULT_WORKSPACE_ID };
  }
}

export async function readProjectStoreAsync(
  local: ProjectStore = readProjectStore(),
): Promise<ProjectStore> {
  const res = await httpService.get('workspace/');
  const raw = Array.isArray(res) ? res : [];

  const workspaces: WorkspaceRecord[] = raw
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        id: String(record.workspace_id ?? record.id ?? ''),
        name: String(record.name ?? ''),
        createdAt: String(record.created_at ?? record.createdAt ?? new Date().toISOString()),
        ownerId: (record.user_id ?? record.ownerId ?? null) as string | null,
      } satisfies WorkspaceRecord;
    })
    .filter((item): item is WorkspaceRecord => Boolean(item.id && item.name));

  if (!workspaces.some((workspace) => workspace.id === DEFAULT_WORKSPACE_ID)) {
    workspaces.unshift(DEFAULT_WORKSPACE);
  }

  const activeWorkspaceId = workspaces.some((workspace) => workspace.id === local.activeWorkspaceId)
    ? local.activeWorkspaceId
    : DEFAULT_WORKSPACE_ID;

  const projects = local.projects.map((project) => ({
    ...project,
    standard: isProjectStandard(project.standard) ? project.standard : ('general' as ProjectStandard),
    workspaceId: workspaces.some((workspace) => workspace.id === project.workspaceId)
      ? project.workspaceId
      : DEFAULT_WORKSPACE_ID,
    files: Array.isArray(project.files) ? project.files : [],
  }));

  return {
    projects,
    activeProjectId: local.activeProjectId ?? null,
    activeFileId: local.activeFileId ?? null,
    workspaces,
    activeWorkspaceId,
  };
}
