export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = `${fileName.replace(/\s+/g, '_')}_note.pdf`;
  downloadLink.target = '_blank';
  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  }, 250);
}
