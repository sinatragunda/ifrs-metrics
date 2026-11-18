import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, FileSpreadsheet, FolderOpen, FolderPlus, UserPlus, Users, X } from 'lucide-react';
import { useSessionUser } from '@/auth/session';
import {
  addProjectCollaborator,
  collaboratorsForProject,
  readPendingInvites,
  removeProjectCollaborator,
  visibleProjectsInWorkspace,
  visibleWorkspaces,
  writePendingInvites,
  type PendingInvite,
} from '@/lib/project-access';
import { DEFAULT_WORKSPACE, projectStandardLabels, type Project, type ProjectStore, type WorkspaceRecord } from '@/lib/workspace-types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function latestProjectActivity(project: Project) {
  return project.files.reduce((latest, file) => file.importedAt > latest ? file.importedAt : latest, project.createdAt);
}

type WorkspaceHomeSectionProps = {
  projectStore: ProjectStore;
  onProjectStoreChange: (next: ProjectStore) => void;
  onOpenProject: (project: Project) => void;
  onStartProject: () => void;
};

export function WorkspaceHomeSection({
  projectStore,
  onProjectStoreChange,
  onOpenProject,
  onStartProject,
}: WorkspaceHomeSectionProps) {
  const user = useSessionUser();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteProjectIds, setInviteProjectIds] = useState<string[]>([]);
  const [inviteFeedback, setInviteFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [collaboratorsProject, setCollaboratorsProject] = useState<Project | null>(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorFeedback, setCollaboratorFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [inviteRevision, setInviteRevision] = useState(0);

  const workspaces = visibleWorkspaces(projectStore.workspaces, user);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === projectStore.activeWorkspaceId) ?? DEFAULT_WORKSPACE;
  const projects = visibleProjectsInWorkspace(projectStore.projects, activeWorkspace.id, user)
    .sort((a, b) => latestProjectActivity(b).localeCompare(latestProjectActivity(a)));
  const ownedProjects = projects.filter((project) => (user ? project.ownerId === user.id : !project.ownerId));
  const allProjectsSelected = ownedProjects.length > 0 && inviteProjectIds.length === ownedProjects.length;

  const chooseWorkspace = (id: string) => {
    const nextProject = visibleProjectsInWorkspace(projectStore.projects, id, user)[0];
    onProjectStoreChange({
      ...projectStore,
      activeWorkspaceId: id,
      activeProjectId: nextProject?.id ?? null,
      activeFileId: null,
    });
    setInviteProjectIds([]);
    setInviteFeedback(null);
  };

  const createWorkspace = (event: FormEvent) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;
    const created: WorkspaceRecord = {
      id: `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      createdAt: new Date().toISOString(),
      ownerId: user?.id ?? null,
    };
    onProjectStoreChange({
      ...projectStore,
      workspaces: [...projectStore.workspaces, created],
      activeWorkspaceId: created.id,
      activeProjectId: null,
      activeFileId: null,
    });
    setWorkspaceName('');
    setShowCreateWorkspace(false);
  };

  const toggleInvitePanel = () => {
    setShowInvite((open) => {
      const next = !open;
      if (next) {
        setShowCreateWorkspace(false);
        setInviteFeedback(null);
      }
      return next;
    });
  };

  const toggleInviteProject = (projectId: string) => {
    setInviteProjectIds((current) =>
      current.includes(projectId) ? current.filter((id) => id !== projectId) : [...current, projectId],
    );
  };

  const toggleSelectAllProjects = () => {
    setInviteProjectIds(allProjectsSelected ? [] : ownedProjects.map((project) => project.id));
  };

  const bumpInvites = () => setInviteRevision((value) => value + 1);

  const closeCollaborators = () => {
    setCollaboratorsProject(null);
    setCollaboratorEmail('');
    setCollaboratorFeedback(null);
  };

  useEffect(() => {
    if (!collaboratorsProject) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCollaborators();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collaboratorsProject]);

  const sendInvite = (event: FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setInviteFeedback({ kind: 'error', message: 'Enter a valid email address.' });
      return;
    }
    const invite: PendingInvite = {
      id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email,
      workspaceId: activeWorkspace.id,
      projectIds: inviteProjectIds,
      invitedAt: new Date().toISOString(),
    };
    try {
      writePendingInvites([...readPendingInvites(), invite]);
      bumpInvites();
      const count = inviteProjectIds.length;
      setInviteFeedback({
        kind: 'success',
        message: count
          ? `Invite saved for ${email} · ${activeWorkspace.name} · ${count} ${count === 1 ? 'project' : 'projects'}.`
          : `Invite saved for ${email} · workspace access to ${activeWorkspace.name}.`,
      });
      setInviteEmail('');
      setInviteProjectIds([]);
    } catch {
      setInviteFeedback({ kind: 'error', message: 'Could not save the invite in this browser.' });
    }
  };

  const projectCollaborators = inviteRevision >= 0 && collaboratorsProject
    ? collaboratorsForProject(collaboratorsProject.id)
    : [];

  const addCollaborator = (event: FormEvent) => {
    event.preventDefault();
    if (!collaboratorsProject) return;
    const email = collaboratorEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setCollaboratorFeedback({ kind: 'error', message: 'Enter a valid email address.' });
      return;
    }
    try {
      addProjectCollaborator(collaboratorsProject.id, collaboratorsProject.workspaceId || activeWorkspace.id, email);
      bumpInvites();
      setCollaboratorEmail('');
      setCollaboratorFeedback({ kind: 'success', message: `Added ${email} to this project.` });
    } catch {
      setCollaboratorFeedback({ kind: 'error', message: 'Could not save the collaborator in this browser.' });
    }
  };

  const removeCollaborator = (email: string) => {
    if (!collaboratorsProject) return;
    try {
      removeProjectCollaborator(collaboratorsProject.id, email);
      bumpInvites();
      setCollaboratorFeedback({ kind: 'success', message: `Removed ${email} from this project.` });
    } catch {
      setCollaboratorFeedback({ kind: 'error', message: 'Could not remove the collaborator.' });
    }
  };

  const canManageCollaborators = (project: Project) =>
    Boolean(user && project.ownerId === user.id);

  return (
    <section className="space-y-5" aria-labelledby="workspace-home-title">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#147b69]">IFRS Workspace Lab</p>
        <h2 id="workspace-home-title" className="text-xl font-bold text-[#142a3d]">Your projects and workspaces</h2>
        <p className="mt-1 text-sm text-[#64748b]">Manage the current workspace, invite collaborators, and open recent projects.</p>
      </div>

      <div className="rounded-2xl border border-[#d2dfe3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label htmlFor="workspace-picker" className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em] text-[#64748b]">Current workspace</label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id="workspace-picker"
                value={activeWorkspace.id}
                onChange={(event) => chooseWorkspace(event.target.value)}
                className="min-w-[220px] rounded-none border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2.5 text-sm font-semibold"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}{workspace.isDefault ? ' · Default' : ''}
                  </option>
                ))}
              </select>
              {activeWorkspace.isDefault && (
                <span className="rounded-full bg-[#dcece8] px-2.5 py-1 text-[10px] font-semibold text-[#095e55]">Default workspace</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user && (
              <button type="button" onClick={toggleInvitePanel} className="btn-ghost">
                <UserPlus size={16}/> Invite
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowCreateWorkspace((value) => !value);
                setShowInvite(false);
              }}
              className="btn-ghost"
            >
              <FolderPlus size={16}/> New workspace
            </button>
          </div>
        </div>

        {showCreateWorkspace && (
          <form onSubmit={createWorkspace} className="mt-4 flex flex-wrap gap-2 rounded-xl bg-[#f4f8f8] p-3">
            <input
              autoFocus
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              aria-label="Workspace name"
              placeholder="e.g. Client reporting"
              className="min-w-[220px] flex-1 rounded-lg border border-[#d2dfe3] bg-white px-3 py-2 text-sm"
            />
            <button disabled={!workspaceName.trim()} className="btn-primary disabled:opacity-50">Create workspace</button>
            <button type="button" onClick={() => setShowCreateWorkspace(false)} className="btn-secondary">Cancel</button>
          </form>
        )}

        {user && showInvite && (
          <form onSubmit={sendInvite} className="mt-4 space-y-3 rounded-xl bg-[#f4f8f8] p-3">
            <div>
              <label htmlFor="invite-email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">Invite by email</label>
              <input
                id="invite-email"
                autoFocus
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="colleague@company.com"
                className="w-full min-w-[220px] rounded-lg border border-[#d2dfe3] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">
                  Projects to share <span className="font-medium normal-case tracking-normal text-[#94a3b8]">(optional)</span>
                </p>
                <button
                  type="button"
                  onClick={toggleSelectAllProjects}
                  disabled={!projects.length}
                  className="text-[11px] font-semibold text-[#147b69] hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                >
                  {allProjectsSelected ? 'Clear all' : 'Select all'}
                </button>
              </div>
              {!ownedProjects.length ? (
                <p className="rounded-lg border border-dashed border-[#d2dfe3] bg-white px-3 py-3 text-sm text-[#64748b]">
                  No projects yet. You can still invite them to this workspace.
                </p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[#d2dfe3] bg-white p-2">
                  {ownedProjects.map((project) => {
                    const checked = inviteProjectIds.includes(project.id);
                    return (
                      <label
                        key={project.id}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 text-sm transition-colors ${
                          checked ? 'bg-[#dcece8]/70' : 'hover:bg-[#f4f8f8]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleInviteProject(project.id)}
                          className="mt-0.5 accent-[#0e786b]"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[#142a3d]">{project.name}</span>
                          <span className="block text-[11px] text-[#64748b]">{projectStandardLabels[project.standard]}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {inviteFeedback && (
              <p
                role="status"
                className={`text-sm ${inviteFeedback.kind === 'success' ? 'text-[#095e55]' : 'text-[#922f27]'}`}
              >
                {inviteFeedback.message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={!inviteEmail.trim()} className="btn-primary disabled:opacity-50">
                Send invite
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInvite(false);
                  setInviteEmail('');
                  setInviteProjectIds([]);
                  setInviteFeedback(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-[#64748b]">Invites are stored in this browser for now. Email delivery is not sent yet.</p>
          </form>
        )}
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#142a3d]">Recent projects</h3>
            <p className="mt-1 text-sm text-[#64748b]">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} in {activeWorkspace.name}
            </p>
          </div>
          <button type="button" onClick={onStartProject} className="btn-secondary">
            <FolderPlus size={16}/> Start a project
          </button>
        </div>

        {!projects.length && (
          <div className="rounded-2xl border border-dashed border-[#d2dfe3] bg-white p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#dcece8] text-[#147b69]">
              <FolderOpen size={22}/>
            </div>
            <h3 className="mt-4 font-semibold text-[#142a3d]">No projects here yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-[#64748b]">
              Start a project to choose its IFRS standard, then keep its imported files and work together here.
            </p>
            <button type="button" onClick={onStartProject} className="btn-primary mt-5">
              <FolderPlus size={16}/> Create your first project
            </button>
          </div>
        )}

        <div className="grid gap-2 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-[3px] border border-[#d2dfe3] bg-white px-3.5 py-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#147b69]">{projectStandardLabels[project.standard]}</p>
                  <h3 className="mt-0.5 truncate text-[14px] font-bold leading-tight text-[#142a3d]">{project.name}</h3>
                </div>
                <span className="shrink-0 rounded-[3px] bg-[#dcece8] px-1.5 py-0.5 text-[9px] font-semibold text-[#095e55]">
                  {project.files.length} {project.files.length === 1 ? 'file' : 'files'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#64748b]">
                <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
                <span>By {project.ownerName || 'You'}</span>
                <span>Updated {new Date(latestProjectActivity(project)).toLocaleDateString()}</span>
              </div>
              {project.files.length > 0 && (
                <div className="mt-2 border-t border-[#e7edef] pt-2">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#64748b]">Recent files</p>
                  {project.files.slice(-2).reverse().map((file) => (
                    <div key={file.id} className="flex items-center gap-1.5 py-0.5 text-[11px] text-[#40596b]">
                      <FileSpreadsheet size={12} className="text-[#147b69]"/>
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button type="button" onClick={() => onOpenProject(project)} className="btn-ghost !px-2 !py-1 !text-[10px]">
                  Open project <ArrowRight size={13}/>
                </button>
                {canManageCollaborators(project) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCollaboratorsProject(project);
                      setCollaboratorEmail('');
                      setCollaboratorFeedback(null);
                    }}
                    className="btn-ghost !px-2 !py-1 !text-[10px]"
                  >
                    <Users size={13}/> Collaborators
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {collaboratorsProject && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#142a3d]/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collaborators-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCollaborators();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#d2dfe3] bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#147b69]">Project access</p>
                <h2 id="collaborators-title" className="mt-1 text-xl font-bold text-[#142a3d]">Collaborators</h2>
                <p className="mt-1 text-xs text-[#64748b]">
                  People invited to <span className="font-semibold text-[#40596b]">{collaboratorsProject.name}</span>
                </p>
              </div>
              <button type="button" onClick={closeCollaborators} aria-label="Close collaborators" className="btn-icon !h-8 !w-8 !rounded-[3px]">
                <X size={18}/>
              </button>
            </div>

            <div className="mt-4 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[#d2dfe3] bg-[#f8faf9] p-2">
              {!projectCollaborators.length && (
                <p className="px-2 py-3 text-sm text-[#64748b]">No collaborators yet. Add someone by email below.</p>
              )}
              {projectCollaborators.map((person) => (
                <div
                  key={person.email}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#142a3d]">{person.email}</p>
                    <p className="text-[11px] text-[#64748b]">Invited {new Date(person.invitedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCollaborator(person.email)}
                    className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-[#922f27] hover:bg-[#fdecec]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addCollaborator} className="mt-4 space-y-2">
              <label htmlFor="collaborator-email" className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">
                Add collaborator
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="collaborator-email"
                  type="email"
                  value={collaboratorEmail}
                  onChange={(event) => setCollaboratorEmail(event.target.value)}
                  placeholder="colleague@company.com"
                  className="min-w-[180px] flex-1 rounded-lg border border-[#d2dfe3] bg-white px-3 py-2 text-sm"
                />
                <button type="submit" disabled={!collaboratorEmail.trim()} className="btn-primary disabled:opacity-50">
                  <UserPlus size={14}/> Add
                </button>
              </div>
              {collaboratorFeedback && (
                <p
                  role="status"
                  className={`text-sm ${collaboratorFeedback.kind === 'success' ? 'text-[#095e55]' : 'text-[#922f27]'}`}
                >
                  {collaboratorFeedback.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
