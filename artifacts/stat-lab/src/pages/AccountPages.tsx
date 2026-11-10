import { useEffect, useState } from 'react';
import { Show, useClerk, useUser } from '@clerk/react';
import { ArrowDownToLine, X } from 'lucide-react';
import { Link, Redirect } from 'wouter';
import { basePath } from '@/auth/clerk-config';
import { latestProjectActivity } from '@/pages/WorkspaceHome';
import { projectStandardLabels, type Project, type ProjectStore } from '@/lib/workspace-types';

export function AccountProjectsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
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
  const sortedProjects = projects.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visibleProjects = projectsExpanded ? sortedProjects : sortedProjects.slice(0, 2);
  const hasMoreProjects = sortedProjects.length > 2;
  const totalFiles = sortedProjects.reduce((sum, project) => sum + project.files.length, 0);
  return <main className="min-h-screen bg-[#eef4f6] px-4 py-7 text-[#142a3d] sm:px-8">
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[11px] text-[#737a77]">
        <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
        <span>/</span><span className="font-semibold text-[#34434a]">Account</span>
      </nav>

      <div className="relative mr-3">
        <div className="absolute right-[-13px] top-[-13px] h-[80%] w-[88%] rounded-lg bg-[#d6e3e8]" aria-hidden="true" />
        <article className="relative rounded-[7px] border border-[#d2dfe3] bg-white p-[21px_21px_15px] shadow-[0_18px_40px_rgba(19,43,60,.07)]" aria-label="Account schedule">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d2dfe3] pb-4">
            <div>
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.12em] text-[#147b69]">Account · IFRS Lab</span>
              <h1 className="m-0 text-[17px] font-bold leading-tight tracking-[-.03em]">Account schedule</h1>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-[3px] border border-[#d2dfe3] px-1.5 py-1 text-[9px] font-bold uppercase tracking-[.06em] text-[#64748b]">Local session</span>
              <Link href="/workspace/app" className="btn-primary !px-2 !py-1 !text-[10px]">Workspace</Link>
              <button type="button" onClick={() => void signOut({ redirectUrl: basePath || '/' })} className="btn-secondary !px-2 !py-1 !text-[10px]">Sign out</button>
            </div>
          </div>

          <div className="mt-3.5 mb-3.5 rounded-[5px] border border-[#d2dfe3] bg-[#f4f8f8] p-3.5" aria-label="Account assumptions">
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
              <strong className="text-[11px]">Account assumptions</strong>
              <span className="text-[9px] text-[#64748b]">Signed-in profile · browser storage</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="min-w-0">
                <div className="mb-1 text-[9px] font-bold text-[#64748b]">Name</div>
                <div className="truncate rounded border border-[#b9cbd1] bg-white px-2 py-2 text-[12px]">{owner}</div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-[9px] font-bold text-[#64748b]">Email</div>
                <div className="truncate rounded border border-[#b9cbd1] bg-white px-2 py-2 text-[12px]">{accountEmail}</div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-[9px] font-bold text-[#64748b]">Plan</div>
                <div className="truncate rounded border border-[#b9cbd1] bg-white px-2 py-2 text-[12px]">No active subscription</div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2.5 border-t border-[#d2dfe3] pt-2.5 text-[10px] text-[#64748b]">
              <span>Active projects (opening balance)</span>
              <strong className="text-[12px] tabular-nums text-[#142a3d]">{sortedProjects.length}</strong>
            </div>
          </div>

          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#d2dfe3] pb-3.5 text-[11px] text-[#64748b]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[3px] bg-[#e7f3ef] px-1.5 py-1 text-[10px] font-bold text-[#0f6556]">{totalFiles} files</span>
              <span>Project movement schedule · dates in local time</span>
            </div>
            {hasMoreProjects && (
              <button
                type="button"
                onClick={() => setProjectsExpanded((open) => !open)}
                className="btn-secondary !px-1.5 !py-0.5 !text-[10px]"
                aria-expanded={projectsExpanded}
              >
                {projectsExpanded ? 'Show less' : `Expand · ${sortedProjects.length - 2} more`}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[11px] tabular-nums">
              <thead>
                <tr>
                  {['Line', 'Project', 'Standard', 'Files', 'Opened', 'Updated'].map((label, index) => (
                    <th key={label} className={`whitespace-nowrap px-1.5 pb-2 pt-2.5 text-[8px] font-bold uppercase tracking-[.045em] text-[#718392] ${index === 0 ? 'text-left' : 'text-right'}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProjects.length === 0 && (
                  <tr className="bg-[#f6f9f9]">
                    <td className="whitespace-nowrap px-1.5 py-2.5 text-left font-bold text-[#0f6556]">—</td>
                    <td colSpan={5} className="whitespace-nowrap px-1.5 py-2.5 text-right text-[#64748b]">
                      No projects yet. <Link href="/workspace/app" className="font-semibold text-[#147b69] hover:underline">Open workspace</Link>
                    </td>
                  </tr>
                )}
                {visibleProjects.map((project, index) => (
                  <tr key={project.id} className={index === visibleProjects.length - 1 ? 'bg-[#f6f9f9]' : undefined}>
                    <td className="whitespace-nowrap border-b border-[#e7edef] px-1.5 py-2.5 text-left font-bold text-[#0f6556]">{index + 1}</td>
                    <td className="whitespace-nowrap border-b border-[#e7edef] px-1.5 py-2.5 text-right">
                      <Link href="/workspace/app" className="font-semibold text-[#142a3d] hover:text-[#147b69] hover:underline">{project.name}</Link>
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e7edef] px-1.5 py-2.5 text-right">{projectStandardLabels[project.standard]}</td>
                    <td className="whitespace-nowrap border-b border-[#e7edef] px-1.5 py-2.5 text-right">{project.files.length}</td>
                    <td className="whitespace-nowrap border-b border-[#e7edef] px-1.5 py-2.5 text-right">{new Date(project.createdAt).toLocaleDateString()}</td>
                    <td className={`whitespace-nowrap px-1.5 py-2.5 text-right ${index === visibleProjects.length - 1 ? '' : 'border-b border-[#e7edef]'}`}>{new Date(latestProjectActivity(project)).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3.5 overflow-x-auto border-t border-[#d2dfe3] pt-3.5">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => setBillingHistoryOpen(true)} className="btn-secondary !px-1.5 !py-0.5 !text-[10px]">Expand</button>
                <Link href="/account/billing" className="btn-ghost !px-1.5 !py-0.5 !text-[10px]">Report</Link>
              </div>
            </div>
            <table className="w-full min-w-[480px] border-collapse text-[11px] tabular-nums">
              <thead>
                <tr>
                  {['Line', 'Opening', 'Charge', 'Payment', 'Closing'].map((label, index) => (
                    <th key={label} className={`whitespace-nowrap px-1.5 pb-2 pt-1 text-[8px] font-bold uppercase tracking-[.045em] text-[#718392] ${index === 0 ? 'text-left' : 'text-right'}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#f6f9f9]">
                  <td className="whitespace-nowrap px-1.5 py-2.5 text-left font-bold text-[#0f6556]">SAMPLE-2026-11</td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 text-right">0.00</td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 text-right">426.99</td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 text-right">0.00</td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 text-right">426.99</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 border-t border-[#d2dfe3] pt-3 text-[10px] text-[#64748b]">
            <strong className="font-semibold text-[#142a3d]">Account schedule view.</strong> Projects are stored in this browser. Billing figures are illustrative only and are not a real invoice.
          </p>
        </article>
      </div>
    </div>

    {billingHistoryOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#152733]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="billing-history-title" onClick={(event) => { if (event.target === event.currentTarget) setBillingHistoryOpen(false); }}>
      <section className="w-full max-w-xl overflow-hidden rounded-[7px] border border-[#d2dfe3] bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.12em] text-[#147b69]">Illustration · Billing</span>
            <h2 id="billing-history-title" className="m-0 text-[15px] font-bold">Billing schedule</h2>
          </div>
          <button type="button" onClick={() => setBillingHistoryOpen(false)} aria-label="Close billing history" className="rounded p-1 text-[#63716d] hover:bg-[#f4f8f8]"><X size={14}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-[11px] tabular-nums">
            <thead>
              <tr>
                {['Line', 'Opening', 'Charge', 'Payment', 'Closing'].map((label, index) => (
                  <th key={label} className={`whitespace-nowrap px-1.5 pb-2 text-[8px] font-bold uppercase tracking-[.045em] text-[#718392] ${index === 0 ? 'text-left' : 'text-right'}`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#f6f9f9]">
                <td className="whitespace-nowrap px-1.5 py-2.5 text-left font-bold text-[#0f6556]">SAMPLE-2026-11</td>
                <td className="whitespace-nowrap px-1.5 py-2.5 text-right">0.00</td>
                <td className="whitespace-nowrap px-1.5 py-2.5 text-right">426.99</td>
                <td className="whitespace-nowrap px-1.5 py-2.5 text-right">0.00</td>
                <td className="whitespace-nowrap px-1.5 py-2.5 text-right">426.99</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-end gap-1.5 border-t border-[#d2dfe3] pt-3">
          <Link href="/account/billing" className="btn-ghost !px-2 !py-1 !text-[10px]">Full report</Link>
          <button type="button" onClick={() => setBillingHistoryOpen(false)} className="btn-primary !px-2 !py-1 !text-[10px]">Close</button>
        </div>
      </section>
    </div>}
  </main>;
}

export function AccountRoute() {
  return <><Show when="signed-in"><AccountProjectsPage/></Show><Show when="signed-out"><Redirect to="/"/></Show></>;
}

const sampleBillingRows = [
  { date: '2026-11-01', invoice: 'SAMPLE-2026-11', item: 'All-report subscription · IFRS 16, IFRS 9, IFRS 17', period: 'Monthly', amount: 6.99, tax: 'Not shown', status: 'Sample only' },
  { date: '2026-11-01', invoice: 'SAMPLE-2026-11', item: 'Light support', period: 'Monthly', amount: 120, tax: 'Excluded', status: 'Sample only' },
  { date: '2026-11-01', invoice: 'SAMPLE-2026-11', item: 'Dedicated technical support', period: 'Monthly', amount: 300, tax: 'Excluded', status: 'Sample only' },
];

export function AccountBillingPage() {
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
            <button type="button" onClick={downloadCsv} className="btn-primary"><ArrowDownToLine size={15}/> Download CSV</button>
            <button type="button" onClick={() => window.print()} className="btn-secondary">Print / Save PDF</button>
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

export function AccountBillingRoute() {
  return <><Show when="signed-in"><AccountBillingPage/></Show><Show when="signed-out"><Redirect to="/"/></Show></>;
}
