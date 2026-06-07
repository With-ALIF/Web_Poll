import { QuizQuestion } from '../../../types';

export function exportToCSV(questions: QuizQuestion[], suffix: string = '1', filename: string = '') {
  // Define CSV headers exactly as requested
  const headers = [
    'questions',
    'option1',
    'option2',
    'option3',
    'option4',
    'option5',
    'answer',
    'explanation',
    'type',
    'section'
  ];

  const escapeCSV = (field: any) => {
    if (field === null || field === undefined || field === '') return '';
    const str = String(field);
    return `"${str.replace(/"/g, '""')}"`;
  };


  const rows = questions.map(q => {
    const opt1 = q.options[0] || '';
    const opt2 = q.options[1] || '';
    const opt3 = q.options[2] || '';
    const opt4 = q.options[3] || '';
    const opt5 = q.options[4] || '';
    
    const answer = q.correctOptionIndex + 1;
    
    // Logic for Rayvila format based on user request:
    // Type is always 1, Section is the suffix value (defaulting to 1)
    const sValue = suffix.trim() || '1';
    const qType = 1;
    const qSection = sValue;

    const fullQuestion = q.image 
      ? `${q.question} <br />\r\n<img class="qimg" src="${q.image}">` 
      : q.question;

    const fields = [
      escapeCSV(fullQuestion),
      escapeCSV(opt1),
      escapeCSV(opt2),
      escapeCSV(opt3),
      escapeCSV(opt4),
      escapeCSV(opt5),
      answer, // Number - no quotes
      escapeCSV(q.explanation || ''),
      // Type/Section handling: Based on the new rule: Type=1, Section=Suffix
      qType,
      isNaN(Number(qSection)) ? escapeCSV(qSection) : qSection
    ];

    return fields.join(',');
  });

  // Build CSV content with headers and CRLF line endings
  const csvContent = [
    headers.join(','),
    ...rows
  ].join('\r\n');

  // Create and trigger download with UTF-8 BOM for proper Bengali character support
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const finalFilename = filename.trim() 
    ? `${filename.trim().replace(/\s+/g, '_')}.csv` 
    : `rayvila_export_${Math.floor(Date.now() / 1000)}.csv`;
    
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
