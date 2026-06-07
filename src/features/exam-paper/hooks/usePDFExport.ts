/* src/features/exam-paper/hooks/usePDFExport.ts */
import { useState, RefObject } from 'react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export function usePDFExport(paperRef: RefObject<HTMLDivElement>, title: string) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);
    
    try {
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const element = paperRef.current;
      const dataUrl = await toPng(element, { 
        cacheBust: true,
        backgroundColor: '#ffffff',
      });
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      
      // Calculate image dimensions to fit page
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= 297;

      while (heightLeft > 0.5) {
        position -= 297;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= 297;
      }
      
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadPDF, isDownloading };
}
