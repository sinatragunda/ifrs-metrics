import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Activity, ArrowDownToLine, ArrowRight, BarChart3, Check, ChevronDown, ChevronRight, CircleHelp, Database, FileSpreadsheet, Filter, FlaskConical, FolderOpen, FolderPlus, Layers3, MessageSquareText, PanelLeftClose, PanelLeftOpen, Search, Sparkles, Table2, Trash2, Upload, UserRound, X } from 'lucide-react';
import { ClerkProvider, Show, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import * as XLSX from 'xlsx';
import NotFound from '@/pages/not-found';
import IfrsMetrics from '@/pages/IfrsMetrics';

type SessionUser = {
  id: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
} | null;

const SessionUserContext = createContext<SessionUser>(null);
const useSessionUser = () => useContext(SessionUserContext);

function isPublishableKey(key: string): boolean {
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
  const encoded = key.split('_')[2];
  if (!encoded) return false;
  try {
    const decoded = atob(encoded);
    return decoded.endsWith('$') && !decoded.slice(0, -1).includes('$') && decoded.includes('.');
  } catch {
    return false;
  }
}

type Field = { name: string; type: string };
type Dataset = { name: string; columns: Field[]; rows: Record<string, string | number | null>[] };
type AnalysisResult = { id: string; title: string; summary: string; values: Record<string, unknown>; createdAt: string };
type ChatMessage = { role: 'user' | 'assistant'; text: string };
type Saved = { dataset: Dataset; results: AnalysisResult[]; messages: ChatMessage[] };
type ProjectFile = { id: string; name: string; importedAt: string; dataset: Dataset; mappings: { source: string; target: string }[] };
type ProjectStandard = 'general' | 'ifrs16' | 'ifrs9' | 'ifrs17' | 'multiple';
type Project = { id: string; name: string; standard: ProjectStandard; createdAt: string; workspaceId?: string; ownerId?: string | null; ownerName?: string; files: ProjectFile[] };
type WorkspaceRecord = { id: string; name: string; createdAt: string; isDefault?: boolean; ownerId?: string | null };
type ProjectStore = { projects: Project[]; activeProjectId: string | null; activeFileId: string | null; workspaces: WorkspaceRecord[]; activeWorkspaceId: string };
type CheckoutDraft = { plan: 'fortnight' | 'monthly'; lightSupport: 'fortnight' | 'monthly' | null; dedicatedSupport: 'fortnight' | 'monthly' | null };
const DEFAULT_WORKSPACE_ID = 'main';
const DEFAULT_WORKSPACE: WorkspaceRecord = { id: DEFAULT_WORKSPACE_ID, name: 'Main workspace', createdAt: new Date(0).toISOString(), isDefault: true };
const projectStandardLabels: Record<ProjectStandard, string> = {
  general: 'General / other',
  ifrs16: 'IFRS 16 · Leases',
  ifrs9: 'IFRS 9 · Financial instruments',
  ifrs17: 'IFRS 17 · Insurance contracts',
  multiple: 'Multiple IFRS standards',
};
const isProjectStandard = (value: unknown): value is ProjectStandard =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(projectStandardLabels, value);
function readProjectStore(): ProjectStore {
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

const demo: Dataset = {
  name: 'Field study · spring cohort',
  columns: [{ name: 'participant', type: 'text' }, { name: 'condition', type: 'category' }, { name: 'hours_sleep', type: 'number' }, { name: 'focus_score', type: 'number' }, { name: 'recall_pct', type: 'number' }, { name: 'study_minutes', type: 'number' }],
  rows: [
    { participant:'P-01', condition:'Routine', hours_sleep:6.2, focus_score:61, recall_pct:72, study_minutes:34 },
    { participant:'P-02', condition:'Routine', hours_sleep:7.1, focus_score:68, recall_pct:75, study_minutes:41 },
    { participant:'P-03', condition:'Routine', hours_sleep:5.8, focus_score:55, recall_pct:64, study_minutes:28 },
    { participant:'P-04', condition:'Routine', hours_sleep:7.6, focus_score:73, recall_pct:81, study_minutes:52 },
    { participant:'P-05', condition:'Routine', hours_sleep:6.7, focus_score:65, recall_pct:70, study_minutes:38 },
    { participant:'P-06', condition:'Routine', hours_sleep:8.0, focus_score:76, recall_pct:84, study_minutes:57 },
    { participant:'P-07', condition:'Routine', hours_sleep:6.4, focus_score:63, recall_pct:69, study_minutes:35 },
    { participant:'P-08', condition:'Routine', hours_sleep:7.3, focus_score:70, recall_pct:78, study_minutes:46 },
    { participant:'P-09', condition:'Routine', hours_sleep:5.5, focus_score:52, recall_pct:61, study_minutes:25 },
    { participant:'P-10', condition:'Routine', hours_sleep:7.0, focus_score:67, recall_pct:76, study_minutes:43 },
    { participant:'P-11', condition:'Routine', hours_sleep:6.1, focus_score:60, recall_pct:68, study_minutes:32 },
    { participant:'P-12', condition:'Routine', hours_sleep:7.8, focus_score:74, recall_pct:82, study_minutes:54 },
    { participant:'P-13', condition:'Guided', hours_sleep:6.4, focus_score:72, recall_pct:78, study_minutes:42 },
    { participant:'P-14', condition:'Guided', hours_sleep:7.2, focus_score:79, recall_pct:85, study_minutes:49 },
    { participant:'P-15', condition:'Guided', hours_sleep:5.9, focus_score:64, recall_pct:70, study_minutes:33 },
    { participant:'P-16', condition:'Guided', hours_sleep:7.8, focus_score:84, recall_pct:90, study_minutes:61 },
    { participant:'P-17', condition:'Guided', hours_sleep:6.8, focus_score:75, recall_pct:82, study_minutes:44 },
    { participant:'P-18', condition:'Guided', hours_sleep:8.1, focus_score:87, recall_pct:93, study_minutes:66 },
    { participant:'P-19', condition:'Guided', hours_sleep:6.6, focus_score:74, recall_pct:79, study_minutes:40 },
    { participant:'P-20', condition:'Guided', hours_sleep:7.5, focus_score:81, recall_pct:88, study_minutes:55 },
    { participant:'P-21', condition:'Guided', hours_sleep:5.7, focus_score:62, recall_pct:68, study_minutes:30 },
    { participant:'P-22', condition:'Guided', hours_sleep:7.1, focus_score:78, recall_pct:84, study_minutes:48 },
    { participant:'P-23', condition:'Guided', hours_sleep:6.3, focus_score:71, recall_pct:77, study_minutes:37 },
    { participant:'P-24', condition:'Guided', hours_sleep:7.9, focus_score:85, recall_pct:91, study_minutes:63 },
  ],
};

const catalog = [
  { group:'Explore', items:[['Descriptive summary','Center, spread, and missingness'],['Frequency table','Counts and proportions by category'],['Histogram','Inspect a numeric distribution'],['Box plot','Compare spread and outliers'],['Normality check','Assess shape and skew']] },
  { group:'Compare', items:[['Independent t-test','Compare two independent group means'],['Paired t-test','Compare paired measurements'],['One-way ANOVA','Compare means across 3+ groups'],['Mann–Whitney U','Non-parametric two-group comparison'],['Kruskal–Wallis','Non-parametric multi-group comparison']] },
  { group:'Relate', items:[['Pearson correlation','Linear association between two fields'],['Spearman correlation','Rank-based association'],['Linear regression','Model a continuous outcome'],['Chi-square test','Association between categories']] },
  { group:'Prepare', items:[['Filter rows','Subset records with a condition'],['Missing values','Audit gaps across fields'],['Standardize values','Rescale numeric fields'],['Random sample','Draw a reproducible subset']] },
];

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (char === delimiter && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some((v) => v.trim() !== '')) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell); if (row.some((v) => v.trim() !== '')) rows.push(row);
  return rows;
}
function toDataset(text: string, name: string, delimiter: string): Dataset {
  const raw = parseDelimited(text.replace(/^\uFEFF/, ''), delimiter);
  return toDatasetFromMatrix(raw, name);
}
function toDatasetFromMatrix(raw: unknown[][], name: string): Dataset {
  if (raw.length < 2) throw new Error('This file needs a header row and at least one data row.');
  const headers = (raw[0] ?? []).map((h, i) => String(h ?? '').trim() || `field_${i + 1}`);
  const rows = raw.slice(1).map((cells) => Object.fromEntries(headers.map((h, i) => {
    const v = String(cells[i] ?? '').trim();
    if (!v) return [h, null];
    const n = Number(v); return [h, Number.isFinite(n) ? n : v];
  })));
  const columns = headers.map((h) => ({ name: h, type: rows.some((r) => typeof r[h] === 'number') ? 'number' : rows.some((r) => r[h] !== null) ? 'category' : 'text' }));
  return { name: name.replace(/\.(csv|tsv)$/i, '') || 'Imported data', columns, rows };
}
const columnLetter = (index: number) => {
  let number = index + 1, label = '';
  while (number > 0) { const remainder = (number - 1) % 26; label = String.fromCharCode(65 + remainder) + label; number = Math.floor((number - 1) / 26); }
  return `Column ${label}`;
};
const nums = (rows: Dataset['rows'], field: string) => rows.map((r) => r[field]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
const mean = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const variance = (a: number[]) => a.length > 1 ? a.reduce((s, v) => s + (v - mean(a)) ** 2, 0) / (a.length - 1) : 0;
const fmt = (n: number, digits = 2) => Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits }) : '—';
function logGamma(z: number): number {
  const coefficients = [676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406, 12.5073432786869, -0.13857109526572, 9.98436957801957e-6, 1.50563273514931e-7];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  const shifted = z - 1;
  let sum = 0.9999999999998099;
  coefficients.forEach((coefficient, index) => { sum += coefficient / (shifted + index + 1); });
  const t = shifted + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(sum);
}
function betaFraction(a: number, b: number, x: number): number {
  const maxIterations = 200, epsilon = 3e-14, tiny = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }
  return h;
}
function regularizedBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x));
  return x < (a + 1) / (a + b + 2)
    ? front * betaFraction(a, b, x) / a
    : 1 - front * betaFraction(b, a, 1 - x) / b;
}
const twoSidedTPValue = (t: number, degreesOfFreedom: number) => regularizedBeta(degreesOfFreedom / (degreesOfFreedom + t * t), degreesOfFreedom / 2, 0.5);
const numericFields = (d: Dataset) => d.columns.filter((c) => c.type === 'number').map((c) => c.name);

function Workspace() {
  const user = useSessionUser();
  useEffect(() => {
    document.title = 'IFRS Lab workspace';
  }, []);

  const [saved, setSaved] = useState<Saved>(() => {
    try { const value = localStorage.getItem('statlab-workspace-v1'); if (value) return JSON.parse(value) as Saved; } catch { /* recover with demo */ }
    return { dataset: demo, results: [], messages: [] };
  });
  const { dataset, results, messages } = saved;
  const [activeTab, setActiveTab] = useState<'data' | 'results'>('data');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('ifrs-lab-sidebar-collapsed') === 'true'; }
    catch { return false; }
  });
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<string[]>(['Explore', 'Compare']);
  const [numericField, setNumericField] = useState(numericFields(dataset)[0] || '');
  const [groupField, setGroupField] = useState(dataset.columns.find((c) => c.type === 'category')?.name || dataset.columns.find((c) => c.type !== 'number')?.name || '');
  const [outcomeField, setOutcomeField] = useState(numericFields(dataset)[1] || numericFields(dataset)[0] || '');
  const [filterField, setFilterField] = useState(dataset.columns[1]?.name || '');
  const [filterOp, setFilterOp] = useState('equals');
  const [filterValue, setFilterValue] = useState('');
  const [appliedFilter, setAppliedFilter] = useState<{ field: string; op: string; value: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [projectStore, setProjectStore] = useState<ProjectStore>(readProjectStore);
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [projectStandardInput, setProjectStandardInput] = useState<ProjectStandard | ''>('');
  const [pendingImport, setPendingImport] = useState<{ dataset: Dataset; targets: string[]; size: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const cancelPendingImport = () => {
    setPendingImport(null);
    setError('');
  };

  useEffect(() => {
    if (!projectManagerOpen && !pendingImport) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (pendingImport) cancelPendingImport();
      else setProjectManagerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectManagerOpen, pendingImport]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('newProject') === '1') setProjectManagerOpen(true);
  }, []);

  useEffect(() => {
    const selectedProject = projectStore.projects.find((project) => project.id === projectStore.activeProjectId);
    const selectedFile = selectedProject?.files.find((file) => file.id === projectStore.activeFileId) ?? selectedProject?.files[0];
    if (!selectedFile) return;
    setSaved({ dataset: selectedFile.dataset, results: [], messages: [] });
    if (projectStore.activeFileId !== selectedFile.id) setProjectStore((old) => ({ ...old, activeFileId: selectedFile.id }));
  }, []);

  useEffect(() => {
    try { localStorage.setItem('statlab-workspace-v1', JSON.stringify(saved)); }
    catch { setError('Browser storage is full. Export your current dataset before importing more data.'); }
  }, [saved]);
  useEffect(() => {
    try { localStorage.setItem('ifrs-lab-sidebar-collapsed', String(sidebarCollapsed)); }
    catch { /* sidebar preference is optional */ }
  }, [sidebarCollapsed]);
  useEffect(() => {
    try { localStorage.setItem('statlab-projects-v1', JSON.stringify(projectStore)); }
    catch { setError('Browser storage is full. Export or remove project files before importing more data.'); }
  }, [projectStore]);
  useEffect(() => { setNumericField((old) => numericFields(dataset).includes(old) ? old : numericFields(dataset)[0] || ''); setOutcomeField((old) => numericFields(dataset).includes(old) ? old : numericFields(dataset)[1] || numericFields(dataset)[0] || ''); setGroupField((old) => dataset.columns.some((c) => c.name === old && c.type !== 'number') ? old : dataset.columns.find((c) => c.type === 'category')?.name || dataset.columns.find((c) => c.type !== 'number')?.name || ''); setFilterField((old) => dataset.columns.some((c) => c.name === old) ? old : dataset.columns[0]?.name || ''); }, [dataset]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const visibleRows = useMemo(() => {
    if (!appliedFilter) return dataset.rows;
    const { field, op, value } = appliedFilter;
    return dataset.rows.filter((row) => {
      const actual = row[field];
      const a = typeof actual === 'number' ? actual : String(actual ?? '').toLowerCase();
      const b = typeof actual === 'number' ? Number(value) : value.toLowerCase();
      if (op === 'equals') return a === b;
      if (op === 'contains') return String(a).includes(String(b));
      if (op === 'greater') return typeof a === 'number' && a > Number(b);
      if (op === 'less') return typeof a === 'number' && a < Number(b);
      return actual === null || actual === '';
    });
  }, [dataset, appliedFilter]);
  const filteredCatalog = catalog.map((g) => ({ ...g, items: g.items.filter(([name, desc]) => `${name} ${desc}`.toLowerCase().includes(search.toLowerCase())) })).filter((g) => g.items.length);
  const result = (title: string, summary: string, values: Record<string, unknown> = {}, showResult = true) => {
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, summary, values, createdAt: new Date().toISOString() };
    setSaved((old) => ({ ...old, results: [entry, ...old.results] }));
    if (showResult) setActiveTab('results');
    return entry;
  };
  const runDescriptive = () => {
    if (!numericField) return;
    const data = nums(visibleRows, numericField).sort((a, b) => a - b);
    if (!data.length) { setError(`No numeric observations available in ${numericField}.`); return; }
    const quantile = (p: number) => data[Math.min(data.length - 1, Math.floor((data.length - 1) * p))];
    result(`Summary · ${numericField}`, `Descriptive statistics computed across ${data.length} observed values.`, { field: numericField, n: data.length, missing: visibleRows.length - data.length, mean: fmt(mean(data)), median: fmt((data[Math.floor((data.length - 1) / 2)] + data[Math.ceil((data.length - 1) / 2)]) / 2), sd: fmt(Math.sqrt(variance(data))), min: fmt(data[0]), q1: fmt(quantile(.25)), q3: fmt(quantile(.75)), max: fmt(data[data.length - 1]) });
    setError('');
  };
  const runHistogram = () => {
    const data = nums(visibleRows, numericField);
    if (!data.length) { setError('Choose a numeric field with observed values to build a histogram.'); return; }
    const low = Math.min(...data), high = Math.max(...data), binCount = Math.min(10, Math.max(4, Math.ceil(Math.sqrt(data.length))));
    const width = high === low ? 1 : (high - low) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({ from: low + i * width, to: i === binCount - 1 ? high : low + (i + 1) * width, count: 0 }));
    data.forEach((v) => bins[Math.min(binCount - 1, Math.floor((v - low) / width))].count++);
    result(`Histogram · ${numericField}`, `${data.length} observations grouped into ${binCount} equal-width bins.`, { field: numericField, bins });
    setError('');
  };
  const runTTest = () => {
    const groups = Array.from(new Set(visibleRows.map((r) => r[groupField]).filter((v) => v !== null && v !== undefined)));
    if (!groupField || !outcomeField || groups.length !== 2) { setError('A two-group t-test needs one grouping field with exactly two observed groups and a numeric outcome.'); return; }
    const a = nums(visibleRows.filter((r) => r[groupField] === groups[0]), outcomeField), b = nums(visibleRows.filter((r) => r[groupField] === groups[1]), outcomeField);
    if (a.length < 2 || b.length < 2) { setError('Each group needs at least two numeric observations for a t-test.'); return; }
    const av = variance(a), bv = variance(b), se = Math.sqrt(av / a.length + bv / b.length);
    if (se === 0) { setError('Both groups have zero variability, so the Welch test cannot estimate a standard error.'); return; }
    const t = (mean(a) - mean(b)) / se;
    const df = (av / a.length + bv / b.length) ** 2 / ((av / a.length) ** 2 / (a.length - 1) + (bv / b.length) ** 2 / (b.length - 1));
    const pValue = twoSidedTPValue(t, df);
    result(`Independent t-test · ${outcomeField}`, `Welch two-sample test comparing ${String(groups[0])} with ${String(groups[1])}.`, { groupingField: groupField, outcomeField, groupA: String(groups[0]), nA: a.length, meanA: fmt(mean(a)), sdA: fmt(Math.sqrt(av)), groupB: String(groups[1]), nB: b.length, meanB: fmt(mean(b)), sdB: fmt(Math.sqrt(bv)), meanDifference: fmt(mean(a) - mean(b)), t: fmt(t, 3), degreesOfFreedom: fmt(df, 1), twoSidedPValue: pValue < 0.0001 ? '< 0.0001' : fmt(pValue, 4), belowPoint05: pValue < 0.05, note: 'Two-sided Welch t-distribution p-value; interpret with the effect size, study design, and assumptions.' });
    setError('');
  };
  const applyFilter = () => {
    if (!filterField) return;
    const next = { field: filterField, op: filterOp, value: filterValue };
    setAppliedFilter(next);
    const rows = dataset.rows.filter((row) => {
      const actual = row[filterField], a = typeof actual === 'number' ? actual : String(actual ?? '').toLowerCase(), b = typeof actual === 'number' ? Number(filterValue) : filterValue.toLowerCase();
      if (filterOp === 'equals') return a === b;
      if (filterOp === 'contains') return String(a).includes(String(b));
      if (filterOp === 'greater') return typeof a === 'number' && a > Number(b);
      if (filterOp === 'less') return typeof a === 'number' && a < Number(b);
      return actual === null || actual === '';
    });
    result('Row filter', `${rows.length} of ${dataset.rows.length} rows match ${filterField} ${filterOp} ${filterValue || '(blank)'}.`, { field: filterField, operator: filterOp, value: filterValue, matchingRows: rows.length, totalRows: dataset.rows.length }, false);
  };
  const runNamed = (name: string) => {
    if (name === 'Descriptive summary') runDescriptive();
    else if (name === 'Histogram') runHistogram();
    else if (name === 'Independent t-test') runTTest();
    else if (name === 'Filter rows') applyFilter();
    else {
      setError(`${name} is listed in the catalog, but this workspace currently computes descriptive summaries, histograms, Welch two-group t-tests, and row filters.`);
      setSaved((old) => ({ ...old, messages: [...old.messages, { role:'assistant', text:`${name} is in the catalog. This workspace currently supports computed descriptive summaries, numeric histograms, Welch independent two-group t-tests, and row filters. I have not generated an unsupported result.` }] }));
    }
  };
  const submitAssistant = (text = prompt) => {
    const q = text.trim(); if (!q) return;
    setPrompt('');
    setSaved((old) => ({ ...old, messages: [...old.messages, { role:'user', text:q }] }));
    const lower = q.toLowerCase();
    window.setTimeout(() => {
      let reply: string;
      if (/describ|summary|summari[sz]e|mean|standard deviation/.test(lower)) { runDescriptive(); reply = `Computed a descriptive summary for ${numericField || 'the selected field'}. See the Results tab for the values.`; }
      else if (/histogram|distribution/.test(lower)) { runHistogram(); reply = `Built a histogram for ${numericField || 'the selected numeric field'}. See the Results tab to inspect its bins.`; }
      else if (/t.test|compare|difference|two.group|groups/.test(lower)) { runTTest(); reply = `Ran a Welch independent two-group t-test for ${outcomeField || 'the selected outcome'}, grouped by ${groupField || 'the selected category'}. See the Results tab.`; }
      else if (/filter|subset|only rows|rows where/.test(lower)) { applyFilter(); reply = 'Applied the configured row filter to the data preview and recorded the matching row count. Adjust the filter controls to change its criteria.'; }
      else { reply = 'I could not map that request to a supported local analysis. Try “summarize focus_score”, “show a histogram”, “compare groups”, or “filter rows”.'; }
      setSaved((old) => ({ ...old, messages: [...old.messages, { role:'assistant', text:reply }] }));
    }, 160);
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    if (!projectStore.activeProjectId) {
      setError('Start or select a project before importing a file.');
      setProjectManagerOpen(true);
      return;
    }
    setUploadBusy(true); setError('');
    try {
      let parsed: Dataset;
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error('This workbook does not contain a readable sheet.');
        const matrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '', raw: false });
        parsed = toDatasetFromMatrix(matrix, file.name);
      } else {
        const text = await file.text(), delimiter = /\.tsv$/i.test(file.name) ? '\t' : ',';
        parsed = toDataset(text, file.name, delimiter);
      }
      if (!parsed.rows.length || !parsed.columns.length) throw new Error('No rows or columns were found.');
      setPendingImport({ dataset: parsed, targets: parsed.columns.map((column) => column.name), size: file.size });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not read this file.'); }
    finally { setUploadBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };
  const createProject = () => {
    const name = projectNameInput.trim();
    if (!name || !projectStandardInput) return;
    const project: Project = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, standard: projectStandardInput, createdAt: new Date().toISOString(), workspaceId: projectStore.activeWorkspaceId, ownerId: user?.id ?? null, ownerName: user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Demo session', files: [] };
    setProjectStore((old) => ({ ...old, projects: [...old.projects, project], activeProjectId: project.id, activeFileId: null }));
    setProjectNameInput('');
    setProjectStandardInput('');
  };
  const selectProject = (project: Project) => {
    const file = project.files.find((item) => item.id === projectStore.activeFileId) ?? project.files[0];
    setProjectStore((old) => ({ ...old, activeProjectId: project.id, activeFileId: file?.id ?? null }));
    if (file) setSaved({ dataset: file.dataset, results: [], messages: [] });
    setAppliedFilter(null);
  };
  const openProjectFile = (project: Project, file: ProjectFile) => {
    setProjectStore((old) => ({ ...old, activeProjectId: project.id, activeFileId: file.id }));
    setSaved({ dataset: file.dataset, results: [], messages: [] });
    setAppliedFilter(null);
    setActiveTab('data');
    setProjectManagerOpen(false);
  };
  const confirmImport = () => {
    if (!pendingImport || !projectStore.activeProjectId) return;
    const targets = pendingImport.targets.map((target) => target.trim());
    if (targets.some((target) => !target) || new Set(targets.map((target) => target.toLowerCase())).size !== targets.length) {
      setError('Each mapped field needs a unique, non-empty name.');
      return;
    }
    const sourceDataset = pendingImport.dataset;
    const mappedDataset: Dataset = {
      ...sourceDataset,
      columns: sourceDataset.columns.map((column, index) => ({ ...column, name: targets[index] })),
      rows: sourceDataset.rows.map((row) => Object.fromEntries(sourceDataset.columns.map((column, index) => [targets[index], row[column.name]]))),
    };
    const project = projectStore.projects.find((item) => item.id === projectStore.activeProjectId);
    if (!project) { setError('Select a project before importing a file.'); return; }
    const file: ProjectFile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: sourceDataset.name,
      importedAt: new Date().toISOString(),
      dataset: mappedDataset,
      mappings: sourceDataset.columns.map((column, index) => ({ source: `${columnLetter(index)} · ${column.name}`, target: targets[index] })),
    };
    setProjectStore((old) => ({
      ...old,
      activeFileId: file.id,
      projects: old.projects.map((item) => item.id === project.id ? { ...item, files: [...item.files, file] } : item),
    }));
    setSaved({ dataset: mappedDataset, results: [], messages: [] });
    setAppliedFilter(null); setActiveTab('data'); setPendingImport(null); setError('');
  };
  const exportCsv = () => {
    const escaped = (v: unknown) => { const s = v === null || v === undefined ? '' : String(v); return /[",\r\n\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const body = [dataset.columns.map((c) => escaped(c.name)).join(','), ...dataset.rows.map((r) => dataset.columns.map((c) => escaped(r[c.name])).join(','))].join('\r\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([body], { type:'text/csv;charset=utf-8' })); link.download = `${dataset.name.replace(/[^a-z0-9-_]+/gi, '-')}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  const reset = () => { setSaved({ dataset:demo, results:[], messages:[] }); setAppliedFilter(null); setError(''); setActiveTab('data'); };
  const workspaceProjects = projectStore.projects.filter((project) => project.workspaceId === projectStore.activeWorkspaceId);
  const activeProject = workspaceProjects.find((project) => project.id === projectStore.activeProjectId);

  return <div className="app-shell flex">
    <aside className={`sidebar hidden shrink-0 flex-col min-h-[100dvh] py-5 transition-all duration-200 md:flex ${sidebarCollapsed ? 'md:w-[76px] px-2' : 'md:w-[236px] px-4'}`}>
      <div className={`flex items-center pb-8 ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#4fa889] text-[#152a25]"><Activity size={20}/></div>
        {!sidebarCollapsed && <div><div className="display text-[19px] font-extrabold tracking-tight">IFRS Lab</div><div className="text-[10px] uppercase tracking-[.18em] text-[#aab9b5]">Research workspace</div></div>}
      </div>
      {!sidebarCollapsed && <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#99aaa8]">Workspace</div>}
      {!sidebarCollapsed && <select aria-label="Select workspace" value={projectStore.activeWorkspaceId} onChange={(event) => {
        const nextWorkspaceId = event.target.value;
        setProjectStore((old) => {
          const nextProject = old.projects.find((project) => project.workspaceId === nextWorkspaceId);
          return { ...old, activeWorkspaceId: nextWorkspaceId, activeProjectId: nextProject?.id ?? null, activeFileId: null };
        });
      }} className="mb-3 w-full rounded-lg border border-[#465863] bg-[#263742] px-3 py-2 text-xs font-semibold text-[#e0e9e4]">
        {projectStore.workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}{workspace.isDefault ? ' · Default' : ''}</option>)}
      </select>}
      <button title="Projects & files" aria-label="Projects and files" onClick={() => setProjectManagerOpen(true)} className={`mb-3 flex items-center rounded-lg border border-[#465863] py-2.5 text-xs font-semibold text-[#e0e9e4] hover:bg-[#293a45] ${sidebarCollapsed ? 'justify-center px-0' : 'gap-2 px-3 text-left'}`}><FolderPlus size={15}/>{!sidebarCollapsed && 'Projects & files'}</button>
      {!sidebarCollapsed && activeProject && <div className="mb-4 rounded-lg bg-[#293a45] p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white"><FolderOpen size={14} className="text-[#76c2a3]"/><span className="truncate">{activeProject.name}</span></div>
        <div className="mt-1 pl-6 text-[9px] text-[#aab9b5]">{projectStandardLabels[activeProject.standard]}</div>
        <div className="mt-3 space-y-1">
          {activeProject.files.map((file) => <button key={file.id} onClick={() => openProjectFile(activeProject, file)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[10px] ${projectStore.activeFileId === file.id ? 'bg-[#3b505b] text-white' : 'text-[#b8c6c0] hover:bg-[#344652]'}`}><FileSpreadsheet size={12}/><span className="truncate">{file.name}</span></button>)}
          {!activeProject.files.length && <p className="px-2 text-[10px] text-[#aab9b5]">No files yet. Import one to begin.</p>}
        </div>
      </div>}
      <button title="Data & explore" aria-label="Data and explore" data-testid="nav-data" onClick={() => setActiveTab('data')} className={`flex items-center rounded-lg py-2.5 text-sm transition ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${activeTab === 'data' ? 'bg-[#344652] text-white' : 'text-[#c3cfca] hover:bg-[#293a45]'}`}><Table2 size={17}/>{!sidebarCollapsed && 'Data & explore'}</button>
      <button title="Results" aria-label={`Results, ${results.length}`} data-testid="nav-results" onClick={() => setActiveTab('results')} className={`mt-1 flex items-center rounded-lg py-2.5 text-sm transition ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'} ${activeTab === 'results' ? 'bg-[#344652] text-white' : 'text-[#c3cfca] hover:bg-[#293a45]'}`}><span className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}><BarChart3 size={17}/>{!sidebarCollapsed && 'Results'}</span>{!sidebarCollapsed && <span className="mono text-[10px] text-[#9eafaa]">{results.length}</span>}</button>
      {!sidebarCollapsed && <div className="mx-2 mt-8 border-t border-[#384751] pt-5">
        <div className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#99aaa8]">Current dataset</div>
        <div className="flex items-start gap-2 rounded-lg bg-[#293a45] p-3"><Database size={15} className="mt-0.5 shrink-0 text-[#76c2a3]"/><div className="min-w-0"><div className="truncate text-xs font-semibold">{dataset.name}</div><div className="mt-1 text-[10px] text-[#aab9b5]">{dataset.rows.length} rows · {dataset.columns.length} fields</div></div></div>
        <button data-testid="button-reset-demo" onClick={reset} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#b4c1bc] hover:bg-[#293a45]"><Activity size={14}/> Reset to demo</button>
      </div>}
        <div className={`mt-auto rounded-xl border border-[#394a53] bg-[#263742] ${sidebarCollapsed ? 'mx-auto p-2' : 'p-3.5'}`} title={sidebarCollapsed ? 'Your data stays in this browser' : undefined}>
        <div className={`flex items-center text-xs font-semibold text-[#dce9e1] ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}><Sparkles size={14} className="text-[#78c3a5]"/>{!sidebarCollapsed && 'Local by design'}</div>
        {!sidebarCollapsed && <p className="mt-2 text-[11px] leading-relaxed text-[#aab9b5]">Your data stays in this browser. Nothing is uploaded to a server.</p>}
      </div>
    </aside>
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 border-b border-[#e3dfd5] bg-[#f6f4ee]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button data-testid="button-toggle-sidebar" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} className="hidden h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#d6d2c8] bg-[#fbfaf6] text-[#34434a] hover:border-[#83a997] md:grid" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed}>
              {sidebarCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
            </button>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#202d39] text-[#e8efe7] md:hidden"><Activity size={17}/></div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#7e827c]">
              <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
              <span>/</span>
              <Link href="/workspace" className="hover:text-[#147b69] hover:underline">Workspace</Link>
              <span>/</span>
              <span className="font-semibold text-[#313d43]">{activeTab === 'data' ? 'Data & Explore' : 'Results'}</span>
            </div>
            <div className="md:hidden truncate text-sm font-semibold">{activeTab === 'data' ? 'Data & explore' : 'Results'}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-[#d8e2d9] bg-[#edf3ea] px-2.5 py-1 text-[10px] font-semibold text-[#36745e] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#4a9a77]"/> Browser session</span>
             <Link href="/ifrs" title="Open IFRS Lab" aria-label="Open IFRS Lab" className="flex items-center gap-2 rounded-lg border border-[#d6d2c8] bg-[#fbfaf6] px-3 py-2 text-xs font-semibold text-[#34434a] hover:border-[#83a997]"><FlaskConical size={14}/><span className="hidden sm:inline">IFRS Lab</span></Link>
            <button onClick={() => setProjectManagerOpen(true)} className="flex items-center gap-2 rounded-lg border border-[#d6d2c8] bg-[#fbfaf6] px-3 py-2 text-xs font-semibold text-[#34434a] hover:border-[#83a997]"><FolderOpen size={14}/><span className="hidden sm:inline">Projects</span></button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.xlsx,.xls,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" data-testid="input-file" onChange={(e) => void importFile(e.target.files?.[0])}/>
            <button data-testid="button-import" onClick={() => activeProject ? fileRef.current?.click() : setProjectManagerOpen(true)} disabled={uploadBusy} className="flex items-center gap-2 rounded-lg border border-[#d6d2c8] bg-[#fbfaf6] px-3 py-2 text-xs font-semibold text-[#34434a] hover:border-[#83a997] disabled:opacity-60"><Upload size={14}/><span className="hidden sm:inline">{uploadBusy ? 'Reading…' : 'Import data'}</span></button>
            <button data-testid="button-export" onClick={exportCsv} className="flex items-center gap-2 rounded-lg bg-[#2f785d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#27684f]"><ArrowDownToLine size={14}/><span className="hidden sm:inline">Export CSV</span></button>
            <Link href={user ? "/account" : "/sign-in"} title={user ? "Your account" : "Sign in"} aria-label={user ? "Your account" : "Sign in"} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d6d2c8] bg-[#fbfaf6] text-[#34434a]"><UserRound size={16}/></Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="appear">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#43866c]"><span className="h-px w-5 bg-[#43866c]"/> A clearer path from data to evidence</div>
            <h1 className="display text-[30px] font-extrabold leading-tight tracking-[-.04em] text-[#263741] md:text-[38px]">Good questions deserve<br className="hidden sm:block"/> careful answers.</h1>
            <p className="mt-2 max-w-xl text-sm text-[#737a77]">Inspect your dataset, choose a method, and keep every result close to the data that produced it.</p>
          </div>
          <div className="flex gap-2">
            <div className="stat-card flex min-w-[120px] items-center gap-3 px-4 py-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7f0e8] text-[#37765c]"><Layers3 size={16}/></div><div><div className="mono text-lg font-medium text-[#293c43]">{dataset.rows.length}</div><div className="text-[10px] text-[#7d827c]">observations</div></div></div>
            <div className="stat-card flex min-w-[120px] items-center gap-3 px-4 py-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#faeade] text-[#b66442]"><Database size={16}/></div><div><div className="mono text-lg font-medium text-[#293c43]">{dataset.columns.length}</div><div className="text-[10px] text-[#7d827c]">fields</div></div></div>
          </div>
        </div>

        {error && <div data-testid="status-error" role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-[#e7b8ad] bg-[#fff0ec] px-4 py-3 text-sm text-[#8c4036]"><span>{error}</span><button data-testid="button-dismiss-error" onClick={() => setError('')} aria-label="Dismiss error"><X size={16}/></button></div>}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            {activeTab === 'data' ? <>
              <section className="stat-card overflow-hidden appear">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e2d9] px-5 py-4">
                  <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9f0e9] text-[#39765d]"><FileSpreadsheet size={17}/></div><div><h2 className="text-sm font-bold text-[#304149]">Dataset preview</h2><p className="text-[11px] text-[#7f847e]">{dataset.name} <span className="px-1">·</span> {appliedFilter ? `${visibleRows.length} filtered rows` : 'All rows'}</p></div></div>
                  <div className="flex gap-1 rounded-lg bg-[#efede6] p-1">
                    <button data-testid="tab-data" onClick={() => setActiveTab('data')} className="rounded-md bg-[#fbfaf6] px-3 py-1.5 text-[11px] font-semibold text-[#2f785d] shadow-sm">Data</button>
                    <button data-testid="tab-results" onClick={() => setActiveTab('results')} className="rounded-md px-3 py-1.5 text-[11px] text-[#737b77] hover:text-[#2f785d]">Results {results.length > 0 && `(${results.length})`}</button>
                  </div>
                </div>
                <div className="fine-grid border-b border-[#e8e4db] px-5 py-3">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {dataset.columns.map((c, i) => <div key={c.name} data-testid={`field-chip-${i}`} className="flex shrink-0 items-center gap-2 rounded-md border border-[#dfddd3] bg-[#fbfaf6]/95 px-2.5 py-1.5"><span className={`h-1.5 w-1.5 rounded-full ${c.type === 'number' ? 'bg-[#478c6b]' : 'bg-[#d1875f]'}`}/><span className="mono text-[10px] text-[#4c595b]">{c.name}</span><span className="text-[9px] uppercase text-[#9b9c92]">{c.type === 'number' ? '123' : 'abc'}</span></div>)}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {visibleRows.length ? <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead><tr className="bg-[#f5f3ed]">{dataset.columns.map((c) => <th key={c.name} className="border-b border-[#e6e2d9] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#858981]">{c.name}</th>)}</tr></thead>
                    <tbody>{visibleRows.slice(0, 12).map((row, ri) => <tr data-testid={`row-dataset-${ri}`} key={ri} className="border-b border-[#efede6] last:border-0 hover:bg-[#f6f8f3]">{dataset.columns.map((c) => <td data-testid={`cell-${ri}-${c.name}`} key={c.name} className={`px-4 py-2.5 text-xs ${c.type === 'number' ? 'mono text-[#455852]' : 'text-[#3e4c50]'}`}>{row[c.name] === null ? <span className="text-[#b4b2aa]">Missing</span> : String(row[c.name])}</td>)}</tr>)}</tbody>
                  </table> : <div data-testid="empty-filter" className="p-10 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#f1eee6] text-[#7c867e]"><Filter size={18}/></div><p className="mt-3 text-sm font-semibold text-[#3f4b4c]">No rows match this filter</p><button data-testid="button-clear-filter" onClick={() => setAppliedFilter(null)} className="mt-2 text-xs font-semibold text-[#39765d] underline underline-offset-2">Clear filter</button></div>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e4db] px-5 py-3 text-[10px] text-[#858981]"><span>Showing {Math.min(12, visibleRows.length)} of {visibleRows.length} rows</span>{appliedFilter && <button data-testid="button-remove-filter" onClick={() => setAppliedFilter(null)} className="flex items-center gap-1 text-[#39765d]"><X size={12}/> Remove filter</button>}</div>
              </section>

              <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="stat-card p-5">
                  <div className="mb-4 flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#b56b4a]"><BarChart3 size={14}/> Quick analysis</div><h2 className="mt-1 text-base font-bold text-[#304149]">Start with the shape</h2></div><span className="rounded-full bg-[#f7e9df] px-2 py-1 text-[9px] font-semibold text-[#a96140]">01 / EXPLORE</span></div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#697370]" htmlFor="numeric-field">Numeric field</label>
                  <select id="numeric-field" data-testid="select-numeric-field" value={numericField} onChange={(e) => setNumericField(e.target.value)} className="w-full rounded-lg border border-[#ddd9cf] bg-[#f9f8f3] px-3 py-2.5 text-xs text-[#334448]">{numericFields(dataset).map((f) => <option key={f} value={f}>{f}</option>)}</select>
                  {!numericFields(dataset).length && <p className="mt-2 text-xs text-[#9a6352]">Import a dataset with numeric fields to run these analyses.</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button data-testid="button-descriptive" onClick={runDescriptive} disabled={!numericField} className="flex items-center justify-center gap-2 rounded-lg bg-[#2f785d] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#286b52] disabled:opacity-50"><Activity size={14}/> Describe</button>
                    <button data-testid="button-histogram" onClick={runHistogram} disabled={!numericField} className="flex items-center justify-center gap-2 rounded-lg border border-[#d8d7cd] bg-[#fbfaf6] px-3 py-2.5 text-xs font-semibold text-[#40524f] hover:border-[#84a894] disabled:opacity-50"><BarChart3 size={14}/> Histogram</button>
                  </div>
                </div>
                <div className="stat-card p-5">
                  <div className="mb-4 flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#39765d]"><FlaskConical size={14}/> Compare</div><h2 className="mt-1 text-base font-bold text-[#304149]">Two-group t-test</h2></div><span className="rounded-full bg-[#e7f0e8] px-2 py-1 text-[9px] font-semibold text-[#39765d]">02 / TEST</span></div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#697370]" htmlFor="group-field">Group by</label>
                  <select id="group-field" data-testid="select-group-field" value={groupField} onChange={(e) => setGroupField(e.target.value)} className="mb-2 w-full rounded-lg border border-[#ddd9cf] bg-[#f9f8f3] px-3 py-2 text-xs text-[#334448]">{dataset.columns.filter((c) => c.type !== 'number').map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}</select>
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#697370]" htmlFor="outcome-field">Measure</label>
                  <div className="flex gap-2"><select id="outcome-field" data-testid="select-outcome-field" value={outcomeField} onChange={(e) => setOutcomeField(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#ddd9cf] bg-[#f9f8f3] px-3 py-2 text-xs text-[#334448]">{numericFields(dataset).map((f) => <option key={f} value={f}>{f}</option>)}</select><button data-testid="button-ttest" onClick={runTTest} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#202d39] px-3 py-2 text-xs font-semibold text-white hover:bg-[#344957]">Run test <ArrowRight size={13}/></button></div>
                </div>
              </section>
              <section className="stat-card p-5">
                <div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#8c7754]"><Filter size={14}/> Prepare</div><h2 className="mt-1 text-base font-bold text-[#304149]">Filter the preview</h2></div>{appliedFilter && <span className="rounded-full bg-[#e9f0e9] px-2.5 py-1 text-[10px] font-semibold text-[#39765d]">{visibleRows.length} matching</span>}</div>
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <select aria-label="Filter field" data-testid="select-filter-field" value={filterField} onChange={(e) => setFilterField(e.target.value)} className="rounded-lg border border-[#ddd9cf] bg-[#f9f8f3] px-3 py-2 text-xs text-[#334448]">{dataset.columns.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}</select>
                  <select aria-label="Filter operation" data-testid="select-filter-operator" value={filterOp} onChange={(e) => setFilterOp(e.target.value)} className="rounded-lg border border-[#ddd9cf] bg-[#f9f8f3] px-3 py-2 text-xs text-[#334448]"><option value="equals">equals</option><option value="contains">contains</option><option value="greater">greater than</option><option value="less">less than</option><option value="missing">is missing</option></select>
                  <input aria-label="Filter value" data-testid="input-filter-value" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder="Value…" className="rounded-lg border border-[#ddd9cf] bg-[#f9f8f3] px-3 py-2 text-xs text-[#334448] placeholder:text-[#aaa99f]"/>
                  <button data-testid="button-apply-filter" onClick={applyFilter} className="flex items-center justify-center gap-1.5 rounded-lg border border-[#d8d7cd] bg-[#fbfaf6] px-3 py-2 text-xs font-semibold text-[#40524f] hover:border-[#84a894]"><Filter size={13}/> Apply</button>
                </div>
              </section>
            </> : <section className="stat-card min-h-[420px] p-5 appear">
              <div className="mb-5 flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#39765d]"><BarChart3 size={14}/> Notebook</div><h2 className="mt-1 text-lg font-bold text-[#304149]">Analysis results</h2><p className="mt-1 text-xs text-[#80847e]">Computed locally from {dataset.name}</p></div><button data-testid="button-clear-results" disabled={!results.length} onClick={() => setSaved((old) => ({ ...old, results:[] }))} className="flex items-center gap-1.5 rounded-lg border border-[#dedbd1] px-3 py-2 text-xs text-[#68736f] hover:bg-[#f4f1e9] disabled:opacity-40"><Trash2 size={13}/> Clear all</button></div>
              {!results.length ? <div data-testid="empty-results" className="fine-grid rounded-xl border border-dashed border-[#d8d7cd] p-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0e9] text-[#39765d]"><BarChart3 size={20}/></div><h3 className="mt-4 text-sm font-bold text-[#40504f]">Your results will live here</h3><p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#82867f]">Run a summary, histogram, or t-test to create an auditable snapshot from the current dataset.</p><button data-testid="button-first-summary" onClick={() => { setActiveTab('data'); runDescriptive(); }} className="mt-4 rounded-lg bg-[#2f785d] px-3 py-2 text-xs font-semibold text-white">Run a summary</button></div> :
                <div className="space-y-3">{results.map((r) => <article data-testid={`result-card-${r.id}`} key={r.id} className="rounded-xl border border-[#e3e0d7] bg-[#f9f8f3] p-4">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-[#304149]">{r.title}</h3><p className="mt-1 text-xs text-[#777f79]">{r.summary}</p></div><span className="mono shrink-0 text-[9px] text-[#9a9a8f]">{new Date(r.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span></div>
                  {Array.isArray(r.values.bins) ? <div className="mt-5"><div className="flex h-32 items-end gap-1.5 border-b border-l border-[#d9d8ce] px-2">{(r.values.bins as {from:number;to:number;count:number}[]).map((b,i) => <div data-testid={`histogram-bin-${i}`} key={i} title={`${fmt(b.from)}–${fmt(b.to)}: ${b.count}`} className="group relative flex-1 rounded-t-sm bg-[#4c9474] transition hover:bg-[#d88b60]" style={{ height:`${Math.max(4, b.count / Math.max(...(r.values.bins as {count:number}[]).map((x) => x.count)) * 100)}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-[#59645f]">{b.count}</span></div>)}</div><div className="mt-2 flex justify-between text-[9px] text-[#898a81]"><span>{fmt((r.values.bins as {from:number}[])[0]?.from)}</span><span>{fmt((r.values.bins as {to:number}[]).at(-1)?.to ?? 0)}</span></div></div> :
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(r.values).filter(([k,v]) => k !== 'note' && typeof v !== 'object').map(([k,v]) => <div key={k} className="rounded-lg border border-[#e7e4da] bg-[#fffefa] px-3 py-2"><div className="text-[9px] uppercase tracking-[.1em] text-[#8a8d83]">{k.replace(/([A-Z])/g,' $1')}</div><div className="mono mt-1 truncate text-xs font-medium text-[#38554b]">{String(v)}</div></div>)}</div>}
                  {typeof r.values.note === 'string' && <p className="mt-3 rounded-md bg-[#f4efe4] p-2.5 text-[10px] leading-relaxed text-[#79694f]">{r.values.note}</p>}
                </article>)}</div>}
            </section>}
            <div className="flex items-center justify-between px-1 text-[10px] text-[#96978e]"><span>IFRS Lab runs in your browser. Results are descriptive, not a substitute for study design.</span><span className="mono hidden sm:inline">LOCAL · PRIVATE</span></div>
          </div>

          <aside className="stat-card overflow-hidden xl:sticky xl:top-[84px]">
            <div className="flex items-center gap-3 border-b border-[#e6e2d9] px-4 py-4"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f8eadd] text-[#b86d49]"><MessageSquareText size={17}/></div><div><h2 className="text-sm font-bold text-[#304149]">Analysis guide</h2><p className="text-[10px] text-[#83877f]">Ask for an operation, not a guess</p></div><CircleHelp size={15} className="ml-auto text-[#a0a093]"/></div>
            <div ref={chatRef} data-testid="assistant-conversation" className="flex max-h-[310px] min-h-[160px] flex-col gap-3 overflow-y-auto p-4">
              {!messages.length && <div data-testid="assistant-empty" className="rounded-lg bg-[#f3f1e9] p-3.5"><div className="flex items-center gap-2 text-xs font-semibold text-[#3f514e]"><Sparkles size={14} className="text-[#b96f4a]"/> A useful first question</div><p className="mt-2 text-xs leading-relaxed text-[#727a75]">I can run a summary, plot a histogram, compare two groups, or apply the filter you configured. All calculations use the data currently in this workspace.</p></div>}
              {messages.map((m,i) => <div data-testid={`chat-message-${i}`} key={i} className={`max-w-[93%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${m.role === 'user' ? 'self-end rounded-br-sm bg-[#2f785d] text-white' : 'self-start rounded-bl-sm border border-[#e5e1d7] bg-[#f7f5ef] text-[#56605c]'}`}><span className="mb-1 block text-[9px] font-bold uppercase tracking-[.1em] opacity-65">{m.role === 'user' ? 'You' : 'IFRS Lab'}</span>{m.text}</div>)}
            </div>
            <div className="border-t border-[#e6e2d9] p-4">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {[['Summarize this field','Describe'],['Show a histogram','Histogram'],['Compare the groups','T-test']].map(([label, op]) => <button key={op} data-testid={`suggestion-${op.toLowerCase()}`} onClick={() => submitAssistant(label)} className="rounded-full border border-[#ddd9ce] bg-[#f9f8f3] px-2.5 py-1.5 text-[10px] text-[#66716c] hover:border-[#8bad9a] hover:text-[#39765d]">{label}</button>)}
              </div>
              <form data-testid="assistant-form" onSubmit={(e) => { e.preventDefault(); submitAssistant(); }} className="flex items-end gap-2 rounded-xl border border-[#dcd9cf] bg-[#fffefa] p-2 focus-within:border-[#80a78f]">
                <textarea data-testid="input-assistant-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAssistant(); } }} rows={2} placeholder="What would you like to explore?" className="max-h-24 min-h-[42px] flex-1 resize-y bg-transparent px-1 py-1.5 text-xs text-[#344448] outline-none placeholder:text-[#aaa99f]"/>
                <button data-testid="button-send-prompt" type="submit" disabled={!prompt.trim()} aria-label="Send analysis prompt" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2f785d] text-white hover:bg-[#286b52] disabled:opacity-40"><ArrowRight size={15}/></button>
              </form>
              <p className="mt-2 text-center text-[9px] text-[#9b9a91]">Enter to send · calculations stay on this device</p>
            </div>
          </aside>
        </div>

        <section className="mt-7">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#b86d49]"><FlaskConical size={14}/> Method library</div><h2 className="mt-1 display text-xl font-extrabold tracking-tight text-[#2d3e44]">Find a method</h2><p className="mt-1 text-xs text-[#80847d]">A field guide to the tools in a research workflow.</p></div><div className="relative w-full sm:w-[240px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#95968c]"/><input data-testid="input-catalog-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search methods…" className="w-full rounded-lg border border-[#ddd9cf] bg-[#fbfaf6] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#80a78f]"/></div></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {filteredCatalog.map((group) => <section key={group.group} className="stat-card overflow-hidden">
              <button data-testid={`button-category-${group.group.toLowerCase()}`} aria-expanded={openGroups.includes(group.group) || Boolean(search)} onClick={() => setOpenGroups((old) => old.includes(group.group) ? old.filter((x) => x !== group.group) : [...old, group.group])} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f6f4ed]"><span className="flex items-center gap-2 text-xs font-bold text-[#3d4b4b]">{openGroups.includes(group.group) || search ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} {group.group}</span><span className="mono text-[9px] text-[#9b9b91]">{group.items.length.toString().padStart(2,'0')}</span></button>
              {(openGroups.includes(group.group) || Boolean(search)) && <div className="border-t border-[#e9e5dc] px-2 py-1.5">{group.items.map(([title,desc]) => {
                const supported = ['Descriptive summary','Histogram','Independent t-test','Filter rows'].includes(title);
                return <button key={title} data-testid={`catalog-method-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} onClick={() => runNamed(title)} className="group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-left hover:bg-[#f0f2ea]"><span><span className="block text-[11px] font-semibold text-[#455251] group-hover:text-[#286f54]">{title}</span><span className="mt-0.5 block text-[9px] leading-snug text-[#92948b]">{desc}</span></span><span className={`shrink-0 rounded-full px-1.5 py-1 text-[8px] font-bold ${supported ? 'bg-[#e5f0e7] text-[#438268]' : 'bg-[#f0eee8] text-[#9a998f]'}`}>{supported ? 'READY' : 'GUIDE'}</span></button>;
              })}</div>}
            </section>)}
            {!filteredCatalog.length && <div data-testid="catalog-empty" className="col-span-full rounded-xl border border-dashed border-[#d9d6cd] p-8 text-center text-xs text-[#777f79]">No methods match “{search}”. Try another search.</div>}
          </div>
        </section>
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#dfdcd2] py-4 text-[10px] text-[#92938a]"><span className="flex items-center gap-1.5"><Check size={12} className="text-[#438268]"/> Workspace saved locally</span><button data-testid="button-reset-footer" onClick={reset} className="flex items-center gap-1 hover:text-[#39765d]">Reset workspace <ChevronRight size={12}/></button></footer>
      </div>
    </main>
    {projectManagerOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#152733]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="projects-title" onClick={(event) => { if (event.target === event.currentTarget) setProjectManagerOpen(false); }}>
      <div className="stat-card max-h-[90dvh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#43866c]">IFRS Lab project directory</p><h2 id="projects-title" className="mt-1 text-xl font-bold text-[#304149]">Projects & files</h2><p className="mt-1 text-xs text-[#737a77]">Projects and imported files are saved in this browser.</p></div>
          <button onClick={() => setProjectManagerOpen(false)} aria-label="Close projects" className="rounded-lg p-2 text-[#63716d] hover:bg-[#f1eee6]"><X size={18}/></button>
        </div>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); createProject(); }}>
          <input value={projectNameInput} onChange={(event) => setProjectNameInput(event.target.value)} placeholder="New project name" aria-label="New project name" className="min-w-0 flex-1 rounded-lg border border-[#ddd9cf] bg-[#fbfaf6] px-3 py-2.5 text-sm"/>
          <select value={projectStandardInput} onChange={(event) => setProjectStandardInput(event.target.value as ProjectStandard | '')} aria-label="Project standard" required className="rounded-lg border border-[#ddd9cf] bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#394a4c]">
            <option value="" disabled>Select a project standard</option>
            <option value="ifrs16">{projectStandardLabels.ifrs16}</option>
            <option value="ifrs9">{projectStandardLabels.ifrs9}</option>
            <option value="ifrs17">{projectStandardLabels.ifrs17}</option>
            <option value="multiple">{projectStandardLabels.multiple}</option>
            <option value="general">{projectStandardLabels.general}</option>
          </select>
          <button type="submit" disabled={!projectNameInput.trim() || !projectStandardInput} className="flex items-center justify-center gap-2 rounded-lg bg-[#2f785d] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"><FolderPlus size={14}/> Start project</button>
        </form>
        <div className="mt-5 grid gap-4 md:grid-cols-[.85fr_1.15fr]">
          <section className="rounded-xl border border-[#e3e0d7] p-3">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#7a827c]">Projects</h3>
            {!workspaceProjects.length && <p className="p-2 text-xs text-[#80847e]">Create a project to start organizing files in this workspace.</p>}
            {workspaceProjects.map((project) => <button key={project.id} onClick={() => selectProject(project)} className={`mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs ${project.id === projectStore.activeProjectId ? 'bg-[#e7f0e8] font-semibold text-[#2f785d]' : 'hover:bg-[#f5f3ed]'}`}><span className="flex min-w-0 items-center gap-2"><FolderOpen size={14}/><span className="min-w-0 truncate">{project.name}<span className="mt-1 block truncate text-[9px] font-normal text-[#7b817b]">{projectStandardLabels[project.standard]}</span></span></span><span className="text-[10px] opacity-70">{project.files.length}</span></button>)}
          </section>
          <section className="rounded-xl border border-[#e3e0d7] p-3">
            <div className="mb-2 flex items-center justify-between gap-2"><h3 className="truncate text-[10px] font-bold uppercase tracking-[.12em] text-[#7a827c]">{activeProject?.name ?? 'Project files'}</h3>
              {activeProject && <button onClick={() => { setProjectManagerOpen(false); fileRef.current?.click(); }} className="flex shrink-0 items-center gap-1 rounded-md bg-[#2f785d] px-2.5 py-1.5 text-[10px] font-semibold text-white"><Upload size={12}/> Import file</button>}
            </div>
            {!activeProject && <p className="p-2 text-xs text-[#80847e]">Select or create a project to view its files.</p>}
            {activeProject && !activeProject.files.length && <p className="p-2 text-xs text-[#80847e]">This folder is empty. Import a CSV, TSV, or Excel file.</p>}
            {activeProject?.files.map((file) => <button key={file.id} title={file.mappings.map((mapping) => `${mapping.target} ← ${mapping.source}`).join(', ')} onClick={() => openProjectFile(activeProject, file)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left ${projectStore.activeFileId === file.id ? 'bg-[#e7f0e8]' : 'hover:bg-[#f5f3ed]'}`}><FileSpreadsheet size={15} className="shrink-0 text-[#43866c]"/><span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#394a4c]">{file.name}</span><span className="shrink-0 text-[9px] text-[#83877f]">{file.dataset.rows.length} rows</span></button>)}
          </section>
        </div>
      </div>
    </div>}
    {pendingImport && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#152733]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="mapping-title" onClick={(event) => { if (event.target === event.currentTarget) cancelPendingImport(); }}>
      <div className="stat-card max-h-[90dvh] w-full max-w-3xl overflow-y-auto p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#43866c]">Import to {activeProject?.name}</p><h2 id="mapping-title" className="mt-1 text-xl font-bold text-[#304149]">Map your columns</h2><p className="mt-1 text-xs text-[#737a77]">{pendingImport.dataset.name} · {pendingImport.dataset.rows.length} rows · edit field names to match your project.</p></div><button onClick={cancelPendingImport} aria-label="Cancel mapping" className="rounded-lg p-2 text-[#63716d] hover:bg-[#f1eee6]"><X size={18}/></button></div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#e3e0d7]">
          <table className="w-full min-w-[560px] text-left"><thead className="bg-[#f5f3ed] text-[10px] uppercase tracking-wide text-[#80847e]"><tr><th className="px-3 py-2">Excel column</th><th className="px-3 py-2">Source heading</th><th className="px-3 py-2">Map to project field</th><th className="px-3 py-2">Example value</th></tr></thead>
            <tbody>{pendingImport.dataset.columns.map((column, index) => <tr key={`${index}-${column.name}`} className="border-t border-[#eeece4]"><td className="px-3 py-2 text-xs font-semibold text-[#39765d]">{columnLetter(index)}</td><td className="px-3 py-2 text-xs text-[#43514f]">{column.name}</td><td className="px-3 py-2"><input value={pendingImport.targets[index]} onChange={(event) => setPendingImport((old) => old ? { ...old, targets: old.targets.map((target, i) => i === index ? event.target.value : target) } : old)} aria-label={`Map ${column.name}`} className="w-full rounded-md border border-[#ddd9cf] bg-[#fbfaf6] px-2.5 py-2 text-xs"/></td><td className="max-w-[160px] truncate px-3 py-2 text-xs text-[#737a77]">{String(pendingImport.dataset.rows[0]?.[column.name] ?? '—')}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-[#737a77]">Example: map Column A to <strong>principal</strong>. Your original file stays unchanged.</p>
        {error && <p role="alert" className="mt-3 text-xs text-[#9c483d]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2"><button onClick={cancelPendingImport} className="rounded-lg border border-[#d6d2c8] px-4 py-2 text-xs font-semibold text-[#4d5a57]">Cancel</button><button onClick={confirmImport} className="rounded-lg bg-[#2f785d] px-4 py-2 text-xs font-semibold text-white">Save to project</button></div>
      </div>
    </div>}
  </div>;
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const configuredClerkKey = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '');
const clerkEnabled = isPublishableKey(configuredClerkKey);
const clerkPubKey = clerkEnabled
  ? publishableKeyFromHost(window.location.hostname, configuredClerkKey)
  : '';
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#147b69', colorForeground: '#142a3d', colorMutedForeground: '#64748b',
    colorDanger: '#b42318', colorBackground: '#fffdfa', colorInput: '#fffdfa',
    colorInputForeground: '#142a3d', colorNeutral: '#142a3d',
    fontFamily: 'DM Sans, sans-serif', borderRadius: '6px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fffdfa] rounded-xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#142a3d] font-bold',
    headerSubtitle: 'text-[#64748b]',
    socialButtonsBlockButtonText: 'text-[#142a3d] font-semibold',
    formFieldLabel: 'text-[#142a3d] font-semibold',
    footerActionLink: 'text-[#147b69] font-semibold',
    footerActionText: 'text-[#64748b]',
    dividerText: 'text-[#64748b]',
    identityPreviewEditButton: 'text-[#147b69]',
    formFieldSuccessText: 'text-[#147b69]',
    alertText: 'text-[#142a3d]',
    logoBox: 'justify-center',
    logoImage: 'h-9 w-9',
    socialButtonsBlockButton: 'border-[#d6d2c8] bg-white',
    formButtonPrimary: 'bg-[#147b69] hover:bg-[#0f6556]',
    formFieldInput: 'border-[#d6d2c8] bg-white text-[#142a3d]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#e4e0d7]',
    alert: 'border-[#e4e0d7] bg-[#fffdfa]',
    otpCodeFieldInput: 'border-[#d6d2c8] text-[#142a3d]',
    formFieldRow: 'text-[#142a3d]',
    main: 'text-[#142a3d]',
  },
};

function HomeRedirect() {
  return <><Show when="signed-in"><Redirect to="/account"/></Show><Show when="signed-out"><IfrsMetrics/></Show></>;
}

function SignInPage() {
  const redirect = new URLSearchParams(window.location.search).get('returnTo') === '/checkout' ? `${basePath}/checkout` : undefined;
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef4f6] px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={redirect} signUpForceRedirectUrl={redirect}/></div>;
}

function SignUpPage() {
  const redirect = new URLSearchParams(window.location.search).get('returnTo') === '/checkout' ? `${basePath}/checkout` : undefined;
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef4f6] px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={redirect} signInForceRedirectUrl={redirect}/></div>;
}

function CheckoutReviewPage() {
  const { user, isLoaded } = useUser();
  const [paynowNotice, setPaynowNotice] = useState(false);
  const [draft, setDraft] = useState<CheckoutDraft | null>(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem('ifrs-lab-checkout') || 'null') as Partial<CheckoutDraft> | null;
      if (!value || (value.plan !== 'fortnight' && value.plan !== 'monthly')) return null;
      const cadence = (item: unknown): item is 'fortnight' | 'monthly' => item === 'fortnight' || item === 'monthly';
      return { plan: value.plan, lightSupport: cadence(value.lightSupport) ? value.lightSupport : null, dedicatedSupport: cadence(value.dedicatedSupport) ? value.dedicatedSupport : null };
    } catch { return null; }
  });
  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  if (!draft) return <main className="grid min-h-screen place-items-center bg-[#eef4f6] p-6"><div className="max-w-md rounded-xl bg-white p-7 text-center shadow-sm"><h1 className="text-2xl font-bold text-[#142a3d]">No checkout selection</h1><p className="mt-2 text-sm text-[#64748b]">Choose a plan and any support options before continuing.</p><Link href="/#pricing" className="mt-5 inline-flex rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white">Back to pricing</Link></div></main>;
  const fortnightTotal = (draft.plan === 'fortnight' ? 3.99 : 0)
    + (draft.lightSupport === 'fortnight' ? 80 : 0)
    + (draft.dedicatedSupport === 'fortnight' ? 180 : 0);
  const monthlyTotal = (draft.plan === 'monthly' ? 6.99 : 0)
    + (draft.lightSupport === 'monthly' ? 120 : 0)
    + (draft.dedicatedSupport === 'monthly' ? 300 : 0);
  const email = user?.primaryEmailAddress?.emailAddress;
  return <main className="min-h-screen bg-[#eef4f6] px-5 py-10 text-[#142a3d] sm:px-8">
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm font-semibold text-[#147b69]">← IFRS Lab</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-[#147b69]">Checkout · Step 1 of 2</p>
      <h1 className="mt-2 text-3xl font-bold">Review your selection</h1>
      <p className="mt-2 text-sm text-[#64748b]">Confirm the plan and support options before continuing. Nothing is active or charged yet.</p>
      <section className="mt-6 overflow-hidden rounded-xl border border-[#d2dfe3] bg-white">
        <div className="border-b border-[#e5ebed] p-5"><h2 className="font-bold">Subscription details</h2><p className="mt-1 text-sm text-[#64748b]">Includes all three planned reports: IFRS 16, IFRS 9, and IFRS 17.</p></div>
        <div className="divide-y divide-[#e5ebed]">
          <div className="flex justify-between gap-4 p-5"><div><strong>All-report subscription</strong><p className="mt-1 text-xs text-[#64748b]">Renews {draft.plan === 'fortnight' ? 'every fortnight' : 'monthly'}</p></div><strong>{money(draft.plan === 'fortnight' ? 3.99 : 6.99)} / {draft.plan === 'fortnight' ? 'fortnight' : 'month'}</strong></div>
          {draft.lightSupport && <div className="flex justify-between gap-4 p-5"><div><strong>Light support</strong><p className="mt-1 text-xs text-[#64748b]">Help with specific requested tasks · {draft.lightSupport === 'fortnight' ? 'per fortnight' : 'monthly'} · tax excluded</p></div><strong>{money(draft.lightSupport === 'fortnight' ? 80 : 120)} / {draft.lightSupport === 'fortnight' ? 'fortnight' : 'month'}</strong></div>}
          {draft.dedicatedSupport && <div className="flex justify-between gap-4 p-5"><div><strong>Dedicated technical support</strong><p className="mt-1 text-xs text-[#64748b]">Dedicated technical assistance · {draft.dedicatedSupport === 'fortnight' ? 'per fortnight' : 'monthly'} · tax excluded</p></div><strong>{money(draft.dedicatedSupport === 'fortnight' ? 180 : 300)} / {draft.dedicatedSupport === 'fortnight' ? 'fortnight' : 'month'}</strong></div>}
        </div>
        <div className="flex flex-wrap justify-end gap-x-8 gap-y-2 border-t border-[#d2dfe3] bg-[#f6f9f8] p-5 text-sm font-bold">
          {fortnightTotal > 0 && <span>Fortnightly total: {money(fortnightTotal)}</span>}
          {monthlyTotal > 0 && <span>Monthly total: {money(monthlyTotal)}</span>}
        </div>
      </section>
      <section className="mt-6 rounded-xl border border-[#d2dfe3] bg-white p-5">
        <h2 className="font-bold">Your account</h2>
        {!isLoaded ? <p className="mt-2 text-sm text-[#64748b]">Checking account…</p> : user ? <p className="mt-2 text-sm text-[#64748b]">Signed in as <strong className="text-[#142a3d]">{email || user.fullName}</strong>.</p> : <>
          <p className="mt-2 text-sm text-[#64748b]">Sign in with your email and password or create an account to continue.</p>
          <div className="mt-4 flex flex-wrap gap-3"><Link href="/sign-in?returnTo=%2Fcheckout" className="rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white">Sign in</Link><Link href="/sign-up?returnTo=%2Fcheckout" className="rounded-md border border-[#c8d6da] px-4 py-2 text-sm font-semibold text-[#142a3d]">Create account</Link></div>
        </>}
      </section>
      <section className="mt-6 rounded-xl border border-[#d2dfe3] bg-white p-5">
        <h2 className="font-bold">Payment method</h2>
        <button
          type="button"
          onClick={() => setPaynowNotice(true)}
          aria-describedby="paynow-setup-note"
          className="mt-4 rounded-md bg-[#147b69] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f6658] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b69]"
        >
          Pay with Paynow <span className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Setup required</span>
        </button>
        <p id="paynow-setup-note" className="mt-3 text-xs leading-relaxed text-[#64748b]">
          Paynow is not connected yet. This button does not take payment or activate a subscription.
        </p>
        {paynowNotice && <p role="status" className="mt-2 text-sm font-medium text-[#8a5a12]">Paynow setup is required before you can pay. No payment was processed.</p>}
      </section>
      <p className="mt-4 text-xs leading-relaxed text-[#64748b]">Support prices exclude tax. This page only reviews your selection; payment and subscription activation happen later.</p>
    </div>
  </main>;
}

function WorkspaceHome() {
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
  return <main className="min-h-screen bg-[#f5f4ed] text-[#263741]">
    {!user && <div className="flex flex-wrap items-center justify-center gap-3 bg-[#f7e5b1] px-4 py-3 text-center text-xs text-[#574526]"><strong>Demo workspace</strong><span>Sample data and projects are saved only in this browser.</span></div>}
    <header className="border-b border-[#e2dfd5] bg-[#fbfaf6]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div>
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-[#737a77]">
            <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
            <span>/</span><span className="font-semibold text-[#34434a]">Workspace Lab</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#43866c]">IFRS Lab</p>
          <h1 className="mt-1 text-2xl font-bold">Workspace Lab</h1>
          <p className="mt-1 text-sm text-[#737a77]">Your projects, files, and recent activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/workspace/app" className="rounded-lg bg-[#2f785d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#27684f]">Open data workspace</Link>
          <Link href={user ? '/account' : '/sign-in'} aria-label={user ? 'Your account' : 'Sign in'} className="grid h-10 w-10 place-items-center rounded-full border border-[#d6d2c8] bg-white text-[#34434a]"><UserRound size={17}/></Link>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-7">
      <section className="rounded-2xl border border-[#e2dfd5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label htmlFor="workspace-picker" className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em] text-[#7a827c]">Current workspace</label>
            <div className="flex flex-wrap items-center gap-2">
              <select id="workspace-picker" value={activeWorkspace.id} onChange={(event) => chooseWorkspace(event.target.value)} className="min-w-[220px] rounded-lg border border-[#d9d7cf] bg-[#fbfaf6] px-3 py-2.5 text-sm font-semibold">
                {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}{workspace.isDefault ? ' · Default' : ''}</option>)}
              </select>
              {activeWorkspace.isDefault && <span className="rounded-full bg-[#eaf2ee] px-2.5 py-1 text-[10px] font-semibold text-[#36745e]">Default workspace</span>}
            </div>
          </div>
          <button onClick={() => setShowCreateWorkspace((value) => !value)} className="flex items-center gap-2 rounded-lg border border-[#cbd9d1] px-3.5 py-2.5 text-sm font-semibold text-[#286f54] hover:bg-[#f2f7f2]"><FolderPlus size={16}/> New workspace</button>
        </div>
        {showCreateWorkspace && <form onSubmit={createWorkspace} className="mt-4 flex flex-wrap gap-2 rounded-xl bg-[#f6f7f1] p-3">
          <input autoFocus value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} aria-label="Workspace name" placeholder="e.g. Client reporting" className="min-w-[220px] flex-1 rounded-lg border border-[#d9d7cf] bg-white px-3 py-2 text-sm"/>
          <button disabled={!workspaceName.trim()} className="rounded-lg bg-[#2f785d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create workspace</button>
          <button type="button" onClick={() => setShowCreateWorkspace(false)} className="rounded-lg px-3 py-2 text-sm text-[#63716d]">Cancel</button>
        </form>}
      </section>
      {error && <p role="alert" className="mt-3 text-sm text-[#a33d35]">{error}</p>}
      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-bold">Recent projects</h2><p className="mt-1 text-sm text-[#737a77]">{projects.length} {projects.length === 1 ? 'project' : 'projects'} in {activeWorkspace.name}</p></div>
          <Link href="/workspace/app?newProject=1" className="flex items-center gap-2 rounded-lg border border-[#d6d2c8] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#34434a] hover:border-[#83a997]"><FolderPlus size={16}/> Start a project</Link>
        </div>
        {!projects.length && <div className="rounded-2xl border border-dashed border-[#d2d9d1] bg-white p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#eaf2ee] text-[#43866c]"><FolderOpen size={22}/></div>
          <h3 className="mt-4 font-semibold">No projects here yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#737a77]">Start a project to choose its IFRS standard, then keep its imported files and work together here.</p>
          <Link href="/workspace/app?newProject=1" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2f785d] px-4 py-2.5 text-sm font-semibold text-white"><FolderPlus size={16}/> Create your first project</Link>
        </div>}
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => <article key={project.id} className="rounded-2xl border border-[#e2dfd5] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#43866c]">{projectStandardLabels[project.standard]}</p><h3 className="mt-1 truncate text-lg font-bold">{project.name}</h3></div>
              <span className="shrink-0 rounded-full bg-[#f2f1eb] px-2.5 py-1 text-[10px] font-semibold text-[#66716d]">{project.files.length} {project.files.length === 1 ? 'file' : 'files'}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#737a77]">
              <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>By {project.ownerName || 'You'}</span>
              <span>Updated {new Date(latestProjectActivity(project)).toLocaleDateString()}</span>
            </div>
            {project.files.length > 0 && <div className="mt-4 border-t border-[#efede6] pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#7a827c]">Recent files</p>
              {project.files.slice(-2).reverse().map((file) => <div key={file.id} className="flex items-center gap-2 py-1 text-xs text-[#56605c]"><FileSpreadsheet size={14} className="text-[#43866c]"/><span className="truncate">{file.name}</span></div>)}
            </div>}
            <button onClick={() => openProject(project)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#286f54] hover:underline">Open project <ArrowRight size={15}/></button>
          </article>)}
        </div>
      </section>
      <p className="mt-8 text-center text-[11px] text-[#92938a]">Workspaces and project files are currently stored in this browser.</p>
    </div>
  </main>;
}

function latestProjectActivity(project: Project) {
  return project.files.reduce((latest, file) => file.importedAt > latest ? file.importedAt : latest, project.createdAt);
}

function WorkspaceEntry() {
  return <WorkspaceHome/>;
}

function AccountProjectsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [projects, setProjects] = useState<Project[]>([]);
  const [billingHistoryOpen, setBillingHistoryOpen] = useState(false);
  useEffect(() => {
    if (!user) return;
    try {
      const parsed = JSON.parse(localStorage.getItem('statlab-projects-v1') || '{}') as Partial<ProjectStore>;
      setProjects(Array.isArray(parsed.projects) ? parsed.projects.filter((project) => project.ownerId === user.id) : []);
    } catch { setProjects([]); }
  }, [user?.id]);
  useEffect(() => {
    if (!billingHistoryOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBillingHistoryOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [billingHistoryOpen]);
  if (!isLoaded) return <main className="grid min-h-screen place-items-center text-sm text-[#64748b]">Loading your account…</main>;
  const owner = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Your account';
  const accountEmail = user?.primaryEmailAddress?.emailAddress || 'No email on this account';
  return <main className="min-h-screen bg-[#eef4f6] px-5 py-8 text-[#142a3d] sm:px-10">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d2dfe3] pb-5">
        <div>
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-[#737a77]">
            <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
            <span>/</span><span className="font-semibold text-[#34434a]">Account</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#147b69]">IFRS Lab account</p><h1 className="mt-2 text-3xl font-bold">Your account</h1><p className="mt-1 text-sm text-[#64748b]">Signed in as {owner}</p>
        </div>
        <div className="flex gap-2"><Link href="/workspace/app" className="rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white">Open workspace</Link><button onClick={() => void signOut({ redirectUrl: basePath || '/' })} className="rounded-md border border-[#c8d6da] px-4 py-2 text-sm font-semibold">Sign out</button></div>
      </header>
      <section className="mt-6 grid gap-4 md:grid-cols-2" aria-label="Account settings">
        <article className="rounded-xl border border-[#d2dfe3] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#147b69]">Profile</p>
          <h2 className="mt-1 text-lg font-bold">Account details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-[#e8edef] pt-3"><dt className="text-[#64748b]">Name</dt><dd className="font-semibold">{owner}</dd></div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-[#e8edef] pt-3"><dt className="text-[#64748b]">Work / notification email</dt><dd className="font-semibold break-all">{accountEmail}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-[#64748b]">Your account email is the current contact address for this account.</p>
        </article>
        <article className="rounded-xl border border-[#d2dfe3] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#147b69]">Subscription</p>
          <h2 className="mt-1 text-lg font-bold">Plan management</h2>
          <p className="mt-3 rounded-lg bg-[#f4f7f6] p-3 text-sm font-semibold text-[#34434a]">No active subscription</p>
          <p className="mt-2 text-xs leading-relaxed text-[#64748b]">Payments are not connected yet, so there is no subscription to cancel. Subscription controls will appear here when billing is active.</p>
        </article>
      </section>
      <section className="mt-4 rounded-xl border border-[#d2dfe3] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#147b69]">Billing</p><h2 className="mt-1 text-lg font-bold">Billing history</h2><p className="mt-1 text-xs text-[#64748b]">No real charges yet; the list contains a clearly labeled sample statement.</p></div>
          <button type="button" onClick={() => setBillingHistoryOpen(true)} className="rounded-md border border-[#c8d6da] bg-[#fbfaf6] px-4 py-2 text-sm font-semibold text-[#34434a] hover:border-[#83a997]">View billing history</button>
        </div>
      </section>
      <p className="mt-5 text-xs text-[#64748b]">Project history is currently saved in this browser. Dates are shown in your local time.</p>
      <section className="mt-6 space-y-3">
        {projects.length === 0 && <div className="rounded-xl border border-[#d2dfe3] bg-white p-6"><h2 className="font-semibold">No account projects yet</h2><p className="mt-2 text-sm text-[#64748b]">Start a project in the workspace while signed in. It will appear here with its standard and timeline.</p><Link href="/workspace/app" className="mt-4 inline-block rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white">Start a project</Link></div>}
        {projects.slice().sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map((project) => {
          const events = [{ date: project.createdAt, label: 'Project started' }, ...project.files.map((file) => ({ date: file.importedAt, label: `Imported ${file.name}` }))].sort((a,b) => b.date.localeCompare(a.date));
          return <article key={project.id} className="rounded-xl border border-[#d2dfe3] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{project.name}</h2><p className="mt-1 text-xs text-[#147b69]">{projectStandardLabels[project.standard]}</p></div><span className="rounded-full bg-[#eaf2ee] px-3 py-1 text-xs font-semibold">{project.files.length} files</span></div>
            <p className="mt-3 text-xs text-[#64748b]">Started {new Date(project.createdAt).toLocaleString()} · by {project.ownerName || owner}</p>
            <ol className="mt-4 border-l border-[#d2dfe3] pl-4">{events.map((event, index) => <li key={`${event.date}-${index}`} className="relative pb-3 text-xs"><span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-[#147b69]"/><strong>{event.label}</strong><span className="ml-2 text-[#64748b]">{new Date(event.date).toLocaleString()}</span></li>)}</ol>
          </article>;
        })}
      </section>
    </div>
    {billingHistoryOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#152733]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="billing-history-title" onClick={(event) => { if (event.target === event.currentTarget) setBillingHistoryOpen(false); }}>
      <section className="w-full max-w-4xl overflow-hidden rounded-xl border border-[#d2dfe3] bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#d2dfe3] bg-[#f5f7f4] px-5 py-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#43866c]">IFRS Lab account</p><h2 id="billing-history-title" className="mt-1 text-xl font-bold">Billing history</h2><p className="mt-1 text-xs text-[#64748b]">Spreadsheet-style view of your account charges.</p></div>
          <button type="button" onClick={() => setBillingHistoryOpen(false)} aria-label="Close billing history" className="rounded-md p-2 text-[#63716d] hover:bg-[#e9eeeb]"><X size={18}/></button>
        </header>
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead className="bg-[#eaf1ec] text-[10px] uppercase tracking-wide text-[#56635c]">
              <tr>{['Date', 'Invoice ID', 'Description', 'Billing period', 'Amount', 'Status', 'Report'].map((heading) => <th key={heading} className="border border-[#cdd8d0] px-3 py-2.5 font-bold">{heading}</th>)}</tr>
            </thead>
            <tbody>
              <tr className="bg-[#f8faf8]">
                <td className="border border-[#d9e1db] px-3 py-3">Nov 1, 2026</td>
                <td className="border border-[#d9e1db] px-3 py-3 font-mono text-[10px]">SAMPLE-2026-11</td>
                <td className="border border-[#d9e1db] px-3 py-3 font-medium">Example monthly statement · 3 items</td>
                <td className="border border-[#d9e1db] px-3 py-3">Monthly</td>
                <td className="border border-[#d9e1db] px-3 py-3 text-right font-semibold">$426.99</td>
                <td className="border border-[#d9e1db] px-3 py-3"><span className="rounded bg-[#fff1cc] px-2 py-1 text-[10px] font-semibold text-[#765b16]">Sample only</span></td>
                <td className="border border-[#d9e1db] px-3 py-3"><Link href="/account/billing" className="font-semibold text-[#147b69] hover:underline">View report</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer className="flex justify-end border-t border-[#e5ebed] bg-[#f8faf9] px-5 py-3">
          <button type="button" onClick={() => setBillingHistoryOpen(false)} className="rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white">Close</button>
        </footer>
      </section>
    </div>}
  </main>;
}

function AccountRoute() {
  return <><Show when="signed-in"><AccountProjectsPage/></Show><Show when="signed-out"><Redirect to="/"/></Show></>;
}

const sampleBillingRows = [
  { date: '2026-11-01', invoice: 'SAMPLE-2026-11', item: 'All-report subscription · IFRS 16, IFRS 9, IFRS 17', period: 'Monthly', amount: 6.99, tax: 'Not shown', status: 'Sample only' },
  { date: '2026-11-01', invoice: 'SAMPLE-2026-11', item: 'Light support', period: 'Monthly', amount: 120, tax: 'Excluded', status: 'Sample only' },
  { date: '2026-11-01', invoice: 'SAMPLE-2026-11', item: 'Dedicated technical support', period: 'Monthly', amount: 300, tax: 'Excluded', status: 'Sample only' },
];

function AccountBillingPage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <main className="grid min-h-screen place-items-center text-sm text-[#64748b]">Loading billing sample…</main>;
  const amount = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const downloadCsv = () => {
    const fields = ['Date', 'Invoice ID', 'Item billed', 'Billing period', 'Amount USD', 'Tax', 'Status'];
    const escape = (value: unknown) => {
      const text = String(value);
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const rows = sampleBillingRows.map((row) => [row.date, row.invoice, row.item, row.period, row.amount.toFixed(2), row.tax, row.status]);
    const csv = `\uFEFF${[fields, ...rows, ['', '', '', 'Sample subtotal · tax excluded', sampleBillingRows.reduce((total, row) => total + row.amount, 0).toFixed(2), '', 'Sample only']].map((row) => row.map(escape).join(',')).join('\r\n')}`;
    const fileUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'ifrs-lab-sample-billing.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  };
  const owner = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Your account';
  const total = sampleBillingRows.reduce((sum, row) => sum + row.amount, 0);
  return <main className="min-h-screen bg-[#eef4f6] px-5 py-8 text-[#142a3d] sm:px-10">
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-[#d2dfe3] pb-5">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-[#737a77]">
          <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link><span>/</span>
          <Link href="/account" className="font-medium hover:text-[#147b69] hover:underline">Account</Link><span>/</span>
          <span className="font-semibold text-[#34434a]">Billing</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#147b69]">IFRS Lab account · {owner}</p><h1 className="mt-2 text-3xl font-bold">Billing statement</h1><p className="mt-1 text-sm text-[#64748b]">Example itemized statement in a spreadsheet-style view.</p></div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white"><ArrowDownToLine size={15}/> Download CSV</button>
            <button type="button" onClick={() => window.print()} className="rounded-md border border-[#c8d6da] bg-white px-4 py-2 text-sm font-semibold text-[#34434a]">Print / Save PDF</button>
          </div>
        </div>
      </header>
      <div className="mt-6 rounded-lg border border-[#e7d5a3] bg-[#fff8e7] p-4 text-sm text-[#654f20]">
        <strong>Illustrative sample only.</strong> This is not a real invoice or payment record. No subscription is active and no charge has been made.
      </div>
      <section className="mt-5 overflow-hidden rounded-xl border border-[#cbd8cf] bg-white shadow-sm" aria-label="Sample billing report">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cbd8cf] bg-[#edf3ee] px-4 py-3 text-xs">
          <div><p className="font-bold text-[#34434a]">Workbook · Sample invoice</p><p className="mt-1 text-[#64716a]">Statement date: November 1, 2026</p></div>
          <span className="rounded border border-[#c8d6cb] bg-white px-2 py-1 font-semibold text-[#39765d]">SAMPLE-2026-11</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs tabular-nums">
            <thead>
              <tr className="bg-[#f1f4f1] text-[10px] uppercase tracking-wide text-[#68756d]">
                <th className="w-10 border border-[#d9e1db] px-2 py-2 text-center">#</th>
                {['Date', 'Invoice ID', 'Item billed', 'Billing period', 'Amount (USD)', 'Tax', 'Status'].map((label) => <th key={label} className="border border-[#d9e1db] px-3 py-2 font-bold">{label}</th>)}
              </tr>
              <tr className="bg-[#e8eee9] text-center text-[9px] font-semibold text-[#78847c]">
                <th className="border border-[#d9e1db] py-1"> </th>{['A','B','C','D','E','F','G'].map((column) => <th key={column} className="border border-[#d9e1db] py-1">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {sampleBillingRows.map((row, index) => <tr key={row.item} className="odd:bg-white even:bg-[#f8faf8] hover:bg-[#edf5ef]">
                <td className="border border-[#e0e6e1] bg-[#f1f4f1] px-2 py-3 text-center text-[#78847c]">{index + 1}</td>
                <td className="border border-[#e0e6e1] px-3 py-3">{row.date}</td>
                <td className="border border-[#e0e6e1] px-3 py-3 font-medium">{row.invoice}</td>
                <td className="border border-[#e0e6e1] px-3 py-3">{row.item}</td>
                <td className="border border-[#e0e6e1] px-3 py-3">{row.period}</td>
                <td className="border border-[#e0e6e1] px-3 py-3 text-right">{amount(row.amount)}</td>
                <td className="border border-[#e0e6e1] px-3 py-3">{row.tax}</td>
                <td className="border border-[#e0e6e1] px-3 py-3"><span className="rounded bg-[#fff1cc] px-2 py-1 text-[10px] font-semibold text-[#765b16]">{row.status}</span></td>
              </tr>)}
              <tr className="bg-[#edf4ee] font-bold">
                <td className="border border-[#d3dfd5] px-2 py-3 text-center text-[#78847c]">4</td>
                <td colSpan={4} className="border border-[#d3dfd5] px-3 py-3">Sample subtotal · tax excluded</td>
                <td className="border border-[#d3dfd5] px-3 py-3 text-right text-[#286b52]">{amount(total)}</td>
                <td colSpan={2} className="border border-[#d3dfd5] px-3 py-3 text-[#64716a]">Illustrative only</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d9e1db] bg-[#f7f9f7] px-4 py-3 text-[11px] text-[#64716a]">
          <span>Support amounts are shown before tax. This sample does not represent a charge.</span>
          <Link href="/account" className="font-semibold text-[#147b69] hover:underline print:hidden">Back to account</Link>
        </footer>
      </section>
    </div>
  </main>;
}

function AccountBillingRoute() {
  return <><Show when="signed-in"><AccountBillingPage/></Show><Show when="signed-out"><Redirect to="/"/></Show></>;
}

function WorkspaceAppRoute() {
  const user = useSessionUser();
  if (user) return <Workspace/>;
  return <div><div className="flex flex-wrap items-center justify-center gap-3 bg-[#f7e5b1] px-4 py-3 text-center text-xs text-[#574526]"><strong>Demo workspace</strong><span>This session uses sample data saved only in this browser.</span></div><Workspace/></div>;
}

function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const sessionUser: SessionUser = user
    ? {
        id: user.id,
        fullName: user.fullName,
        primaryEmailAddress: user.primaryEmailAddress
          ? { emailAddress: user.primaryEmailAddress.emailAddress }
          : null,
      }
    : null;
  return <SessionUserContext.Provider value={sessionUser}>{children}</SessionUserContext.Provider>;
}

function ClerkSetupPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#eef4f6] px-4">
      <div className="max-w-md rounded-xl bg-white p-7 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-[#142a3d]">Clerk keys required</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          Add a real <code>pk_test_...</code> publishable key and matching secret key to the package <code>.env</code> files, then restart the apps.
        </p>
        <Link href="/" className="mt-5 inline-flex rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white">Back to home</Link>
      </div>
    </main>
  );
}

function LocalRoutes() {
  return (
    <SessionUserContext.Provider value={null}>
      <Switch>
        <Route path="/" component={IfrsMetrics}/>
        <Route path="/ifrs" component={IfrsMetrics}/>
        <Route path="/workspace" component={WorkspaceEntry}/>
        <Route path="/workspace/app" component={WorkspaceAppRoute}/>
        <Route path="/account/billing" component={ClerkSetupPage}/>
        <Route path="/account" component={ClerkSetupPage}/>
        <Route path="/checkout" component={ClerkSetupPage}/>
        <Route path="/sign-in/*?" component={ClerkSetupPage}/>
        <Route path="/sign-up/*?" component={ClerkSetupPage}/>
        <Route component={NotFound}/>
      </Switch>
    </SessionUserContext.Provider>
  );
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  const stripBase = (path: string) => basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{signIn:{start:{title:'Welcome back',subtitle:'Sign in to access your IFRS Lab projects'}},signUp:{start:{title:'Create your account',subtitle:'Save and track your IFRS Lab projects'}}}}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <ClerkSessionBridge>
      <Switch>
        <Route path="/" component={HomeRedirect}/>
        <Route path="/ifrs" component={IfrsMetrics}/>
        <Route path="/workspace" component={WorkspaceEntry}/>
        <Route path="/workspace/app" component={WorkspaceAppRoute}/>
        <Route path="/account/billing" component={AccountBillingRoute}/>
        <Route path="/account" component={AccountRoute}/>
        <Route path="/checkout" component={CheckoutReviewPage}/>
        <Route path="/sign-in/*?" component={SignInPage}/>
        <Route path="/sign-up/*?" component={SignUpPage}/>
        <Route component={NotFound}/>
      </Switch>
    </ClerkSessionBridge>
  </ClerkProvider>;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      {clerkEnabled ? <ClerkRoutes/> : <LocalRoutes/>}
    </WouterRouter>
  );
}

export default App;
