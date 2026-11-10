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
  return <main className="ws-home relative min-h-screen overflow-hidden text-[#142a3d]">
    <style>{`
      .ws-home {
        background:
          radial-gradient(circle at 12% 18%, rgba(14, 120, 107, 0.10), transparent 28%),
          radial-gradient(circle at 86% 12%, rgba(82, 104, 122, 0.12), transparent 32%),
          radial-gradient(circle at 78% 78%, rgba(20, 123, 105, 0.08), transparent 36%),
          radial-gradient(circle at 18% 82%, rgba(148, 163, 184, 0.10), transparent 30%),
          linear-gradient(180deg, #eef4f6 0%, #e8f0f2 48%, #eef4f6 100%);
      }
      .ws-home .orbit-field {
        pointer-events: none;
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 0;
      }
      .ws-home .orbit {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(14, 120, 107, 0.14);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.35),
          inset 0 0 40px rgba(14, 120, 107, 0.04);
      }
      .ws-home .orbit-a {
        width: min(720px, 78vw); height: min(720px, 78vw);
        top: -18%; right: -14%;
        background:
          repeating-radial-gradient(circle at 42% 38%,
            rgba(220, 236, 232, 0.55) 0 10px,
            rgba(203, 216, 223, 0.28) 10px 18px,
            rgba(238, 244, 246, 0.15) 18px 28px);
        opacity: .72;
      }
      .ws-home .orbit-b {
        width: min(460px, 58vw); height: min(460px, 58vw);
        bottom: -12%; left: -10%;
        background:
          repeating-radial-gradient(circle at 58% 46%,
            rgba(212, 228, 224, 0.5) 0 8px,
            rgba(148, 163, 184, 0.16) 8px 14px,
            rgba(238, 244, 246, 0.12) 14px 22px);
        opacity: .65;
      }
      .ws-home .orbit-c {
        width: min(280px, 42vw); height: min(280px, 42vw);
        top: 38%; left: 42%;
        border-color: rgba(82, 104, 122, 0.12);
        background:
          radial-gradient(circle at 35% 32%, rgba(255,255,255,.55), transparent 42%),
          repeating-conic-gradient(from 20deg at 50% 50%,
            rgba(14, 120, 107, 0.07) 0deg 18deg,
            rgba(203, 216, 223, 0.12) 18deg 36deg);
        opacity: .5;
      }
      .ws-home .orbit-ring {
        position: absolute;
        border-radius: 50%;
        border: 1px dashed rgba(14, 120, 107, 0.18);
      }
      .ws-home .orbit-ring-a {
        width: min(860px, 92vw); height: min(860px, 92vw);
        top: -24%; right: -20%;
      }
      .ws-home .orbit-ring-b {
        width: min(560px, 70vw); height: min(560px, 70vw);
        bottom: -18%; left: -16%;
      }
      .ws-home .orbit-moon {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #f8fbfa, #dcece8 55%, #b7c8c4);
        box-shadow: 0 0 0 1px rgba(14, 120, 107, 0.12), 0 8px 24px rgba(20, 42, 61, 0.08);
      }
      .ws-home .orbit-moon-a { width: 18px; height: 18px; top: 16%; right: 18%; opacity: .8; }
      .ws-home .orbit-moon-b { width: 11px; height: 11px; bottom: 22%; left: 14%; opacity: .7; }
      .ws-home .orbit-moon-c { width: 8px; height: 8px; top: 48%; left: 58%; opacity: .55; }
      .ws-home > *:not(.orbit-field) { position: relative; z-index: 1; }
      @media (prefers-reduced-motion: no-preference) {
        .ws-home .orbit-a { animation: ws-drift 28s ease-in-out infinite; }
        .ws-home .orbit-b { animation: ws-drift 34s ease-in-out infinite reverse; }
        .ws-home .orbit-c { animation: ws-spin 60s linear infinite; }
      }
      @keyframes ws-drift {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-12px, 10px); }
      }
      @keyframes ws-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
    <div className="orbit-field" aria-hidden="true">
      <div className="orbit-ring orbit-ring-a" />
      <div className="orbit-ring orbit-ring-b" />
      <div className="orbit orbit-a" />
      <div className="orbit orbit-b" />
      <div className="orbit orbit-c" />
      <div className="orbit-moon orbit-moon-a" />
      <div className="orbit-moon orbit-moon-b" />
      <div className="orbit-moon orbit-moon-c" />
    </div>
    {!user && <div className="flex flex-wrap items-center justify-center gap-3 bg-[#dcece8]/90 px-4 py-3 text-center text-xs text-[#095e55] backdrop-blur-[2px]"><strong>Demo workspace</strong><span>Sample data and projects are saved only in this browser.</span></div>}
    <header className="border-b border-[#cbd8df] bg-white/90 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div>
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-[#64748b]">
            <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
            <span>/</span><span className="font-semibold text-[#40596b]">IFRS Workspace Lab</span>
          </nav>
          <h1 className="text-2xl font-bold">IFRS Workspace Lab</h1>
          <p className="mt-1 text-sm text-[#64748b]">Your projects, files, and recent activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/workspace/app" className="btn-primary">Open data workspace</Link>
          <Link href={user ? '/account' : '/sign-in'} aria-label={user ? 'Your account' : 'Sign in'} className="btn-icon !h-10 !w-10"><UserRound size={17}/></Link>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-7">
      <section className="rounded-2xl border border-[#d2dfe3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label htmlFor="workspace-picker" className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em] text-[#64748b]">Current workspace</label>
            <div className="flex flex-wrap items-center gap-2">
              <select id="workspace-picker" value={activeWorkspace.id} onChange={(event) => chooseWorkspace(event.target.value)} className="min-w-[220px] rounded-none border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2.5 text-sm font-semibold">
                {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}{workspace.isDefault ? ' · Default' : ''}</option>)}
              </select>
              {activeWorkspace.isDefault && <span className="rounded-full bg-[#dcece8] px-2.5 py-1 text-[10px] font-semibold text-[#095e55]">Default workspace</span>}
            </div>
          </div>
          <button onClick={() => setShowCreateWorkspace((value) => !value)} className="btn-ghost"><FolderPlus size={16}/> New workspace</button>
        </div>
        {showCreateWorkspace && <form onSubmit={createWorkspace} className="mt-4 flex flex-wrap gap-2 rounded-xl bg-[#f4f8f8] p-3">
          <input autoFocus value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} aria-label="Workspace name" placeholder="e.g. Client reporting" className="min-w-[220px] flex-1 rounded-lg border border-[#d2dfe3] bg-white px-3 py-2 text-sm"/>
          <button disabled={!workspaceName.trim()} className="btn-primary disabled:opacity-50">Create workspace</button>
          <button type="button" onClick={() => setShowCreateWorkspace(false)} className="btn-secondary">Cancel</button>
        </form>}
      </section>
      {error && <p role="alert" className="mt-3 text-sm text-[#922f27]">{error}</p>}
      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-bold">Recent projects</h2><p className="mt-1 text-sm text-[#64748b]">{projects.length} {projects.length === 1 ? 'project' : 'projects'} in {activeWorkspace.name}</p></div>
          <Link href="/workspace/app?newProject=1" className="btn-secondary"><FolderPlus size={16}/> Start a project</Link>
        </div>
        {!projects.length && <div className="rounded-2xl border border-dashed border-[#d2dfe3] bg-white p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#dcece8] text-[#147b69]"><FolderOpen size={22}/></div>
          <h3 className="mt-4 font-semibold">No projects here yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#64748b]">Start a project to choose its IFRS standard, then keep its imported files and work together here.</p>
          <Link href="/workspace/app?newProject=1" className="btn-primary mt-5"><FolderPlus size={16}/> Create your first project</Link>
        </div>}
        <div className="grid gap-2 md:grid-cols-2">
          {projects.map((project) => <article key={project.id} className="rounded-[3px] border border-[#d2dfe3] bg-white px-3.5 py-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#147b69]">{projectStandardLabels[project.standard]}</p>
                <h3 className="mt-0.5 truncate text-[14px] font-bold leading-tight">{project.name}</h3>
              </div>
              <span className="shrink-0 rounded-[3px] bg-[#dcece8] px-1.5 py-0.5 text-[9px] font-semibold text-[#095e55]">{project.files.length} {project.files.length === 1 ? 'file' : 'files'}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#64748b]">
              <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>By {project.ownerName || 'You'}</span>
              <span>Updated {new Date(latestProjectActivity(project)).toLocaleDateString()}</span>
            </div>
            {project.files.length > 0 && <div className="mt-2 border-t border-[#e7edef] pt-2">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#64748b]">Recent files</p>
              {project.files.slice(-2).reverse().map((file) => <div key={file.id} className="flex items-center gap-1.5 py-0.5 text-[11px] text-[#40596b]"><FileSpreadsheet size={12} className="text-[#147b69]"/><span className="truncate">{file.name}</span></div>)}
            </div>}
            <button onClick={() => openProject(project)} className="btn-ghost mt-2 !px-2 !py-1 !text-[10px]">Open project <ArrowRight size={13}/></button>
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
