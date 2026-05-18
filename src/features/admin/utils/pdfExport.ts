import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuizQuestion } from '../../../types';
import { AdminUser } from '../types';

export const generateGlobalUserReportPDF = (users: AdminUser[]) => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 40, 'F');
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('Global User Quiz Statistics', 14, 25);
  
  // Report Meta Info
  doc.setFontSize(9);
  doc.setTextColor(215, 215, 255);
  doc.text(`Total Users: ${users.length}`, 14, 33);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);
  
  const totalGenerated = users.reduce((sum, user) => sum + (user.stats?.generated || 0), 0);
  const totalSent = users.reduce((sum, user) => sum + (user.stats?.sent || 0), 0);

  const tableRows = users.map((user, index) => [
    index + 1,
    user.displayName || user.email || 'Anonymous',
    user.stats?.generated || 0,
    user.stats?.sent || 0
  ]);
  
  // Add total row
  tableRows.push([
    '',
    'SUMMARY TOTAL',
    totalGenerated,
    totalSent
  ]);
  
  autoTable(doc, {
    startY: 50,
    head: [['No.', 'User Name', 'Quizzes Generated', 'Quizzes Sent']],
    body: tableRows,
    theme: 'striped',
    headStyles: { 
      fillColor: [79, 70, 229], 
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: { 
      fontSize: 10, 
      cellPadding: 5,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [224, 231, 255]; // Indigo 100
        data.cell.styles.textColor = [67, 56, 202]; // Indigo 700
      }
    }
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} | TeleQuiz Admin Board`, 105, 290, { align: 'center' });
  }

  doc.save(`TeleQuiz_User_Report_${new Date().getTime()}.pdf`);
};

export const generateUserQuizPDF = (displayName: string, email: string, quizzes: QuizQuestion[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('User Quiz Report', 14, 22);
  
  // Add user info
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`User: ${displayName}`, 14, 32);
  doc.text(`Email: ${email}`, 14, 38);
  doc.text(`Total Quizzes: ${quizzes.length}`, 14, 44);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 50);
  
  // Add table
  const tableRows = quizzes.map((q, index) => [
    index + 1,
    q.question,
    q.options.join(', '),
    q.options[q.correctOptionIndex],
    q.topic || 'General',
    q.status || 'pending'
  ]);
  
  autoTable(doc, {
    startY: 60,
    head: [['#', 'Question', 'Options', 'Answer', 'Topic', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 }
    }
  });
  
  const fileName = `${displayName.replace(/\s+/g, '_')}_quiz_list.pdf`;
  doc.save(fileName);
};
