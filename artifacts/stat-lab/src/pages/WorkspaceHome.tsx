import { useState, type FormEvent } from 'react';
import { ArrowRight, FileSpreadsheet, FolderOpen, FolderPlus, UserRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useSessionUser } from '@/auth/session';
import { readProjectStore } from '@/lib/project-store';
import { DEFAULT_WORKSPACE, projectStandardLabels, type Project, type ProjectStore, type WorkspaceRecord } from '@/lib/workspace-types';
import { Workspace } from '@/pages/Workspace';

export function latestProjectActivity(project: Project) {
  return project.files.reduce((latest, file) => file.importedAt > latest ? file.importedAt : latest, project.createdAt);
}

export function WorkspaceHome() {
  const user = useSessionUser();
  const [, setLocation] = useLocation();
  const [store, setStore] = useState<ProjectStore>(readProjectStore);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const workspaces = store.workspaces.filter((workspace) => workspace.isDefault || (user ? workspace.ownerId === user.id : !workspace.ownerId));
  const activeWorkspace = workspaces.find((workspace) => workspace.id === store.activeWorkspaceId) ?? DEFAULT_WORKSPACE;
  const projects = store.projects
    .filter((project) => project.workspaceId === activeWorkspace.id && (user ? project.ownerId === user.id : !project.ownerId))
    .sort((a, b) => latestProjectActivity(b).localeCompare(latestProjectActivity(a)));
  const persist = (next: ProjectStore) => {
    setStore(next);
    try { localStorage.setItem('statlab-projects-v1', JSON.stringify(next)); setError(''); }
    catch { setError('Could not save workspace changes in this browser.'); }
  };
  const chooseWorkspace = (id: string) => {
    const nextProject = store.projects.find((project) => project.workspaceId === id && (user ? project.ownerId === user.id : !project.ownerId));
    persist({ ...store, activeWorkspaceId: id, activeProjectId: nextProject?.id ?? null, activeFileId: null });
  };
  const createWorkspace = (event: FormEvent) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;
    const created: WorkspaceRecord = { id: `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, createdAt: new Date().toISOString(), ownerId: user?.id ?? null };
    persist({ ...store, workspaces: [...store.workspaces, created], activeWorkspaceId: created.id, activeProjectId: null, activeFileId: null });
    setWorkspaceName('');
    setShowCreateWorkspace(false);
  };
  const openProject = (project: Project) => {
    persist({ ...store, activeWorkspaceId: activeWorkspace.id, activeProjectId: project.id, activeFileId: project.files[0]?.id ?? null });
    setLocation('/workspace/app');
  };
  return <main className="min-h-screen bg-[#eef4f6] text-[#142a3d]">
    {!user && <div className="flex flex-wrap items-center justify-center gap-3 bg-[#dcece8] px-4 py-3 text-center text-xs text-[#095e55]"><strong>Demo workspace</strong><span>Sample data and projects are saved only in this browser.</span></div>}
    <header className="border-b border-[#cbd8df] bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div>
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-[#64748b]">
            <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
            <span>/</span><span className="font-semibold text-[#40596b]">Workspace Lab</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#147b69]">IFRS Lab</p>
          <h1 className="mt-1 text-2xl font-bold">Workspace Lab</h1>
          <p className="mt-1 text-sm text-[#64748b]">Your projects, files, and recent activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/workspace/app" className="rounded-lg bg-[#147b69] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f6556]">Open data workspace</Link>
          <Link href={user ? '/account' : '/sign-in'} aria-label={user ? 'Your account' : 'Sign in'} className="grid h-10 w-10 place-items-center rounded-full border border-[#d2dfe3] bg-white text-[#40596b]"><UserRound size={17}/></Link>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-7">
      <section className="rounded-2xl border border-[#d2dfe3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label htmlFor="workspace-picker" className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em] text-[#64748b]">Current workspace</label>
            <div className="flex flex-wrap items-center gap-2">
              <select id="workspace-picker" value={activeWorkspace.id} onChange={(event) => chooseWorkspace(event.target.value)} className="min-w-[220px] rounded-lg border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2.5 text-sm font-semibold">
                {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}{workspace.isDefault ? ' · Default' : ''}</option>)}
              </select>
              {activeWorkspace.isDefault && <span className="rounded-full bg-[#dcece8] px-2.5 py-1 text-[10px] font-semibold text-[#095e55]">Default workspace</span>}
            </div>
          </div>
          <button onClick={() => setShowCreateWorkspace((value) => !value)} className="flex items-center gap-2 rounded-lg border border-[#9bbeb7] px-3.5 py-2.5 text-sm font-semibold text-[#147b69] hover:bg-[#dcece8]"><FolderPlus size={16}/> New workspace</button>
        </div>
        {showCreateWorkspace && <form onSubmit={createWorkspace} className="mt-4 flex flex-wrap gap-2 rounded-xl bg-[#f4f8f8] p-3">
          <input autoFocus value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} aria-label="Workspace name" placeholder="e.g. Client reporting" className="min-w-[220px] flex-1 rounded-lg border border-[#d2dfe3] bg-white px-3 py-2 text-sm"/>
          <button disabled={!workspaceName.trim()} className="rounded-lg bg-[#147b69] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create workspace</button>
          <button type="button" onClick={() => setShowCreateWorkspace(false)} className="rounded-lg px-3 py-2 text-sm text-[#64748b]">Cancel</button>
        </form>}
      </section>
      {error && <p role="alert" className="mt-3 text-sm text-[#922f27]">{error}</p>}
      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-bold">Recent projects</h2><p className="mt-1 text-sm text-[#64748b]">{projects.length} {projects.length === 1 ? 'project' : 'projects'} in {activeWorkspace.name}</p></div>
          <Link href="/workspace/app?newProject=1" className="flex items-center gap-2 rounded-lg border border-[#d2dfe3] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#40596b] hover:border-[#147b69] hover:text-[#147b69]"><FolderPlus size={16}/> Start a project</Link>
        </div>
        {!projects.length && <div className="rounded-2xl border border-dashed border-[#d2dfe3] bg-white p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#dcece8] text-[#147b69]"><FolderOpen size={22}/></div>
          <h3 className="mt-4 font-semibold">No projects here yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#64748b]">Start a project to choose its IFRS standard, then keep its imported files and work together here.</p>
          <Link href="/workspace/app?newProject=1" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#147b69] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f6556]"><FolderPlus size={16}/> Create your first project</Link>
        </div>}
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => <article key={project.id} className="rounded-2xl border border-[#d2dfe3] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#147b69]">{projectStandardLabels[project.standard]}</p><h3 className="mt-1 truncate text-lg font-bold">{project.name}</h3></div>
              <span className="shrink-0 rounded-full bg-[#dcece8] px-2.5 py-1 text-[10px] font-semibold text-[#095e55]">{project.files.length} {project.files.length === 1 ? 'file' : 'files'}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748b]">
              <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>By {project.ownerName || 'You'}</span>
              <span>Updated {new Date(latestProjectActivity(project)).toLocaleDateString()}</span>
            </div>
            {project.files.length > 0 && <div className="mt-4 border-t border-[#e7edef] pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">Recent files</p>
              {project.files.slice(-2).reverse().map((file) => <div key={file.id} className="flex items-center gap-2 py-1 text-xs text-[#40596b]"><FileSpreadsheet size={14} className="text-[#147b69]"/><span className="truncate">{file.name}</span></div>)}
            </div>}
            <button onClick={() => openProject(project)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#147b69] hover:underline">Open project <ArrowRight size={15}/></button>
          </article>)}
        </div>
      </section>
      <p className="mt-8 text-center text-[11px] text-[#64748b]">Workspaces and project files are currently stored in this browser.</p>
    </div>
  </main>;
}

export function WorkspaceEntry() {
  return <WorkspaceHome/>;
}

export function WorkspaceAppRoute() {
  const user = useSessionUser();
  if (user) return <Workspace/>;
  return <div><div className="flex flex-wrap items-center justify-center gap-3 bg-[#dcece8] px-4 py-3 text-center text-xs text-[#095e55]"><strong>Demo workspace</strong><span>This session uses sample data saved only in this browser.</span></div><Workspace/></div>;
}
