import type { Dataset } from '@/lib/workspace-types';

export const demo: Dataset = {
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

export const catalog = [
  { group:'Explore', items:[['Descriptive summary','Center, spread, and missingness'],['Frequency table','Counts and proportions by category'],['Histogram','Inspect a numeric distribution'],['Box plot','Compare spread and outliers'],['Normality check','Assess shape and skew']] },
  { group:'Compare', items:[['Independent t-test','Compare two independent group means'],['Paired t-test','Compare paired measurements'],['One-way ANOVA','Compare means across 3+ groups'],['Mann–Whitney U','Non-parametric two-group comparison'],['Kruskal–Wallis','Non-parametric multi-group comparison']] },
  { group:'Relate', items:[['Pearson correlation','Linear association between two fields'],['Spearman correlation','Rank-based association'],['Linear regression','Model a continuous outcome'],['Chi-square test','Association between categories']] },
  { group:'Prepare', items:[['Filter rows','Subset records with a condition'],['Missing values','Audit gaps across fields'],['Standardize values','Rescale numeric fields'],['Random sample','Draw a reproducible subset']] },
];

export function parseDelimited(text: string, delimiter: string): string[][] {
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
export function toDataset(text: string, name: string, delimiter: string): Dataset {
  const raw = parseDelimited(text.replace(/^\uFEFF/, ''), delimiter);
  return toDatasetFromMatrix(raw, name);
}
export function toDatasetFromMatrix(raw: unknown[][], name: string): Dataset {
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
export const columnLetter = (index: number) => {
  let number = index + 1, label = '';
  while (number > 0) { const remainder = (number - 1) % 26; label = String.fromCharCode(65 + remainder) + label; number = Math.floor((number - 1) / 26); }
  return `Column ${label}`;
};
export const nums = (rows: Dataset['rows'], field: string) => rows.map((r) => r[field]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
export const mean = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
export const variance = (a: number[]) => a.length > 1 ? a.reduce((s, v) => s + (v - mean(a)) ** 2, 0) / (a.length - 1) : 0;
export const fmt = (n: number, digits = 2) => Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits }) : '—';
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
export const twoSidedTPValue = (t: number, degreesOfFreedom: number) => regularizedBeta(degreesOfFreedom / (degreesOfFreedom + t * t), degreesOfFreedom / 2, 0.5);
export const numericFields = (d: Dataset) => d.columns.filter((c) => c.type === 'number').map((c) => c.name);
