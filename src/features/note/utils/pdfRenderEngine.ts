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
  // Render the elements off-screen or invisible within boundaries to ensure toPng can measure correct coordinates
  renderZone.style.position = 'fixed';
  renderZone.style.top = '0';
  renderZone.style.left = '0';
  renderZone.style.width = '794px';
  renderZone.style.height = '1123px';
  renderZone.style.opacity = '0.99'; // Some rendering engines require visibility
  renderZone.style.pointerEvents = 'none';
  renderZone.style.zIndex = '-9999';
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

    // Give the browser a small pause to parse layout styles fully
    await new Promise(resolve => setTimeout(resolve, 60));

    // Wait for a secure capture using toPng with skipFonts to prevent crawling font links and hanging
    const dataUrl = await toPng(pageElement, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      skipFonts: true,
      width: 794,
      height: 1123,
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
