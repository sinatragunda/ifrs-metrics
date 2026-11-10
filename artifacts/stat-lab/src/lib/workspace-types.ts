export type Field = { name: string; type: string };
export type Dataset = { name: string; columns: Field[]; rows: Record<string, string | number | null>[] };
export type AnalysisResult = { id: string; title: string; summary: string; values: Record<string, unknown>; createdAt: string };
export type ChatMessage = { role: 'user' | 'assistant'; text: string };
export type Saved = { dataset: Dataset; results: AnalysisResult[]; messages: ChatMessage[] };
export type ProjectFile = { id: string; name: string; importedAt: string; dataset: Dataset; mappings: { source: string; target: string }[] };
export type ProjectStandard = 'general' | 'ifrs16' | 'ifrs9' | 'ifrs17' | 'multiple';
export type Project = { id: string; name: string; standard: ProjectStandard; createdAt: string; workspaceId?: string; ownerId?: string | null; ownerName?: string; files: ProjectFile[] };
export type WorkspaceRecord = { id: string; name: string; createdAt: string; isDefault?: boolean; ownerId?: string | null };
export type ProjectStore = { projects: Project[]; activeProjectId: string | null; activeFileId: string | null; workspaces: WorkspaceRecord[]; activeWorkspaceId: string };
export type CheckoutDraft = { plan: 'fortnight' | 'monthly'; lightSupport: 'fortnight' | 'monthly' | null; dedicatedSupport: 'fortnight' | 'monthly' | null };
export const DEFAULT_WORKSPACE_ID = 'main';
export const DEFAULT_WORKSPACE: WorkspaceRecord = { id: DEFAULT_WORKSPACE_ID, name: 'Main workspace', createdAt: new Date(0).toISOString(), isDefault: true };
export const projectStandardLabels: Record<ProjectStandard, string> = {
  general: 'General / other',
  ifrs16: 'IFRS 16 · Leases',
  ifrs9: 'IFRS 9 · Financial instruments',
  ifrs17: 'IFRS 17 · Insurance contracts',
  multiple: 'Multiple IFRS standards',
};
export const isProjectStandard = (value: unknown): value is ProjectStandard =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(projectStandardLabels, value);
