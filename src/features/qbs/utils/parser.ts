import { MCQData } from '../types';

function replaceMatchingParentheses(str: string, funcName: string, latexFuncName: string): string {
  let index = str.indexOf(funcName + '(');
  while (index !== -1) {
    const startIdx = index + funcName.length;
    let openCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < str.length; i++) {
      if (str[i] === '(') {
        openCount++;
      } else if (str[i] === ')') {
        openCount--;
        if (openCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      const inner = str.slice(startIdx + 1, endIdx);
      const processedInner = convertAsciiMathToTex(inner);
      str = str.slice(0, index) + `${latexFuncName}{${processedInner}}` + str.slice(endIdx + 1);
    } else {
      break;
    }
    index = str.indexOf(funcName + '(');
  }
  return str;
}

function parseFractions(str: string): string {
  let idx = str.indexOf('/');
  while (idx !== -1) {
    let numEnd = idx;
    let numStart = numEnd;
    let numText = '';

    if (numEnd > 0) {
      if (str[numEnd - 1] === ')') {
        let count = 1;
        let i = numEnd - 2;
        while (i >= 0 && count > 0) {
          if (str[i] === ')') count++;
          else if (str[i] === '(') count--;
          i--;
        }
        numStart = i + 1;
        numText = str.slice(numStart + 1, numEnd - 1);
      } else {
        let i = numEnd - 1;
        while (i >= 0 && /[a-zA-Z0-9_\-^]/.test(str[i])) {
          i--;
        }
        numStart = i + 1;
        numText = str.slice(numStart, numEnd);
      }
    }

    let denStart = idx + 1;
    let denEnd = denStart;
    let denText = '';

    if (denStart < str.length) {
      if (str[denStart] === '(') {
        let count = 1;
        let i = denStart + 1;
        while (i < str.length && count > 0) {
          if (str[i] === '(') count++;
          else if (str[i] === ')') count--;
          i++;
        }
        denEnd = i;
        denText = str.slice(denStart + 1, denEnd - 1);
      } else {
        let i = denStart;
        while (i < str.length && /[a-zA-Z0-9_\-^]/.test(str[i])) {
          i++;
        }
        denEnd = i;
        denText = str.slice(denStart, denEnd);
      }
    }

    const procNum = convertAsciiMathToTex(numText);
    const procDen = convertAsciiMathToTex(denText);
    const replacement = `\\frac{${procNum}}{${procDen}}`;

    str = str.slice(0, numStart) + replacement + str.slice(denEnd);
    idx = str.indexOf('/', numStart + replacement.length);
  }
  return str;
}

export function convertAsciiMathToTex(ascii: string): string {
  let tex = ascii;

  tex = tex.replace(/&nbsp;/g, ' ');
  tex = tex.replace(/&amp;/g, '&');
  tex = tex.replace(/&lt;/g, '<');
  tex = tex.replace(/&gt;/g, '>');
  tex = tex.replace(/&quot;/g, '"');

  tex = replaceMatchingParentheses(tex, 'sqrt', '\\sqrt');
  tex = parseFractions(tex);

  // Process vector notations
  tex = tex.replace(/vec\(([a-zA-Z])\)/g, '\\vec{$1}');
  tex = tex.replace(/vec([a-zA-Z])/g, '\\vec{$1}');
  tex = tex.replace(/ul\(([a-zA-Z])\)/g, '\\underline{$1}');
  tex = tex.replace(/ul([a-zA-Z])/g, '\\underline{$1}');
  tex = tex.replace(/hat\(([a-zA-Z])\)/g, '\\hat{$1}');
  tex = tex.replace(/hat([a-zA-Z])/g, '\\hat{$1}');
  tex = tex.replace(/bar\(([a-zA-Z])\)/g, '\\bar{$1}');
  tex = tex.replace(/bar([a-zA-Z])/g, '\\bar{$1}');
  tex = tex.replace(/\*/g, '\\times');

  const symbolsMap: { [key: string]: string } = {
    'theta': '\\theta',
    'alpha': '\\alpha',
    'beta': '\\beta',
    'gamma': '\\gamma',
    'delta': '\\delta',
    'epsilon': '\\epsilon',
    'zeta': '\\zeta',
    'eta': '\\eta',
    'iota': '\\iota',
    'kappa': '\\kappa',
    'lambda': '\\lambda',
    'mu': '\\mu',
    'nu': '\\nu',
    'xi': '\\xi',
    'omicron': '\\omicron',
    'pi': '\\pi',
    'rho': '\\rho',
    'sigma': '\\sigma',
    'tau': '\\tau',
    'upsilon': '\\upsilon',
    'phi': '\\phi',
    'chi': '\\chi',
    'psi': '\\psi',
    'omega': '\\omega',
    'Theta': '\\Theta',
    'Delta': '\\Delta',
    'Lambda': '\\Lambda',
    'Phi': '\\Phi',
    'Psi': '\\Psi',
    'Omega': '\\Omega',
    'sin': '\\sin',
    'cos': '\\cos',
    'tan': '\\tan',
    'sec': '\\sec',
    'csc': '\\csc',
    'cot': '\\cot',
    'sinh': '\\sinh',
    'cosh': '\\cosh',
    'tanh': '\\tanh',
    'log': '\\log',
    'ln': '\\ln',
    'lim': '\\lim',
    'int': '\\int ',
    'oint': '\\oint',
    'sum': '\\sum',
    'prod': '\\prod',
    'grad': '\\nabla',
    'del': '\\partial',
    'oo': '\\infty',
    'xx': '\\times',
    '==': '=',
    '!=': '\\ne',
    '<=': '\\le',
    '>=': '\\ge',
    '+-': '\\pm',
    '->': '\\rightarrow',
    '<-': '\\leftarrow',
    '=>': '\\Rightarrow'
  };

  Object.keys(symbolsMap).forEach(key => {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
    tex = tex.replace(regex, symbolsMap[key]);
  });

  return tex;
}

const cleanMathHtml = (element: HTMLElement) => {
  // 1. Process MathJax script tags first (MathJax v2 style, supporting tex, asciimath, etc.)
  const mathjaxScripts = Array.from(element.querySelectorAll('script[type^="math/"]'));
  mathjaxScripts.forEach(scriptEl => {
    const type = scriptEl.getAttribute('type') || '';
    const isAsciiMath = type.includes('asciimath');
    let latex = (scriptEl.textContent || '').trim();
    if (isAsciiMath) {
      latex = convertAsciiMathToTex(latex);
    }
    
    const isBlock = type.includes('mode=display');
    const replacementText = isBlock ? `$$${latex}$$` : `$${latex}$`;
    const textNode = document.createTextNode(replacementText);
    
    // Remove associated MathJax frame/previews if they exist as siblings
    const id = scriptEl.getAttribute('id');
    if (id) {
      const frameId = `${id}-Frame`;
      const frameEl = element.querySelector(`[id="${frameId}"]`);
      if (frameEl) {
        frameEl.remove();
      }
    }
    
    // Remove any immediate previous siblings that are previews or containers
    let prev = scriptEl.previousElementSibling;
    while (prev && (
      prev.classList.contains('MathJax_Preview') || 
      prev.classList.contains('MathJax') || 
      prev.classList.contains('MathJax_Display') ||
      prev.classList.contains('MathJax_Element') ||
      prev.className.includes('MathJax') ||
      prev.className.includes('mjx-') ||
      prev.tagName.toLowerCase() === 'mjx-container'
    )) {
      const toRemove = prev;
      prev = prev.previousElementSibling;
      toRemove.remove();
    }

    // Remove any immediate next siblings that are previews or containers
    let next = scriptEl.nextElementSibling;
    while (next && (
      next.classList.contains('MathJax_Preview') || 
      next.classList.contains('MathJax') || 
      next.classList.contains('MathJax_Display') ||
      next.classList.contains('MathJax_Element') ||
      next.className.includes('MathJax') ||
      next.className.includes('mjx-') ||
      next.tagName.toLowerCase() === 'mjx-container'
    )) {
      const toRemove = next;
      next = next.nextElementSibling;
      toRemove.remove();
    }

    scriptEl.parentNode?.replaceChild(textNode, scriptEl);
  });

  // 2. Process any containers with TeX annotations (KaTeX, MathJax v3, etc.)
  const annotatedContainers = Array.from(element.querySelectorAll('.katex, mjx-container, .MathJax, .MathJax_Element, [class*="MathJax"]'));
  annotatedContainers.forEach(container => {
    const annotation = container.querySelector('annotation[encoding="application/x-tex"]');
    if (annotation && annotation.textContent) {
      const isBlock = container.classList.contains('katex-display') || 
                      container.parentElement?.classList.contains('katex-display') ||
                      container.getAttribute('display') === 'true' ||
                      container.getAttribute('mode') === 'display';
      const latex = annotation.textContent.trim();
      const replacementText = isBlock ? `$$${latex}$$` : `$${latex}$`;
      const textNode = document.createTextNode(replacementText);
      container.parentNode?.replaceChild(textNode, container);
    }
  });

  // 3. Remove all leftover math elements/containers to avoid duplicate flat displays
  const leftovers = Array.from(element.querySelectorAll(
    '.katex, mjx-container, [class*="MathJax"], [class*="mjx-"], [class*="MJX"], .MathJax_Preview'
  ));
  leftovers.forEach(el => {
    el.remove();
  });
};

export const parseHtmlToMcqs = (htmlInput: string): MCQData[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlInput, 'text/html');
  
  const results: MCQData[] = [];

  // Find all unique option groups
  const optionElements = doc.querySelectorAll('.option');
  const groupContainers: Element[] = [];
  optionElements.forEach(opt => {
    let container = opt.closest('form, ol, ul, .options, .answer-wrapper');
    if (!container) {
      container = opt.parentElement;
    }
    if (container && !groupContainers.includes(container)) {
      groupContainers.push(container);
    }
  });

  const uniqueGroups = groupContainers.filter(c => {
    let parent = c.parentElement;
    while (parent) {
      if (groupContainers.includes(parent)) {
        return false;
      }
      parent = parent.parentElement;
    }
    return true;
  });

  // For each unique option group, extract the MCQ data
  uniqueGroups.forEach((groupContainer) => {
    // 1. Extract Options
    const optionsList = Array.from(groupContainer.querySelectorAll('.option'));
    const optionsData = Array.from({ length: 5 }, () => ({ text: '', image: '' }));
    const correctIndices: number[] = [];
    
    optionsList.slice(0, 5).forEach((optEl, idx) => {
      const optClone = optEl.cloneNode(true) as HTMLElement;
      
      // Remove checkmarks or feedback elements inside options
      const checkEl = optClone.querySelector('span[id*="_check"], .check, .fa-solid');
      if (checkEl) {
        checkEl.remove();
      }
      // Also remove generic spans that might be styling or checkmarks, keeping Math containers intact
      const spans = optClone.querySelectorAll('span');
      spans.forEach(s => {
        if (s.closest('.katex, .MathJax, mjx-container')) {
          return;
        }
        if (s.classList.contains('katex') || s.classList.contains('MathJax')) {
          return;
        }
        s.remove();
      });

      cleanMathHtml(optClone);

      // Extract text
      let optText = '';
      const labelEl = optClone.querySelector('label');
      if (labelEl) {
        optText = labelEl.innerHTML.trim();
      } else {
        optText = optClone.innerHTML.trim();
      }

      const optImg = optClone.querySelector('img');
      const optImgSrc = optImg ? optImg.getAttribute('src') || '' : '';
      if (optImg) {
        optImg.remove();
      }

      // Clean up HTML and strip prefixes like "ক. ", "খ. ", "A. ", etc.
      optText = optText.replace(/&nbsp;/g, ' ').trim();
      optText = optText.replace(/^\s*[কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহঅআইঈউঊঋএঐওঔA-Za-z1-2-3-4-5A-Ea-e]\s*[\.\,-–—]\s*/, '');
      optText = optText.trim();

      optionsData[idx] = {
        text: optText,
        image: optImgSrc
      };
      
      if (optEl.classList.contains('answer')) {
        correctIndices.push(idx + 1);
      }
    });
    
    const correct_options = correctIndices.join(',');

    // 2. Extract Question Body, Blockquote, and Tags
    const cardWrapper = groupContainer.closest('.q-card, .question, .folder, .question-card, .card');
    
    let outerContainer = groupContainer;
    const formParent = groupContainer.closest('form, .answer-wrapper');
    if (formParent) {
      outerContainer = formParent;
    }

    let questionBodyEl: Element | null = null;
    if (cardWrapper) {
      questionBodyEl = cardWrapper.querySelector('.question-body');
    }
    
    if (!questionBodyEl) {
      let prevSibling = outerContainer.previousSibling;
      while (prevSibling) {
        if (prevSibling instanceof Element) {
          if (prevSibling.classList.contains('question-body')) {
            questionBodyEl = prevSibling;
            break;
          }
          if (prevSibling.querySelector('.option') || prevSibling.classList.contains('option')) {
            break;
          }
          const innerQB = prevSibling.querySelector('.question-body');
          if (innerQB) {
            questionBodyEl = innerQB;
            break;
          }
        }
        prevSibling = prevSibling.previousSibling;
      }
    }

    let question = '';
    let question_image = '';

    if (questionBodyEl) {
      const qClone = questionBodyEl.cloneNode(true) as HTMLElement;
      const qImg = qClone.querySelector('img');
      question_image = qImg ? qImg.getAttribute('src') || '' : '';
      if (qImg) {
        qImg.remove();
      }
      cleanMathHtml(qClone);
      question = qClone.innerHTML.trim();
    } else {
      // FALLBACK: Collect all preceding sibling nodes
      let sibling = outerContainer.previousSibling;
      const questionNodes: Node[] = [];
      while (sibling) {
        if (sibling instanceof Element) {
          if (sibling.querySelector('.option') || sibling.classList.contains('option')) {
            break;
          }
        }
        questionNodes.push(sibling);
        sibling = sibling.previousSibling;
      }
      questionNodes.reverse();

      const tempDiv = doc.createElement('div');
      questionNodes.forEach(node => {
        tempDiv.appendChild(node.cloneNode(true));
      });

      // Clean up tempDiv
      const tagsToRemove = tempDiv.querySelectorAll('.tag-container, .tag, .reaction');
      tagsToRemove.forEach(el => el.remove());

      const qImg = tempDiv.querySelector('img');
      question_image = qImg ? qImg.getAttribute('src') || '' : '';
      if (qImg) {
        qImg.remove();
      }
      cleanMathHtml(tempDiv);
      question = tempDiv.innerHTML.trim();
    }

    // 3. Extract Blockquote (Explanation)
    let blockquoteEl: Element | null = null;
    if (cardWrapper) {
      blockquoteEl = cardWrapper.querySelector('blockquote');
    }
    
    if (!blockquoteEl) {
      let nextSibling = outerContainer.nextSibling;
      while (nextSibling) {
        if (nextSibling instanceof Element) {
          if (nextSibling.querySelector('.option') || nextSibling.classList.contains('option')) {
            break;
          }
          const bq = nextSibling.tagName.toLowerCase() === 'blockquote' ? nextSibling : nextSibling.querySelector('blockquote');
          if (bq) {
            blockquoteEl = bq;
            break;
          }
        }
        nextSibling = nextSibling.nextSibling;
      }
    }
    if (!blockquoteEl) {
      blockquoteEl = outerContainer.querySelector('blockquote');
    }

    let explanation = '';
    let explanation_image = '';
    if (blockquoteEl) {
      const bqClone = blockquoteEl.cloneNode(true) as HTMLElement;
      const bqImg = bqClone.querySelector('img');
      explanation_image = bqImg ? bqImg.getAttribute('src') || '' : '';
      if (bqImg) {
        bqImg.remove();
      }
      cleanMathHtml(bqClone);
      explanation = bqClone.innerHTML.trim();
    }

    // 4. Extract Tags (Preceding and succeeding tag elements)
    const tagElements: Element[] = [];
    if (cardWrapper) {
      const innerTags = cardWrapper.querySelectorAll('.tag');
      innerTags.forEach(t => {
        if (t.textContent && t.textContent.trim()) {
          tagElements.push(t);
        }
      });
    }
    
    if (tagElements.length === 0) {
      let siblingBefore = outerContainer.previousSibling;
      while (siblingBefore) {
        if (siblingBefore instanceof Element) {
          if (siblingBefore.querySelector('.option') || siblingBefore.classList.contains('option')) {
            break;
          }
          if (siblingBefore.classList.contains('tag')) {
            tagElements.push(siblingBefore);
          } else {
            const innerTags = siblingBefore.querySelectorAll('.tag');
            innerTags.forEach(t => {
              if (t.textContent && t.textContent.trim()) {
                tagElements.push(t);
              }
            });
          }
        }
        siblingBefore = siblingBefore.previousSibling;
      }
      tagElements.reverse(); // Maintain original order

      let siblingAfter = outerContainer.nextSibling;
      while (siblingAfter) {
        if (siblingAfter instanceof Element) {
          if (siblingAfter.querySelector('.option') || siblingAfter.classList.contains('option')) {
            break;
          }
          if (siblingAfter.classList.contains('tag')) {
            tagElements.push(siblingAfter);
          } else {
            const innerTags = siblingAfter.querySelectorAll('.tag');
            innerTags.forEach(t => {
              if (t.textContent && t.textContent.trim()) {
                tagElements.push(t);
              }
            });
          }
        }
        siblingAfter = siblingAfter.nextSibling;
      }
    }

    // Smart regex assignment for tags
    let paper_id = '';
    let chapter_id = '';
    let topic_id = '';

    const paperRegex = /^[a-zA-Z]-\d+$/i;
    const chapterRegex = /[a-zA-Z]-\d+\.(\d+)/i;
    const chapterRegexFallback = /\.(\d+)/;
    const bengaliRegex = /[\u0980-\u09FF]/;

    const matchedPaperEl = tagElements.find(el => paperRegex.test((el.textContent || '').trim()));
    const matchedChapterEl = tagElements.find(el => chapterRegex.test((el.textContent || '').trim()) || chapterRegexFallback.test((el.textContent || '').trim()));
    const matchedTopicEl = tagElements.find(el => bengaliRegex.test((el.textContent || '').trim()));

    if (matchedPaperEl) {
      paper_id = (matchedPaperEl.textContent || '').trim().toLowerCase().replace(/[-\s]/g, '');
    } else if (tagElements[0]) {
      paper_id = (tagElements[0].textContent || '').trim().toLowerCase().replace(/[-\s]/g, '');
    }

    if (matchedChapterEl) {
      const text = (matchedChapterEl.textContent || '').trim();
      const match = text.match(/\.(\d+)/);
      if (match) {
        chapter_id = match[1];
      }
    } else if (tagElements[1]) {
      const text = (tagElements[1].textContent || '').trim();
      const match = text.match(/\.(\d+)/);
      if (match) {
        chapter_id = match[1];
      } else {
        const parts = text.split('.');
        if (parts.length > 1) {
          chapter_id = parts[1].trim();
        }
      }
    }

    if (matchedTopicEl) {
      topic_id = (matchedTopicEl.textContent || '').trim();
    } else if (tagElements[2]) {
      topic_id = (tagElements[2].textContent || '').trim();
    }

    const type_id = '';

    results.push({
      question,
      question_image,
      option_1: optionsData[0].text,
      option_1_image: optionsData[0].image,
      option_2: optionsData[1].text,
      option_2_image: optionsData[1].image,
      option_3: optionsData[2].text,
      option_3_image: optionsData[2].image,
      option_4: optionsData[3].text,
      option_4_image: optionsData[3].image,
      option_5: optionsData[4].text,
      option_5_image: optionsData[4].image,
      correct_options,
      explanation,
      explanation_image,
      type_id,
      paper_id,
      chapter_id,
      topic_id
    });
  });

  return results;
};

export const generateCsvFromMcqs = (results: MCQData[]): string => {
  const header = 'question,question_image,option_1,option_1_image,option_2,option_2_image,option_3,option_3_image,option_4,option_4_image,option_5,option_5_image,correct_options,explanation,explanation_image,type_id,paper_id,chapter_id,topic_id';
  
  const escapeCSV = (str: string) => {
    return str.replace(/"/g, '""');
  };
  
  const rows = results.map(row => {
    return [
      `"${escapeCSV(row.question)}"`,
      `"${escapeCSV(row.question_image)}"`,
      `"${escapeCSV(row.option_1)}"`,
      `"${escapeCSV(row.option_1_image)}"`,
      `"${escapeCSV(row.option_2)}"`,
      `"${escapeCSV(row.option_2_image)}"`,
      `"${escapeCSV(row.option_3)}"`,
      `"${escapeCSV(row.option_3_image)}"`,
      `"${escapeCSV(row.option_4)}"`,
      `"${escapeCSV(row.option_4_image)}"`,
      `"${escapeCSV(row.option_5)}"`,
      `"${escapeCSV(row.option_5_image)}"`,
      row.correct_options, // No quotes for correct_options (Rule 15)
      `"${escapeCSV(row.explanation)}"`,
      `"${escapeCSV(row.explanation_image)}"`,
      `"${escapeCSV(row.type_id)}"`,
      `"${escapeCSV(row.paper_id)}"`,
      `"${escapeCSV(row.chapter_id)}"`,
      `"${escapeCSV(row.topic_id)}"`
    ].join(',');
  });
  
  return [header, ...rows].join('\n');
};
