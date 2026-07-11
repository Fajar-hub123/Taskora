import { Task } from '../types';

export function exportTasksCSV(tasks: Task[], filename = 'taskora-export.csv') {
  const headers = ['Title', 'Category', 'Subcategory', 'Date', 'Start', 'End', 'Priority', 'Status', 'Notes'];
  const rows = tasks.map((t) => [t.title, t.categoryId, t.subcategory, t.date, t.startTime, t.endTime, t.priority, t.status, t.notes]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportTasksPDF(tasks: Task[], categoryNames: Record<string, string>, filename = 'taskora-report.pdf') {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Taskora — Task Report', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [['Title', 'Category', 'Date', 'Priority', 'Status']],
    body: tasks.map((t) => [t.title, categoryNames[t.categoryId] ?? '—', t.date, t.priority, t.status]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [139, 92, 246] }
  });

  doc.save(filename);
}
