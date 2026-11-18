import {
  DEFAULT_WORKSPACE,
  DEFAULT_WORKSPACE_ID,
  isProjectStandard,
  type ProjectStandard,
  type ProjectStore,
  type WorkspaceRecord,
} from '@/lib/workspace-types';
import {httpService} from "@/lib/http-service.ts";

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
    local: ProjectStore = readProjectStore()   // sync cache as the base
): Promise<ProjectStore> {

    const res = await httpService.get('workspace/');

    const raw = Array.isArray(res) ? res : [];

    alert("raw shit" + JSON.stringify(raw));

    const workspaces: WorkspaceRecord[] = raw.map(f=>{
        const rec : WorkspaceRecord = {
            id : f.workspace_id,
            name : f.name,
            createdAt : f.created_at,
            ownerId: f.user_id
        };
        return rec;
    }).filter(
        (item: any): item is WorkspaceRecord =>
            Boolean(item && typeof item.id === 'string' && typeof item.name === 'string')
    );

    alert(JSON.stringify(workspaces));

    if (!workspaces.some((w) => w.id === DEFAULT_WORKSPACE_ID)) {
        workspaces.unshift(DEFAULT_WORKSPACE);
    }

    const activeWorkspaceId = workspaces.some((w) => w.id === local.activeWorkspaceId)
        ? local.activeWorkspaceId
        : DEFAULT_WORKSPACE_ID;

    const projects = local.projects.map((project) => ({
        ...project,
        standard: isProjectStandard(project.standard) ? project.standard : ('general' as ProjectStandard),
        workspaceId: workspaces.some((w) => w.id === project.workspaceId)
            ? project.workspaceId
            : DEFAULT_WORKSPACE_ID,
        files: Array.isArray(project.files) ? project.files : [],
    }));

    alert("lets return shit nopw "+JSON.stringify(workspaces, null, 2));

    return {
        projects,
        activeProjectId: local.activeProjectId ?? null,
        activeFileId: local.activeFileId ?? null,
        workspaces,
        activeWorkspaceId,
    };
}


