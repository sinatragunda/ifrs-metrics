import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { ArrowRight, FileSpreadsheet, FolderOpen, FolderPlus, UserPlus, Users, X } from 'lucide-react';
import { useSessionUser } from '@/auth/session';
import {
  addProjectCollaborator,
  collaboratorsForProject,
  removeProjectCollaborator,
  visibleProjectsInWorkspace,
  visibleWorkspaces,
  sendPendingInvites,
  type PendingInvite,
} from '@/lib/project-access';
import { httpService } from '@/lib/http-service';
import {
  fetchWorkspaceMembers,
  revokeWorkspaceMember,
  type WorkspaceMember,
} from '@/lib/workspace-members';
import { fetchWorkspaceScopes, type WorkspaceScope } from '@/lib/workspace-template';
import { DEFAULT_WORKSPACE, projectStandardLabels, type Project, type ProjectStore, type WorkspaceRecord } from '@/lib/workspace-types';
import {showSuccessPopup} from "@/lib/status-popup-store.ts";

function workspaceKey(workspace: WorkspaceRecord) {
  return workspace.id || workspace.workspaceId || '';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseInviteEmails(raw: string) {
  return [...new Set(
    raw
      .split(/[\s,;]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  )];
}

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
  const [inviteEmailChips, setInviteEmailChips] = useState<string[]>([]);
  const [inviteEmailDraft, setInviteEmailDraft] = useState('');
  const inviteEmailInputRef = useRef<HTMLInputElement>(null);
  const [inviteProjectIds, setInviteProjectIds] = useState<string[]>([]);
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [workspaceScopes, setWorkspaceScopes] = useState<WorkspaceScope[]>([]);
  const [scopesLoading, setScopesLoading] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [collaboratorsProject, setCollaboratorsProject] = useState<Project | null>(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorFeedback, setCollaboratorFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [inviteRevision, setInviteRevision] = useState(0);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [membersSearch, setMembersSearch] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [revokingMemberId, setRevokingMemberId] = useState<string | null>(null);

  const workspaces = visibleWorkspaces(projectStore.workspaces, user);
  const activeWorkspace = workspaces.find((workspace) => workspaceKey(workspace) === projectStore.activeWorkspaceId) ?? DEFAULT_WORKSPACE;
  const activeWorkspaceId = workspaceKey(activeWorkspace);
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
    setShowMembers(false);
    setMembers([]);
    setMembersSearch('');
    setMembersError(null);
  };

  const filteredMembers = members.filter((member) => {
    const query = membersSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      member.username.toLowerCase().includes(query)
      || member.scope.toLowerCase().includes(query)
      || (member.email?.toLowerCase().includes(query) ?? false)
    );
  });

  const loadMembers = async (workspaceId: string) => {
    if (!workspaceId || workspaceId === DEFAULT_WORKSPACE.id) {
      setMembers([]);
      setMembersError(null);
      setMembersLoading(false);
      return;
    }
    setMembersLoading(true);
    setMembersError(null);
    try {
      const next = await fetchWorkspaceMembers(workspaceId);
      setMembers(next);
    } catch (error) {
      setMembers([]);
      setMembersError(error instanceof Error ? error.message : 'Could not load members.');
    } finally {
      setMembersLoading(false);
    }
  };

  const revokeMember = async (member: WorkspaceMember) => {
    if (!activeWorkspaceId || revokingMemberId) return;
    setRevokingMemberId(member.id);
    try {
      await revokeWorkspaceMember(activeWorkspaceId, member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : 'Could not revoke access.');
    } finally {
      setRevokingMemberId(null);
    }
  };

  const createWorkspace = (event: FormEvent) => {

      event.preventDefault();
      const name = workspaceName.trim();
      if (!name) return;

      const created: WorkspaceRecord = {
          workspaceId: `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name,
          ownerId: user?.id ?? null,
      };

        const callback = (res: any)=> {

        alert(JSON.stringify(res));

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

        const error = (res : any)=>{
            alert('Error '+JSON.stringify(res));
        };

        httpService.post("workspace/",created, {}).then(callback ,error);

  };

  const toggleInvitePanel = () => {
    setShowInvite((open) => {
      const next = !open;
      if (next) {
        setShowCreateWorkspace(false);
        setShowMembers(false);
        setInviteFeedback(null);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!showInvite || !user) return;
    let cancelled = false;
    setScopesLoading(true);
    fetchWorkspaceScopes()
      .then((scopes) => {
        if (cancelled) return;
        setWorkspaceScopes(scopes);
        setInviteRoleId((current) => current || scopes[0]?.id || '');
      })
      .finally(() => {
        if (!cancelled) setScopesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showInvite, user]);

  const toggleInviteProject = (projectId: string) => {
    setInviteProjectIds((current) =>
      current.includes(projectId) ? current.filter((id) => id !== projectId) : [...current, projectId],
    );
  };

  const toggleSelectAllProjects = () => {
    setInviteProjectIds(allProjectsSelected ? [] : ownedProjects.map((project) => project.id));
  };

  const bumpInvites = () => setInviteRevision((value) => value + 1);

  const commitInviteEmails = (raw: string) => {
    const candidates = parseInviteEmails(raw);
    if (!candidates.length) return false;

    const invalid = candidates.filter((email) => !EMAIL_PATTERN.test(email));
    if (invalid.length) {
      setInviteFeedback({
        kind: 'error',
        message: `Enter a full email before adding${invalid.length === 1 ? '' : ' these'}: ${invalid.join(', ')}`,
      });
      return false;
    }

    setInviteEmailChips((current) => {
      const next = [...current];
      for (const email of candidates) {
        if (!next.includes(email)) next.push(email);
      }
      return next;
    });
    setInviteFeedback(null);
    setInviteEmailDraft('');
    return true;
  };

  const removeInviteEmail = (email: string) => {
    setInviteEmailChips((current) => current.filter((item) => item !== email));
  };

  const handleInviteEmailKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ' || event.key === 'Tab') {
      const draft = inviteEmailDraft.trim();
      if (!draft) {
        if (event.key === 'Enter') event.preventDefault();
        return;
      }
      event.preventDefault();
      commitInviteEmails(draft);
      return;
    }

    if (event.key === 'Backspace' && !inviteEmailDraft && inviteEmailChips.length) {
      event.preventDefault();
      setInviteEmailChips((current) => current.slice(0, -1));
    }
  };

  const handleInviteEmailPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (!/[,\s;]/.test(text) && !text.includes('@')) return;
    event.preventDefault();
    commitInviteEmails(`${inviteEmailDraft} ${text}`);
  };

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
    let emails = inviteEmailChips;
    const draft = inviteEmailDraft.trim();
    if (draft) {
      if (!EMAIL_PATTERN.test(draft.toLowerCase())) {
        setInviteFeedback({ kind: 'error', message: 'Finish the current email or remove it before sending.' });
        return;
      }
      const normalized = draft.toLowerCase();
      emails = emails.includes(normalized) ? emails : [...emails, normalized];
      setInviteEmailChips(emails);
      setInviteEmailDraft('');
    }
    if (!emails.length) {
      setInviteFeedback({ kind: 'error', message: 'Enter at least one email address.' });
      return;
    }
    if (!inviteRoleId) {
      setInviteFeedback({ kind: 'error', message: 'Select a workspace role.' });
      return;
    }
    const selectedRole = workspaceScopes.find((scope) => scope.id === inviteRoleId) ?? null;
    const invitedAt = new Date().toISOString();
    const invites: PendingInvite[] = emails.map((email, index) => ({
      email,
      workspaceId: activeWorkspace.id,
      projectIds: inviteProjectIds,
      roleId: selectedRole?.id ?? inviteRoleId,
      roleName: selectedRole?.name ?? inviteRoleId,
    }));
    try {
        const success_callback = ()=>{
            showSuccessPopup('Invites were sent successfully.');
            bumpInvites();
            const people = emails.length === 1 ? emails[0] : `${emails.length} people`;
            const count = inviteProjectIds.length;

            setInviteEmailChips([]);
            setInviteEmailDraft('');
            setInviteProjectIds([]);
        };

        sendPendingInvites(success_callback, [...invites]);

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
                value={activeWorkspaceId}
                onChange={(event) => chooseWorkspace(event.target.value)}
                className="min-w-[220px] rounded-none border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2.5 text-sm font-semibold"
              >
                {workspaces.map((workspace) => {
                  const id = workspaceKey(workspace);
                  return (
                    <option key={id} value={id}>
                      {workspace.name}{workspace.isDefault ? ' · Default' : ''}
                    </option>
                  );
                })}
              </select>
              {activeWorkspace.isDefault && (
                <span className="rounded-full bg-[#dcece8] px-2.5 py-1 text-[10px] font-semibold text-[#095e55]">Default workspace</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => {
                  setShowInvite(false);
                  setShowCreateWorkspace(false);
                  setShowMembers((open) => {
                    const next = !open;
                    if (next) void loadMembers(activeWorkspaceId);
                    else {
                      setMembers([]);
                      setMembersSearch('');
                      setMembersError(null);
                    }
                    return next;
                  });
                }}
                className="btn-ghost"
              >
                <Users size={16}/> Members
              </button>
            )}
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
                setShowMembers(false);
              }}
              className="btn-ghost"
            >
              <FolderPlus size={16}/> New workspace
            </button>
          </div>
        </div>

        {user && showMembers && (
          <div className="mt-4 rounded-xl border border-[#d2dfe3] bg-[#f8faf9] p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#147b69]">Membership</p>
                <h3 className="mt-0.5 text-sm font-bold text-[#142a3d]">
                  People in {activeWorkspace.name}
                </h3>
              </div>
              <button type="button" onClick={() => void loadMembers(activeWorkspaceId)} className="btn-secondary !px-2 !py-1 !text-[10px]" disabled={membersLoading}>
                Refresh
              </button>
            </div>

            <div className="mb-3">
              <label htmlFor="members-search" className="sr-only">Search members</label>
              <input
                id="members-search"
                type="search"
                value={membersSearch}
                onChange={(event) => setMembersSearch(event.target.value)}
                placeholder="Search by username, email, or scope"
                className="w-full rounded-lg border border-[#d2dfe3] bg-white px-3 py-2 text-sm"
              />
            </div>

            {membersLoading ? (
              <p className="px-1 py-3 text-sm text-[#64748b]" role="status">Loading members…</p>
            ) : membersError ? (
              <p className="px-1 py-3 text-sm text-[#922f27]" role="alert">{membersError}</p>
            ) : !members.length ? (
              <p className="px-1 py-3 text-sm text-[#64748b]">No members found for this workspace yet.</p>
            ) : !filteredMembers.length ? (
              <p className="px-1 py-3 text-sm text-[#64748b]">No members match “{membersSearch.trim()}”.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#d2dfe3] bg-white">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-[#f4f8f8] text-[10px] uppercase tracking-wide text-[#64748b]">
                    <tr>
                      <th className="px-3 py-2 font-bold">Username</th>
                      <th className="px-3 py-2 font-bold">Access scope</th>
                      <th className="px-3 py-2 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="border-t border-[#e7edef]">
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-[#142a3d]">{member.username}</p>
                          {member.email && <p className="text-[11px] text-[#64748b]">{member.email}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-[#40596b]">{member.scope}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => void revokeMember(member)}
                            disabled={revokingMemberId === member.id}
                            className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#922f27] hover:bg-[#fdecec] disabled:opacity-50"
                          >
                            {revokingMemberId === member.id ? 'Revoking…' : 'Revoke access'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
              <label htmlFor="invite-emails" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">
                Invite people by email
              </label>
              <div
                className="flex min-h-[44px] w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-[#d2dfe3] bg-white px-2.5 py-2"
                onClick={() => inviteEmailInputRef.current?.focus()}
              >
                {inviteEmailChips.map((email) => (
                  <span
                    key={email}
                    className="inline-flex max-w-full items-center gap-1 rounded-md border border-[#9bbeb7] bg-[#dcece8] px-2 py-1 text-[12px] font-medium text-[#095e55]"
                  >
                    <span className="min-w-0 truncate">{email}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${email}`}
                      title={`Remove ${email}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeInviteEmail(email);
                      }}
                      className="grid h-4 w-4 shrink-0 place-items-center rounded-sm text-[#095e55] hover:bg-[#c5ddd7]"
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <input
                  id="invite-emails"
                  ref={inviteEmailInputRef}
                  autoFocus
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={inviteEmailDraft}
                  onChange={(event) => setInviteEmailDraft(event.target.value)}
                  onKeyDown={handleInviteEmailKeyDown}
                  onPaste={handleInviteEmailPaste}
                  onBlur={() => {
                    if (inviteEmailDraft.trim()) commitInviteEmails(inviteEmailDraft);
                  }}
                  placeholder={inviteEmailChips.length ? 'Add another email' : 'colleague@company.com'}
                  className="min-w-[140px] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-[#94a3b8]"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#64748b]">Press Enter, comma, or space after a full email to add it.</p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">Workspace role</p>
              {scopesLoading ? (
                <p className="rounded-lg border border-dashed border-[#d2dfe3] bg-white px-3 py-3 text-sm text-[#64748b]">Loading roles…</p>
              ) : !workspaceScopes.length ? (
                <p className="rounded-lg border border-dashed border-[#d2dfe3] bg-white px-3 py-3 text-sm text-[#64748b]">No roles available.</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[#d2dfe3] bg-white p-2" role="radiogroup" aria-label="Workspace role">
                  {workspaceScopes.map((scope) => {
                    const selected = inviteRoleId === scope.id;
                    return (
                      <label
                        key={scope.id}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 text-sm transition-colors ${
                          selected ? 'bg-[#dcece8]/70' : 'hover:bg-[#f4f8f8]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="workspace-invite-role"
                          checked={selected}
                          onChange={() => setInviteRoleId(scope.id)}
                          className="mt-0.5 accent-[#0e786b]"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[#142a3d]">{scope.name}</span>
                          {scope.description && (
                            <span className="block text-[11px] text-[#64748b]">{scope.description}</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">
                  Projects to share <span className="font-medium normal-case tracking-normal text-[#94a3b8]">(optional)</span>
                </p>
                <button
                  type="button"
                  onClick={toggleSelectAllProjects}
                  disabled={!ownedProjects.length}
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
              <button
                type="submit"
                disabled={(!inviteEmailChips.length && !inviteEmailDraft.trim()) || !inviteRoleId || scopesLoading}
                className="btn-primary disabled:opacity-50"
              >
                Send invite{(inviteEmailChips.length + (inviteEmailDraft.trim() ? 1 : 0)) > 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInvite(false);
                  setInviteEmailChips([]);
                  setInviteEmailDraft('');
                  setInviteProjectIds([]);
                  setInviteFeedback(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-[#64748b]">Invites are stored in this browser for now. Roles load from `/workspace/template` when available.</p>
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
