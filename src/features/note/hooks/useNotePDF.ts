import { RefObject } from 'react';
import { partitionContentToPages } from '../utils/measuredPages';
import { renderAndDownloadNote } from '../utils/pdfRenderEngine';
import { triggerBlobDownload } from '../utils/triggerDownload';

export function useNotePDF() {
  const exportPDF = async (
    title: string,
    userDisplayName: string,
    notePrintRef: RefObject<HTMLDivElement | null>
  ): Promise<void> => {
    if (!notePrintRef.current) return;
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const sourceContainer = notePrintRef.current.querySelector('.markdown-body') as HTMLElement;
    if (!sourceContainer) throw new Error("Could not find note render target.");

    const pageGroups = partitionContentToPages(sourceContainer, 863, 1003);
    const pdfBlob = await renderAndDownloadNote(title, userDisplayName, pageGroups);
    triggerBlobDownload(pdfBlob, title);
  };

  return { exportPDF };
}
