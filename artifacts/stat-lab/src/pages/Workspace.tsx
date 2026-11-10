import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowRight, BarChart3, Check, ChevronDown, ChevronRight, CircleHelp, Database, FileSpreadsheet, Filter, FlaskConical, Folder, FolderOpen, FolderPlus, Layers3, MessageSquareText, PanelLeftClose, PanelLeftOpen, Search, Sparkles, Table2, Trash2, Upload, UserRound, X } from 'lucide-react';
import { Link } from 'wouter';
import * as XLSX from 'xlsx';
import { useSessionUser } from '@/auth/session';
import { catalog, columnLetter, demo, fmt, mean, numericFields, nums, toDataset, toDatasetFromMatrix, twoSidedTPValue, variance } from '@/lib/dataset';
import { readProjectStore } from '@/lib/project-store';
import { projectStandardLabels, type ChatMessage, type Dataset, type Project, type ProjectFile, type ProjectStandard, type ProjectStore, type Saved } from '@/lib/workspace-types';

export function Workspace() {
  const user = useSessionUser();
  useEffect(() => {
    document.title = 'IFRS Lab Metrics workspace';
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
  const [expandedProjects, setExpandedProjects] = useState<string[]>(() =>
    projectStore.activeProjectId ? [projectStore.activeProjectId] : [],
  );
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

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects((current) =>
      current.includes(projectId) ? current.filter((id) => id !== projectId) : [...current, projectId],
    );
  };

  return <div className="app-shell flex">
    <aside className={`sidebar hidden shrink-0 flex-col min-h-[100dvh] py-4 transition-all duration-200 md:flex ${sidebarCollapsed ? 'md:w-[76px] px-2' : 'md:w-[252px] px-3'}`}>
      <div className={`flex items-center pb-4 ${sidebarCollapsed ? 'flex-col gap-3' : 'gap-2 px-1'}`}>
        <div className={`flex min-w-0 items-center ${sidebarCollapsed ? 'justify-center' : 'flex-1 gap-2.5'}`}>
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] bg-[#0078d4] text-white shadow-sm"><Activity size={16}/></div>
          {!sidebarCollapsed && <div className="min-w-0"><div className="truncate text-[13px] font-semibold tracking-tight text-[#1f2328]">IFRS Metrics Lab</div><div className="text-[10px] text-[#605e5c]">File Explorer</div></div>}
        </div>
        <button data-testid="button-toggle-sidebar" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} className="grid h-7 w-7 shrink-0 place-items-center rounded-[4px] border border-[#d8dde4] bg-white text-[#605e5c] hover:bg-[#edebe9]" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed}>
          {sidebarCollapsed ? <PanelLeftOpen size={14}/> : <PanelLeftClose size={14}/>}
        </button>
      </div>

      {!sidebarCollapsed && <>
        <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#605e5c]">Navigation</div>
        {!sidebarCollapsed && <select aria-label="Select workspace" value={projectStore.activeWorkspaceId} onChange={(event) => {
          const nextWorkspaceId = event.target.value;
          setProjectStore((old) => {
            const nextProject = old.projects.find((project) => project.workspaceId === nextWorkspaceId);
            return { ...old, activeWorkspaceId: nextWorkspaceId, activeProjectId: nextProject?.id ?? null, activeFileId: null };
          });
          if (nextWorkspaceId) {
            const nextProject = projectStore.projects.find((project) => project.workspaceId === nextWorkspaceId);
            if (nextProject) setExpandedProjects((current) => current.includes(nextProject.id) ? current : [...current, nextProject.id]);
          }
        }} className="mb-2 w-full rounded-[4px] border border-[#d8dde4] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1f2328]">
          {projectStore.workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}{workspace.isDefault ? ' · Default' : ''}</option>)}
        </select>}

        <div className="mb-2 rounded-[4px] border border-[#d8dde4] bg-white">
          <div className="flex items-center gap-1 border-b border-[#edebe9] px-2 py-1.5">
            <FolderOpen size={14} className="ms-folder-open shrink-0" fill="currentColor" />
            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#1f2328]">
              {projectStore.workspaces.find((workspace) => workspace.id === projectStore.activeWorkspaceId)?.name ?? 'Workspace'}
            </span>
            <button type="button" title="Projects & files" aria-label="Projects and files" onClick={() => setProjectManagerOpen(true)} className="grid h-6 w-6 place-items-center rounded-[3px] text-[#0078d4] hover:bg-[#cce4f7]">
              <FolderPlus size={13}/>
            </button>
          </div>

          <div className="max-h-[42vh] overflow-y-auto py-1">
            {!workspaceProjects.length && <p className="px-3 py-2 text-[10px] text-[#605e5c]">No projects yet. Create one to start.</p>}
            {workspaceProjects.map((project) => {
              const expanded = expandedProjects.includes(project.id);
              const isActiveProject = project.id === projectStore.activeProjectId;
              return (
                <div key={project.id} className="px-1">
                  <div className={`flex items-center rounded-[3px] ${isActiveProject ? 'bg-[#eef6fc]' : 'hover:bg-[#edebe9]'}`}>
                    <button
                      type="button"
                      aria-label={expanded ? `Collapse ${project.name}` : `Expand ${project.name}`}
                      onClick={() => toggleProjectExpanded(project.id)}
                      className="grid h-7 w-6 shrink-0 place-items-center text-[#605e5c]"
                    >
                      {expanded ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        selectProject(project);
                        setExpandedProjects((current) => current.includes(project.id) ? current : [...current, project.id]);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 pr-2 text-left"
                    >
                      {expanded
                        ? <FolderOpen size={14} className="ms-folder-open shrink-0" fill="currentColor" />
                        : <Folder size={14} className="ms-folder shrink-0" fill="currentColor" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium text-[#1f2328]">{project.name}</span>
                        <span className="block truncate text-[9px] text-[#605e5c]">{projectStandardLabels[project.standard]}</span>
                      </span>
                    </button>
                  </div>
                  {expanded && (
                    <div className="sidebar-tree-line ml-3 mb-1 space-y-0.5 pl-3">
                      {!project.files.length && <p className="px-1 py-1 text-[10px] text-[#605e5c]">Empty folder</p>}
                      {project.files.map((file) => {
                        const selected = projectStore.activeFileId === file.id && isActiveProject;
                        return (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => openProjectFile(project, file)}
                            className={`flex w-full items-center gap-1.5 rounded-[3px] px-1.5 py-1 text-left ${selected ? 'bg-[#cce4f7] text-[#003966]' : 'text-[#323130] hover:bg-[#edebe9]'}`}
                          >
                            <FileSpreadsheet size={12} className={selected ? 'shrink-0 text-[#0078d4]' : 'shrink-0 text-[#107c10]'}/>
                            <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{file.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>}

      {sidebarCollapsed && (
        <button title="Projects & files" aria-label="Projects and files" onClick={() => setProjectManagerOpen(true)} className="mb-2 grid h-9 w-full place-items-center rounded-[4px] border border-[#d8dde4] bg-white text-[#e8b339] hover:bg-[#edebe9]">
          <FolderPlus size={16}/>
        </button>
      )}

      <button title="Data & explore" aria-label="Data and explore" data-testid="nav-data" onClick={() => setActiveTab('data')} className={`flex items-center rounded-[4px] py-2 text-[12px] transition ${sidebarCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'} ${activeTab === 'data' ? 'bg-[#cce4f7] font-semibold text-[#003966]' : 'text-[#323130] hover:bg-[#edebe9]'}`}><Table2 size={15} className={activeTab === 'data' ? 'text-[#0078d4]' : 'text-[#605e5c]'}/>{!sidebarCollapsed && 'Data & explore'}</button>
      <button title="Results" aria-label={`Results, ${results.length}`} data-testid="nav-results" onClick={() => setActiveTab('results')} className={`mt-0.5 flex items-center rounded-[4px] py-2 text-[12px] transition ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} ${activeTab === 'results' ? 'bg-[#cce4f7] font-semibold text-[#003966]' : 'text-[#323130] hover:bg-[#edebe9]'}`}><span className={`flex items-center ${sidebarCollapsed ? '' : 'gap-2.5'}`}><BarChart3 size={15} className={activeTab === 'results' ? 'text-[#0078d4]' : 'text-[#605e5c]'}/>{!sidebarCollapsed && 'Results'}</span>{!sidebarCollapsed && <span className="mono text-[10px] text-[#605e5c]">{results.length}</span>}</button>

      {!sidebarCollapsed && <div className="mx-1 mt-6 border-t border-[#d8dde4] pt-4">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#605e5c]">Open item</div>
        <div className="flex items-start gap-2 rounded-[4px] border border-[#d8dde4] bg-white p-2.5"><Database size={14} className="mt-0.5 shrink-0 text-[#0078d4]"/><div className="min-w-0"><div className="truncate text-[11px] font-semibold text-[#1f2328]">{dataset.name}</div><div className="mt-0.5 text-[10px] text-[#605e5c]">{dataset.rows.length} rows · {dataset.columns.length} fields</div></div></div>
        <button data-testid="button-reset-demo" onClick={reset} className="mt-2 flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[11px] text-[#323130] hover:bg-[#edebe9]"><Activity size={13} className="text-[#605e5c]"/> Reset to demo</button>
      </div>}

      <div className={`mt-auto rounded-[4px] border border-[#d8dde4] bg-white ${sidebarCollapsed ? 'mx-auto p-2' : 'p-2.5'}`} title={sidebarCollapsed ? 'Your data stays in this browser' : undefined}>
        <div className={`flex items-center text-[11px] font-semibold text-[#1f2328] ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}><Sparkles size={13} className="text-[#0078d4]"/>{!sidebarCollapsed && 'Local by design'}</div>
        {!sidebarCollapsed && <p className="mt-1.5 text-[10px] leading-relaxed text-[#605e5c]">Your data stays in this browser. Nothing is uploaded to a server.</p>}
      </div>
    </aside>
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 border-b border-[#cbd8df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#142a3d] text-[#eef4f6] md:hidden"><Activity size={17}/></div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#64748b]">
              <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
              <span>/</span>
              <Link href="/workspace" className="hover:text-[#147b69] hover:underline">Workspace</Link>
              <span>/</span>
              <span className="font-semibold text-[#40596b]">{activeTab === 'data' ? 'Data & Explore' : 'Results'}</span>
            </div>
            <div className="md:hidden truncate text-sm font-semibold">{activeTab === 'data' ? 'Data & explore' : 'Results'}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-[#9bbeb7] bg-[#dcece8] px-2.5 py-1 text-[10px] font-semibold text-[#095e55] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#147b69]"/> Browser session</span>
            <button onClick={() => setProjectManagerOpen(true)} className="btn-secondary"><FolderOpen size={14}/><span className="hidden sm:inline">Projects</span></button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.xlsx,.xls,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" data-testid="input-file" onChange={(e) => void importFile(e.target.files?.[0])}/>
            <button data-testid="button-import" onClick={() => activeProject ? fileRef.current?.click() : setProjectManagerOpen(true)} disabled={uploadBusy} className="btn-secondary disabled:opacity-60"><Upload size={14}/><span className="hidden sm:inline">{uploadBusy ? 'Reading…' : 'Import data'}</span></button>
            <button data-testid="button-export" onClick={exportCsv} className="btn-primary"><ArrowDownToLine size={14}/><span className="hidden sm:inline">Export CSV</span></button>
            <Link href={user ? "/account" : "/sign-in"} title={user ? "Your account" : "Sign in"} aria-label={user ? "Your account" : "Sign in"} className="btn-icon"><UserRound size={16}/></Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="appear">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#147b69]"><span className="h-px w-5 bg-[#147b69]"/> A clearer path from data to evidence</div>
            <h1 className="display text-[30px] font-extrabold leading-tight tracking-[-.04em] text-[#142a3d] md:text-[38px]">Good questions deserve<br className="hidden sm:block"/> careful answers.</h1>
            <p className="mt-2 max-w-xl text-sm text-[#64748b]">Inspect your dataset, choose a method, and keep every result close to the data that produced it.</p>
          </div>
          <div className="flex gap-2">
            <div className="stat-card flex min-w-[120px] items-center gap-3 px-4 py-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#dcece8] text-[#147b69]"><Layers3 size={16}/></div><div><div className="mono text-lg font-medium text-[#142a3d]">{dataset.rows.length}</div><div className="text-[10px] text-[#64748b]">observations</div></div></div>
            <div className="stat-card flex min-w-[120px] items-center gap-3 px-4 py-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#dcece8] text-[#147b69]"><Database size={16}/></div><div><div className="mono text-lg font-medium text-[#142a3d]">{dataset.columns.length}</div><div className="text-[10px] text-[#64748b]">fields</div></div></div>
          </div>
        </div>

        {error && <div data-testid="status-error" role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-[#e4b8b2] bg-[#fff3f1] px-4 py-3 text-sm text-[#922f27]"><span>{error}</span><button data-testid="button-dismiss-error" onClick={() => setError('')} aria-label="Dismiss error"><X size={16}/></button></div>}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            {activeTab === 'data' ? <>
              <section className="stat-card overflow-hidden appear">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d2dfe3] px-5 py-4">
                  <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#dcece8] text-[#147b69]"><FileSpreadsheet size={17}/></div><div><h2 className="text-sm font-bold text-[#142a3d]">Dataset preview</h2><p className="text-[11px] text-[#64748b]">{dataset.name} <span className="px-1">·</span> {appliedFilter ? `${visibleRows.length} filtered rows` : 'All rows'}</p></div></div>
                  <div className="flex gap-1 rounded-lg bg-[#e7edef] p-1">
                    <button data-testid="tab-data" onClick={() => setActiveTab('data')} className="rounded-md bg-[#ffffff] px-3 py-1.5 text-[11px] font-semibold text-[#147b69] shadow-sm">Data</button>
                    <button data-testid="tab-results" onClick={() => setActiveTab('results')} className="rounded-md px-3 py-1.5 text-[11px] text-[#64748b] hover:text-[#147b69]">Results {results.length > 0 && `(${results.length})`}</button>
                  </div>
                </div>
                <div className="fine-grid border-b border-[#e7edef] px-5 py-3">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {dataset.columns.map((c, i) => <div key={c.name} data-testid={`field-chip-${i}`} className="flex shrink-0 items-center gap-2 rounded-md border border-[#d2dfe3] bg-[#ffffff]/95 px-2.5 py-1.5"><span className={`h-1.5 w-1.5 rounded-full ${c.type === 'number' ? 'bg-[#147b69]' : 'bg-[#52687a]'}`}/><span className="mono text-[10px] text-[#40596b]">{c.name}</span><span className="text-[9px] uppercase text-[#64748b]">{c.type === 'number' ? '123' : 'abc'}</span></div>)}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {visibleRows.length ? <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead><tr className="bg-[#f4f8f8]">{dataset.columns.map((c) => <th key={c.name} className="border-b border-[#d2dfe3] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#64748b]">{c.name}</th>)}</tr></thead>
                    <tbody>{visibleRows.slice(0, 12).map((row, ri) => <tr data-testid={`row-dataset-${ri}`} key={ri} className="border-b border-[#e7edef] last:border-0 hover:bg-[#f4f8f8]">{dataset.columns.map((c) => <td data-testid={`cell-${ri}-${c.name}`} key={c.name} className={`px-4 py-2.5 text-xs ${c.type === 'number' ? 'mono text-[#40596b]' : 'text-[#40596b]'}`}>{row[c.name] === null ? <span className="text-[#94a3b8]">Missing</span> : String(row[c.name])}</td>)}</tr>)}</tbody>
                  </table> : <div data-testid="empty-filter" className="p-10 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#eef4f6] text-[#64748b]"><Filter size={18}/></div><p className="mt-3 text-sm font-semibold text-[#142a3d]">No rows match this filter</p><button data-testid="button-clear-filter" onClick={() => setAppliedFilter(null)} className="btn-ghost mt-2">Clear filter</button></div>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e7edef] px-5 py-3 text-[10px] text-[#64748b]"><span>Showing {Math.min(12, visibleRows.length)} of {visibleRows.length} rows</span>{appliedFilter && <button data-testid="button-remove-filter" onClick={() => setAppliedFilter(null)} className="btn-ghost !px-2 !py-1"><X size={12}/> Remove filter</button>}</div>
              </section>

              <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="stat-card p-5">
                  <div className="mb-4 flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#147b69]"><BarChart3 size={14}/> Quick analysis</div><h2 className="mt-1 text-base font-bold text-[#142a3d]">Start with the shape</h2></div><span className="rounded-full bg-[#dcece8] px-2 py-1 text-[9px] font-semibold text-[#095e55]">01 / EXPLORE</span></div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#64748b]" htmlFor="numeric-field">Numeric field</label>
                  <select id="numeric-field" data-testid="select-numeric-field" value={numericField} onChange={(e) => setNumericField(e.target.value)} className="w-full rounded-lg border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2.5 text-xs text-[#142a3d]">{numericFields(dataset).map((f) => <option key={f} value={f}>{f}</option>)}</select>
                  {!numericFields(dataset).length && <p className="mt-2 text-xs text-[#922f27]">Import a dataset with numeric fields to run these analyses.</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button data-testid="button-descriptive" onClick={runDescriptive} disabled={!numericField} className="btn-primary w-full disabled:opacity-50"><Activity size={14}/> Describe</button>
                    <button data-testid="button-histogram" onClick={runHistogram} disabled={!numericField} className="btn-secondary w-full disabled:opacity-50"><BarChart3 size={14}/> Histogram</button>
                  </div>
                </div>
                <div className="stat-card p-5">
                  <div className="mb-4 flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#147b69]"><FlaskConical size={14}/> Compare</div><h2 className="mt-1 text-base font-bold text-[#142a3d]">Two-group t-test</h2></div><span className="rounded-full bg-[#dcece8] px-2 py-1 text-[9px] font-semibold text-[#147b69]">02 / TEST</span></div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#64748b]" htmlFor="group-field">Group by</label>
                  <select id="group-field" data-testid="select-group-field" value={groupField} onChange={(e) => setGroupField(e.target.value)} className="mb-2 w-full rounded-lg border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2 text-xs text-[#142a3d]">{dataset.columns.filter((c) => c.type !== 'number').map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}</select>
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#64748b]" htmlFor="outcome-field">Measure</label>
                  <div className="flex gap-2"><select id="outcome-field" data-testid="select-outcome-field" value={outcomeField} onChange={(e) => setOutcomeField(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2 text-xs text-[#142a3d]">{numericFields(dataset).map((f) => <option key={f} value={f}>{f}</option>)}</select><button data-testid="button-ttest" onClick={runTTest} className="btn-primary shrink-0">Run test <ArrowRight size={13}/></button></div>
                </div>
              </section>
              <section className="stat-card p-5">
                <div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#147b69]"><Filter size={14}/> Prepare</div><h2 className="mt-1 text-base font-bold text-[#142a3d]">Filter the preview</h2></div>{appliedFilter && <span className="rounded-full bg-[#dcece8] px-2.5 py-1 text-[10px] font-semibold text-[#147b69]">{visibleRows.length} matching</span>}</div>
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <select aria-label="Filter field" data-testid="select-filter-field" value={filterField} onChange={(e) => setFilterField(e.target.value)} className="rounded-lg border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2 text-xs text-[#142a3d]">{dataset.columns.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}</select>
                  <select aria-label="Filter operation" data-testid="select-filter-operator" value={filterOp} onChange={(e) => setFilterOp(e.target.value)} className="rounded-lg border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2 text-xs text-[#142a3d]"><option value="equals">equals</option><option value="contains">contains</option><option value="greater">greater than</option><option value="less">less than</option><option value="missing">is missing</option></select>
                  <input aria-label="Filter value" data-testid="input-filter-value" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder="Value…" className="rounded-lg border border-[#d2dfe3] bg-[#f8faf9] px-3 py-2 text-xs text-[#142a3d] placeholder:text-[#94a3b8]"/>
                  <button data-testid="button-apply-filter" onClick={applyFilter} className="btn-secondary"><Filter size={13}/> Apply</button>
                </div>
              </section>
            </> : <section className="stat-card min-h-[420px] p-5 appear">
              <div className="mb-5 flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#147b69]"><BarChart3 size={14}/> Notebook</div><h2 className="mt-1 text-lg font-bold text-[#142a3d]">Analysis results</h2><p className="mt-1 text-xs text-[#64748b]">Computed locally from {dataset.name}</p></div><button data-testid="button-clear-results" disabled={!results.length} onClick={() => setSaved((old) => ({ ...old, results:[] }))} className="btn-secondary disabled:opacity-40"><Trash2 size={13}/> Clear all</button></div>
              {!results.length ? <div data-testid="empty-results" className="fine-grid rounded-xl border border-dashed border-[#d2dfe3] p-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dcece8] text-[#147b69]"><BarChart3 size={20}/></div><h3 className="mt-4 text-sm font-bold text-[#142a3d]">Your results will live here</h3><p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#64748b]">Run a summary, histogram, or t-test to create an auditable snapshot from the current dataset.</p><button data-testid="button-first-summary" onClick={() => { setActiveTab('data'); runDescriptive(); }} className="btn-primary mt-4">Run a summary</button></div> :
                <div className="space-y-3">{results.map((r) => <article data-testid={`result-card-${r.id}`} key={r.id} className="rounded-xl border border-[#d2dfe3] bg-[#f8faf9] p-4">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-[#142a3d]">{r.title}</h3><p className="mt-1 text-xs text-[#64748b]">{r.summary}</p></div><span className="mono shrink-0 text-[9px] text-[#64748b]">{new Date(r.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span></div>
                  {Array.isArray(r.values.bins) ? <div className="mt-5"><div className="flex h-32 items-end gap-1.5 border-b border-l border-[#d2dfe3] px-2">{(r.values.bins as {from:number;to:number;count:number}[]).map((b,i) => <div data-testid={`histogram-bin-${i}`} key={i} title={`${fmt(b.from)}–${fmt(b.to)}: ${b.count}`} className="group relative flex-1 rounded-t-sm bg-[#147b69] transition hover:bg-[#0f6556]" style={{ height:`${Math.max(4, b.count / Math.max(...(r.values.bins as {count:number}[]).map((x) => x.count)) * 100)}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-[#64748b]">{b.count}</span></div>)}</div><div className="mt-2 flex justify-between text-[9px] text-[#64748b]"><span>{fmt((r.values.bins as {from:number}[])[0]?.from)}</span><span>{fmt((r.values.bins as {to:number}[]).at(-1)?.to ?? 0)}</span></div></div> :
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(r.values).filter(([k,v]) => k !== 'note' && typeof v !== 'object').map(([k,v]) => <div key={k} className="rounded-lg border border-[#d2dfe3] bg-[#ffffff] px-3 py-2"><div className="text-[9px] uppercase tracking-[.1em] text-[#64748b]">{k.replace(/([A-Z])/g,' $1')}</div><div className="mono mt-1 truncate text-xs font-medium text-[#095e55]">{String(v)}</div></div>)}</div>}
                  {typeof r.values.note === 'string' && <p className="mt-3 rounded-md bg-[#dcece8] p-2.5 text-[10px] leading-relaxed text-[#095e55]">{r.values.note}</p>}
                </article>)}</div>}
            </section>}
            <div className="flex items-center justify-between px-1 text-[10px] text-[#64748b]"><span>IFRS Lab runs in your browser. Results are descriptive, not a substitute for study design.</span><span className="mono hidden sm:inline">LOCAL · PRIVATE</span></div>
          </div>

          <aside className="stat-card overflow-hidden xl:sticky xl:top-[84px]">
            <div className="flex items-center gap-3 border-b border-[#d2dfe3] px-4 py-4"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#dcece8] text-[#147b69]"><MessageSquareText size={17}/></div><div><h2 className="text-sm font-bold text-[#142a3d]">Analysis guide</h2><p className="text-[10px] text-[#64748b]">Ask for an operation, not a guess</p></div><CircleHelp size={15} className="ml-auto text-[#94a3b8]"/></div>
            <div ref={chatRef} data-testid="assistant-conversation" className="flex max-h-[310px] min-h-[160px] flex-col gap-3 overflow-y-auto p-4">
              {!messages.length && <div data-testid="assistant-empty" className="rounded-lg bg-[#f4f8f8] p-3.5"><div className="flex items-center gap-2 text-xs font-semibold text-[#142a3d]"><Sparkles size={14} className="text-[#147b69]"/> A useful first question</div><p className="mt-2 text-xs leading-relaxed text-[#64748b]">I can run a summary, plot a histogram, compare two groups, or apply the filter you configured. All calculations use the data currently in this workspace.</p></div>}
              {messages.map((m,i) => <div data-testid={`chat-message-${i}`} key={i} className={`max-w-[93%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${m.role === 'user' ? 'self-end rounded-br-sm bg-[#147b69] text-white' : 'self-start rounded-bl-sm border border-[#d2dfe3] bg-[#f4f8f8] text-[#52687a]'}`}><span className="mb-1 block text-[9px] font-bold uppercase tracking-[.1em] opacity-65">{m.role === 'user' ? 'You' : 'IFRS Lab'}</span>{m.text}</div>)}
            </div>
            <div className="border-t border-[#d2dfe3] p-4">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {[['Summarize this field','Describe'],['Show a histogram','Histogram'],['Compare the groups','T-test']].map(([label, op]) => <button key={op} data-testid={`suggestion-${op.toLowerCase()}`} onClick={() => submitAssistant(label)} className="btn-secondary !px-2.5 !py-1.5 !text-[10px]">{label}</button>)}
              </div>
              <form data-testid="assistant-form" onSubmit={(e) => { e.preventDefault(); submitAssistant(); }} className="flex items-end gap-2 rounded-xl border border-[#d2dfe3] bg-[#ffffff] p-2 focus-within:border-[#147b69]">
                <textarea data-testid="input-assistant-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAssistant(); } }} rows={2} placeholder="What would you like to explore?" className="max-h-24 min-h-[42px] flex-1 resize-y bg-transparent px-1 py-1.5 text-xs text-[#142a3d] outline-none placeholder:text-[#94a3b8]"/>
                <button data-testid="button-send-prompt" type="submit" disabled={!prompt.trim()} aria-label="Send analysis prompt" className="btn-primary !p-0 h-8 w-8 shrink-0 disabled:opacity-40"><ArrowRight size={15}/></button>
              </form>
              <p className="mt-2 text-center text-[9px] text-[#64748b]">Enter to send · calculations stay on this device</p>
            </div>
          </aside>
        </div>

        <section className="mt-7">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#147b69]"><FlaskConical size={14}/> Method library</div><h2 className="mt-1 display text-xl font-extrabold tracking-tight text-[#142a3d]">Find a method</h2><p className="mt-1 text-xs text-[#64748b]">A field guide to the tools in a research workflow.</p></div><div className="relative w-full sm:w-[240px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"/><input data-testid="input-catalog-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search methods…" className="w-full rounded-lg border border-[#d2dfe3] bg-[#ffffff] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#147b69]"/></div></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {filteredCatalog.map((group) => <section key={group.group} className="stat-card overflow-hidden">
              <button data-testid={`button-category-${group.group.toLowerCase()}`} aria-expanded={openGroups.includes(group.group) || Boolean(search)} onClick={() => setOpenGroups((old) => old.includes(group.group) ? old.filter((x) => x !== group.group) : [...old, group.group])} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f4f8f8]"><span className="flex items-center gap-2 text-xs font-bold text-[#142a3d]">{openGroups.includes(group.group) || search ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} {group.group}</span><span className="mono text-[9px] text-[#64748b]">{group.items.length.toString().padStart(2,'0')}</span></button>
              {(openGroups.includes(group.group) || Boolean(search)) && <div className="border-t border-[#e7edef] px-2 py-1.5">{group.items.map(([title,desc]) => {
                const supported = ['Descriptive summary','Histogram','Independent t-test','Filter rows'].includes(title);
                return <button key={title} data-testid={`catalog-method-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} onClick={() => runNamed(title)} className="group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-left hover:bg-[#f4f8f8]"><span><span className="block text-[11px] font-semibold text-[#40596b] group-hover:text-[#147b69]">{title}</span><span className="mt-0.5 block text-[9px] leading-snug text-[#64748b]">{desc}</span></span><span className={`shrink-0 rounded-full px-1.5 py-1 text-[8px] font-bold ${supported ? 'bg-[#dcece8] text-[#147b69]' : 'bg-[#eef4f6] text-[#64748b]'}`}>{supported ? 'READY' : 'GUIDE'}</span></button>;
              })}</div>}
            </section>)}
            {!filteredCatalog.length && <div data-testid="catalog-empty" className="col-span-full rounded-xl border border-dashed border-[#d2dfe3] p-8 text-center text-xs text-[#64748b]">No methods match “{search}”. Try another search.</div>}
          </div>
        </section>
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#cbd8df] py-4 text-[10px] text-[#64748b]"><span className="flex items-center gap-1.5"><Check size={12} className="text-[#147b69]"/> Workspace saved locally</span><button data-testid="button-reset-footer" onClick={reset} className="btn-ghost !px-2 !py-1">Reset workspace <ChevronRight size={12}/></button></footer>
      </div>
    </main>
    {projectManagerOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#142a3d]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="projects-title" onClick={(event) => { if (event.target === event.currentTarget) setProjectManagerOpen(false); }}>
      <div className="stat-card max-h-[90dvh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#147b69]">IFRS Lab project directory</p><h2 id="projects-title" className="mt-1 text-xl font-bold text-[#142a3d]">Projects & files</h2><p className="mt-1 text-xs text-[#64748b]">Projects and imported files are saved in this browser.</p></div>
          <button onClick={() => setProjectManagerOpen(false)} aria-label="Close projects" className="btn-icon !rounded-[3px] !w-8 !h-8"><X size={18}/></button>
        </div>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); createProject(); }}>
          <input value={projectNameInput} onChange={(event) => setProjectNameInput(event.target.value)} placeholder="New project name" aria-label="New project name" className="min-w-0 flex-1 rounded-lg border border-[#d2dfe3] bg-[#ffffff] px-3 py-2.5 text-sm"/>
          <select value={projectStandardInput} onChange={(event) => setProjectStandardInput(event.target.value as ProjectStandard | '')} aria-label="Project standard" required className="rounded-lg border border-[#d2dfe3] bg-[#ffffff] px-3 py-2.5 text-sm text-[#40596b]">
            <option value="" disabled>Select a project standard</option>
            <option value="ifrs16">{projectStandardLabels.ifrs16}</option>
            <option value="ifrs9">{projectStandardLabels.ifrs9}</option>
            <option value="ifrs17">{projectStandardLabels.ifrs17}</option>
            <option value="multiple">{projectStandardLabels.multiple}</option>
            <option value="general">{projectStandardLabels.general}</option>
          </select>
          <button type="submit" disabled={!projectNameInput.trim() || !projectStandardInput} className="btn-primary disabled:opacity-50"><FolderPlus size={14}/> Start project</button>
        </form>
        <div className="mt-5 grid gap-4 md:grid-cols-[.85fr_1.15fr]">
          <section className="rounded-xl border border-[#d2dfe3] p-3">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">Projects</h3>
            {!workspaceProjects.length && <p className="p-2 text-xs text-[#64748b]">Create a project to start organizing files in this workspace.</p>}
            {workspaceProjects.map((project) => <button key={project.id} onClick={() => selectProject(project)} className={`mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs ${project.id === projectStore.activeProjectId ? 'bg-[#dcece8] font-semibold text-[#147b69]' : 'hover:bg-[#f4f8f8]'}`}><span className="flex min-w-0 items-center gap-2"><FolderOpen size={14}/><span className="min-w-0 truncate">{project.name}<span className="mt-1 block truncate text-[9px] font-normal text-[#64748b]">{projectStandardLabels[project.standard]}</span></span></span><span className="text-[10px] opacity-70">{project.files.length}</span></button>)}
          </section>
          <section className="rounded-xl border border-[#d2dfe3] p-3">
            <div className="mb-2 flex items-center justify-between gap-2"><h3 className="truncate text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">{activeProject?.name ?? 'Project files'}</h3>
              {activeProject && <button onClick={() => { setProjectManagerOpen(false); fileRef.current?.click(); }} className="btn-primary !px-2.5 !py-1.5 !text-[10px] shrink-0"><Upload size={12}/> Import file</button>}
            </div>
            {!activeProject && <p className="p-2 text-xs text-[#64748b]">Select or create a project to view its files.</p>}
            {activeProject && !activeProject.files.length && <p className="p-2 text-xs text-[#64748b]">This folder is empty. Import a CSV, TSV, or Excel file.</p>}
            {activeProject?.files.map((file) => <button key={file.id} title={file.mappings.map((mapping) => `${mapping.target} ← ${mapping.source}`).join(', ')} onClick={() => openProjectFile(activeProject, file)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left ${projectStore.activeFileId === file.id ? 'bg-[#dcece8]' : 'hover:bg-[#f4f8f8]'}`}><FileSpreadsheet size={15} className="shrink-0 text-[#147b69]"/><span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#40596b]">{file.name}</span><span className="shrink-0 text-[9px] text-[#64748b]">{file.dataset.rows.length} rows</span></button>)}
          </section>
        </div>
      </div>
    </div>}
    {pendingImport && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#142a3d]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="mapping-title" onClick={(event) => { if (event.target === event.currentTarget) cancelPendingImport(); }}>
      <div className="stat-card max-h-[90dvh] w-full max-w-3xl overflow-y-auto p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#147b69]">Import to {activeProject?.name}</p><h2 id="mapping-title" className="mt-1 text-xl font-bold text-[#142a3d]">Map your columns</h2><p className="mt-1 text-xs text-[#64748b]">{pendingImport.dataset.name} · {pendingImport.dataset.rows.length} rows · edit field names to match your project.</p></div><button onClick={cancelPendingImport} aria-label="Cancel mapping" className="btn-icon !rounded-[3px] !w-8 !h-8"><X size={18}/></button></div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#d2dfe3]">
          <table className="w-full min-w-[560px] text-left"><thead className="bg-[#f4f8f8] text-[10px] uppercase tracking-wide text-[#64748b]"><tr><th className="px-3 py-2">Excel column</th><th className="px-3 py-2">Source heading</th><th className="px-3 py-2">Map to project field</th><th className="px-3 py-2">Example value</th></tr></thead>
            <tbody>{pendingImport.dataset.columns.map((column, index) => <tr key={`${index}-${column.name}`} className="border-t border-[#e7edef]"><td className="px-3 py-2 text-xs font-semibold text-[#147b69]">{columnLetter(index)}</td><td className="px-3 py-2 text-xs text-[#40596b]">{column.name}</td><td className="px-3 py-2"><input value={pendingImport.targets[index]} onChange={(event) => setPendingImport((old) => old ? { ...old, targets: old.targets.map((target, i) => i === index ? event.target.value : target) } : old)} aria-label={`Map ${column.name}`} className="w-full rounded-md border border-[#d2dfe3] bg-[#ffffff] px-2.5 py-2 text-xs"/></td><td className="max-w-[160px] truncate px-3 py-2 text-xs text-[#64748b]">{String(pendingImport.dataset.rows[0]?.[column.name] ?? '—')}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-[#64748b]">Example: map Column A to <strong>principal</strong>. Your original file stays unchanged.</p>
        {error && <p role="alert" className="mt-3 text-xs text-[#922f27]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2"><button onClick={cancelPendingImport} className="btn-secondary">Cancel</button><button onClick={confirmImport} className="btn-primary">Save to project</button></div>
      </div>
    </div>}
  </div>;
}
