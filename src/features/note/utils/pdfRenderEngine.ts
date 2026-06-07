import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { createA4PageElement } from './pageElementBuilder';

export async function renderAndDownloadNote(
  title: string,
  userDisplayName: string,
  pagesData: Array<{ elements: HTMLElement[] }>
): Promise<Blob> {
  const totalPages = pagesData.length;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  const renderZone = document.createElement('div');
  renderZone.className = "fixed top-0 left-0 opacity-0 pointer-events-none z-[-200]";
  document.body.appendChild(renderZone);

  for (let index = 0; index < totalPages; index++) {
    const pageNum = index + 1;
    const pageElement = createA4PageElement(
      pageNum,
      totalPages,
      title,
      userDisplayName,
      pagesData[index].elements
    );

    renderZone.appendChild(pageElement);

    const dataUrl = await toPng(pageElement, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      style: { transform: 'scale(1)', transformOrigin: 'top left' }
    });

    if (pageNum > 1) {
      pdf.addPage();
    }
    pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    renderZone.removeChild(pageElement);
  }

  document.body.removeChild(renderZone);
  return pdf.output('blob');
}
