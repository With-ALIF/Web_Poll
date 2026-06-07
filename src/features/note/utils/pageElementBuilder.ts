export function createA4PageElement(
  pageNum: number,
  totalPages: number,
  title: string,
  userDisplayName: string,
  elements: HTMLElement[]
): HTMLDivElement {
  const pageElement = document.createElement('div');
  pageElement.className = "bg-white text-slate-900 flex flex-col justify-between font-sans box-border shadow-none rounded-none";
  pageElement.style.width = "794px";
  pageElement.style.height = "1123px";
  pageElement.style.minHeight = "1123px";
  pageElement.style.maxHeight = "1123px";
  pageElement.style.padding = "48px";
  pageElement.style.boxSizing = "border-box";
  pageElement.style.fontFamily = "'Kalpurush', 'Hind Siliguri', 'Inter', sans-serif";

  const contentBody = document.createElement('div');
  contentBody.className = "flex-1 overflow-hidden flex flex-col pt-4";

  if (pageNum === 1) {
    const metaDiv = document.createElement('div');
    metaDiv.className = "mb-5 bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-1.5 shrink-0";
    metaDiv.innerHTML = `
      <span class="text-[9px] text-indigo-600 font-black uppercase tracking-wider">Note Title</span>
      <h1 class="text-xl font-black text-slate-900 tracking-tight leading-tight">${title}</h1>
      <div class="flex items-center gap-6 mt-2 pt-2 border-t border-slate-200/50 text-[9px] text-slate-400 font-bold font-mono">
        <div><span>CREATED BY:</span> <span class="text-slate-600">${userDisplayName}</span></div>
        <div><span>DATE:</span> <span class="text-slate-600">${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
      </div>
    `;
    contentBody.appendChild(metaDiv);
  }

  const mdBody = document.createElement('div');
  mdBody.className = "markdown-body text-sm leading-relaxed text-slate-800 pr-1 flex-1";
  elements.forEach((el) => {
    mdBody.appendChild(el.cloneNode(true));
  });
  
  contentBody.appendChild(mdBody);
  pageElement.appendChild(contentBody);

  const footerDiv = document.createElement('div');
  footerDiv.className = "border-t border-slate-100 pt-4 mt-5 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider shrink-0";
  footerDiv.innerHTML = `<span>Power by TELEQUIZ</span><span>Page ${pageNum} of ${totalPages}</span>`;
  pageElement.appendChild(footerDiv);

  return pageElement;
}
