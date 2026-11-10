import {
  DEFAULT_WORKSPACE,
  DEFAULT_WORKSPACE_ID,
  isProjectStandard,
  type Project,
  type ProjectStandard,
  type ProjectStore,
  type WorkspaceRecord,
} from '@/lib/workspace-types';

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
