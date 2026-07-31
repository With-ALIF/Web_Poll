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
  if (!ascii) return '';
  let tex = ascii;

  // Rule 31: Clean HTML entities first
  tex = tex.replace(/&nbsp;/g, ' ');
  tex = tex.replace(/&amp;/g, '&');
  tex = tex.replace(/&lt;/g, '<');
  tex = tex.replace(/&gt;/g, '>');
  tex = tex.replace(/&quot;/g, '"');

  // Rule 2: Remove any HTML tags that might have leaked into math
  tex = tex.replace(/<[^>]+>/g, '');

  // Rule 5: Square Root
  tex = tex.replace(/√\s*([a-zA-Z0-9]+)/g, '\\sqrt{$1}');
  tex = tex.replace(/√\s*\(([^)]+)\)/g, '\\sqrt{$1}');
  tex = tex.replace(/sqrt\s*([a-zA-Z0-9]+)/g, '\\sqrt{$1}');
  tex = replaceMatchingParentheses(tex, 'sqrt', '\\sqrt');

  // Rule 4: Fraction
  tex = parseFractions(tex);

  // Rule 4b: Exponents (including negative ones)
  // Ensure exponents use braces e.g. T^-2 -> T^{-2}
  tex = tex.replace(/\^([-+]?[a-zA-Z0-9]+)/g, (match, p1) => {
    return `^{${p1}}`;
  });
  // Clean up potential double braces from previous logic
  tex = tex.replace(/\^\{\{([^\}]+)\}\}/g, '^{$1}');

  // Rule 18 & 19: Vector notations and Unit vectors
  tex = tex.replace(/vec\s*\(\s*([a-zA-Z])\s*\)/g, '\\vec{$1}');
  tex = tex.replace(/vec\s*([a-zA-Z])/g, '\\vec{$1}');
  tex = tex.replace(/ul\s*\(\s*([a-zA-Z])\s*\)/g, '\\underline{$1}');
  tex = tex.replace(/ul\s*([a-zA-Z])/g, '\\underline{$1}');
  tex = tex.replace(/hat\s*\(\s*([a-zA-Z])\s*\)/g, '\\hat{$1}');
  tex = tex.replace(/hat\s*([a-zA-Z])/g, '\\hat{$1}');
  
  // Rule 20: Overline
  tex = tex.replace(/bar\s*\(\s*([a-zA-Z])\s*\)/g, '\\bar{$1}');
  tex = tex.replace(/bar\s*([a-zA-Z])/g, '\\bar{$1}');

  // Rule 27: Cross product
  tex = tex.replace(/\*/g, '\\times');
  tex = tex.replace(/×/g, '\\times');

  // Rule 26: Dot product
  tex = tex.replace(/\b\.\b/g, '\\cdot'); // Only if it looks like a math dot

  const symbolsMap: { [key: string]: string } = {
    // Rule 11: Greek Letters
    'theta': '\\theta', 'alpha': '\\alpha', 'beta': '\\beta', 'gamma': '\\gamma',
    'delta': '\\delta', 'epsilon': '\\epsilon', 'zeta': '\\zeta', 'eta': '\\eta',
    'iota': '\\iota', 'kappa': '\\kappa', 'lambda': '\\lambda', 'mu': '\\mu',
    'nu': '\\nu', 'xi': '\\xi', 'omicron': '\\omicron', 'pi': '\\pi',
    'rho': '\\rho', 'sigma': '\\sigma', 'tau': '\\tau', 'upsilon': '\\upsilon',
    'phi': '\\phi', 'chi': '\\chi', 'psi': '\\psi', 'omega': '\\omega',
    'Theta': '\\Theta', 'Delta': '\\Delta', 'Lambda': '\\Lambda', 'Phi': '\\Phi',
    'Psi': '\\Psi', 'Omega': '\\Omega',
    
    // Rule 12: Trigonometric functions
    'sin': '\\sin', 'cos': '\\cos', 'tan': '\\tan', 'sec': '\\sec',
    'csc': '\\csc', 'cot': '\\cot', 'sinh': '\\sinh', 'cosh': '\\cosh', 'tanh': '\\tanh',
    
    // Rule 14: Log
    'log': '\\log', 'ln': '\\ln',
    
    // Rule 7: Limit
    'lim': '\\lim',
    
    // Rule 6: Integral
    'int': '\\int ', 'oint': '\\oint',
    
    // Rule 8 & 9: Summation and Product
    'sum': '\\sum', 'prod': '\\prod',
    
    // Rule 25: Nabla
    'grad': '\\nabla', 'nabla': '\\nabla',
    
    // Rule 24: Partial
    'del': '\\partial', 'partial': '\\partial',
    
    // Rule 10: Infinity
    'oo': '\\infty', 'infinity': '\\infty',
    
    // Rule 27: Cross
    'xx': '\\times',
    
    // Rule 22: Arrow
    '->': '\\to', '-->': '\\to', '<-': '\\leftarrow', '=>': '\\Rightarrow', 'implies': '\\implies', 'impliedby': '\\impliedby',
    
    // Rule 23: Proportional
    'prop': '\\propto', 'propto': '\\propto',
    
    // Other relations
    '==': '=', '!=': '\\ne', '<=': '\\le', '>=': '\\ge', '+-': '\\pm'
  };

  // Sort keys by length descending to match longer patterns first
  const sortedKeys = Object.keys(symbolsMap).sort((a, b) => b.length - a.length);

  sortedKeys.forEach(key => {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // If it's a word-like symbol, use word boundaries
    if (/^[a-zA-Z]+$/.test(key)) {
      const regex = new RegExp(`(?<!\\\\)\\b${key}\\b`, 'g');
      tex = tex.replace(regex, symbolsMap[key]);
    } else {
      tex = tex.replace(new RegExp(escapedKey, 'g'), symbolsMap[key]);
    }
  });

  // Rule 13: Inverse Trig
  tex = tex.replace(/\\(sin|cos|tan|sec|csc|cot)\^{-1}/g, '\\$1^{-1}');
  
  // Rule 28: Degree
  tex = tex.replace(/°/g, '^\\circ');

  // Rule 30: Scientific notation (e.g. 4x10^4)
  tex = tex.replace(/(\d+)\s*[xX]\s*10\^/g, '$1\\times 10^');

  return tex;
}

export function correctAndNormalizeLatex(html: string): string {
  if (!html) return '';

  let processed = html;

  // Rule 33: Fix misplaced delimiters (Math must NEVER wrap HTML)
  // This is a pre-emptive fix for already broken inputs
  processed = processed.replace(/\$<(p|strong|span|b|i|em|sup|sub|div|li|td|th)>([\s\S]*?)<\/\1>\$/g, '<$1>$$$2$</$1>');
  processed = processed.replace(/\$<(p|strong|span|b|i|em|sup|sub|div|li|td|th)>([\s\S]*?)\$/g, '<$1>$$$2$');
  processed = processed.replace(/\$([\s\S]*?)<\/(p|strong|span|b|i|em|sup|sub|div|li|td|th)>\$/g, '$$$1$</$2>');

  // Also catch the reversed case: <p>...$</p>$
  processed = processed.replace(/(<[^>]+>[\s\S]*?)\$<\/[^>]+>\$/g, (match) => {
    return match.replace(/\$<\//, '</').replace(/>\$/, '>$');
  });

  // Rule 34: Fix nested <p> tags
  processed = processed.replace(/<p>\s*<p>/g, '<p>').replace(/<\/p>\s*<\/p>/g, '</p>');
  
  // Rule 34: Fix basic broken HTML
  processed = processed.replace(/<p>([^<]*)$/g, '<p>$1</p>');

  // Step 1: Pre-process non-standard tags like <sup> and <sub> into LaTeX if they are likely math
  // Rule 3: <sup>2</sup> -> ^2, <sub>0</sub> -> _0
  processed = processed.replace(/<sup>(.*?)<\/sup>/g, '^$1');
  processed = processed.replace(/<sub>(.*?)<\/sub>/g, '_$1');

  // Step 2: Temporarily extract HTML tags so we don't touch their attributes or contents
  const htmlPlaceholders: string[] = [];
  processed = processed.replace(/(<[^>]+>)/g, (match) => {
    const placeholder = `__HTML_PLACEHOLDER_${htmlPlaceholders.length}__`;
    htmlPlaceholders.push(match);
    return placeholder;
  });

  // Step 3: Handle Unicode Greek and Math symbols in text before wrapping
  const unicodeMap: { [key: string]: string } = {
    'θ': '\\theta', 'α': '\\alpha', 'β': '\\beta', 'λ': '\\lambda', 'ω': '\\omega',
    'δ': '\\delta', 'μ': '\\mu', 'π': '\\pi', 'η': '\\eta', 'γ': '\\gamma',
    'Σ': '\\sum', 'Π': '\\prod', '∞': '\\infty', '∫': '\\int', '∇': '\\nabla',
    '∂': '\\partial', '∝': '\\propto', '→': '\\to', '×': '\\times', '·': '\\cdot',
    '±': '\\pm', '≠': '\\ne', '≤': '\\le', '≥': '\\ge', '≈': '\\approx'
  };
  Object.keys(unicodeMap).forEach(char => {
    processed = processed.replace(new RegExp(char, 'g'), ` $${unicodeMap[char]}$ `);
  });

  // Rule 20: Character-based overline X̄ -> \bar X
  processed = processed.replace(/([a-zA-Z0-9])\u0304/g, ' $\\bar $1$ ');
  processed = processed.replace(/([a-zA-Z0-9])\u0305/g, ' $\\overline $1$ ');
  processed = processed.replace(/([a-zA-Z0-9])\u0302/g, ' $\\hat $1$ ');

  // Rule 29: Unicode chemical notation H₂SO₄ -> H_2SO_4
  const subMap: { [key: string]: string } = {
    '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4',
    '₅': '_5', '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9'
  };
  const supMap: { [key: string]: string } = {
    '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4',
    '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9',
    '⁺': '^+', '⁻': '^-'
  };
  Object.keys(subMap).forEach(c => processed = processed.replace(new RegExp(c, 'g'), subMap[c]));
  Object.keys(supMap).forEach(c => processed = processed.replace(new RegExp(c, 'g'), supMap[c]));

  // Step 3.5: Wrap common math patterns in plain text BEFORE adding placeholders or splitting
  // This prevents splitting like $ \pi $/2 or [ML^2T^-2]
  
  // A. Dimensions [ML^2T^-2]
  processed = processed.replace(/\[\s*[MLT][^\]]*\]/g, (match) => {
    if (match.includes('<') || match.includes('>')) return match;
    return `$${match}$`;
  });
  
  // B. Common math expressions (including fractions with Greek or variables)
  const mathExprRegex = /\b(?:alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|omega|[a-zA-Z0-9])\s*[\/^=<>!]\s*(?:alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|omega|[a-zA-Z0-9\(\)])+\b/g;
  processed = processed.replace(mathExprRegex, (match) => {
    if (match.includes('<') || match.includes('>')) return match;
    // Avoid double wrapping if it's already near $
    return `$${match}$`;
  });

  // Step 4: Temporarily extract existing math blocks
  const mathPlaceholders: string[] = [];
  processed = processed.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
    const placeholder = `__MATH_PLACEHOLDER_${mathPlaceholders.length}__`;
    mathPlaceholders.push(match);
    return placeholder;
  });

  processed = processed.replace(/(\$[^\$\n]+\$|\\\([\s\S]*?\\\))/g, (match) => {
    const placeholder = `__MATH_PLACE_INLINE_${mathPlaceholders.length}__`;
    mathPlaceholders.push(match);
    return placeholder;
  });

  // Step 5: Detect and wrap plain text math
  // Rule 16 & 17: Matrix patterns [[1,2],[3,-4]]
  processed = processed.replace(/(\[\[\s*.*?\s*\]\])/g, '$$1$');

  // Rule 29: Chemical formulas
  const chemicalRegex = /\b(?:H2O|CO2|CaCl2|Na2O|CaO|H2SO4|CH4|O2|O3|N2|H2|Cl2|NaCl|HCl|HNO3|NaOH|KOH|Ca\(OH\)2|Al\(OH\)3|Al2O3|Fe2O3|Fe3O4|CuSO4|ZnSO4|MgSO4|CaCO3|NaHCO3|Na2CO3|K2CO3|NH3|PCl5|PCl3|SO2|SO3|H2S)\b/g;
  processed = processed.replace(chemicalRegex, '$$$&');

  // Rule 18: Vector patterns like A->
  processed = processed.replace(/\b([a-zA-Z])\s*->\b/g, '$\\vec $1$');

  // Rule 15: Exponential e^x
  processed = processed.replace(/\be\^([a-zA-Z0-9]+)/g, '$e^{$1}$');

  // Rule 21: Composition gof
  processed = processed.replace(/\b([a-z])\s*o\s*([a-z])\b/g, '$$1\\circ $2$');

  // Rule 30: Scientific notation 4x10^4
  processed = processed.replace(/(\d+)\s*[xX]\s*10\^/g, '$$1\\times 10^$');

  // General math relation regex
  const mathRelationRegex = /\b(?:[a-zA-Z_]\w*\s*[-+*/^=<>!]+\s*[a-zA-Z0-9_\(\)]+|[a-zA-Z_]\w*\s*=\s*[a-zA-Z0-9_\(\)]+)\b/g;
  processed = processed.replace(mathRelationRegex, (match) => {
    if (match.includes('<') || match.includes('>')) return match;
    if (/^[a-zA-Z]+$/.test(match) || /^\d+$/.test(match)) return match;
    if (match.includes('$')) return match;
    return `$${match}$`;
  });

  // Greek letter words in text - only if not part of already wrapped math
  const greekWords = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'rho', 'sigma', 'tau', 'phi', 'omega'];
  greekWords.forEach(word => {
    const regex = new RegExp(`(?<![\\$\\w])${word}(?![\\$\\w])`, 'g');
    processed = processed.replace(regex, `$ \\${word} $`);
  });

  // Restore math and apply corrections
  const allMathRegex = /(__MATH_PLACEHOLDER_|__MATH_PLACE_INLINE_|\\\(|\\\[|\$)/g;
  
  // Actually, it's easier to just restore them and THEN run a pass on all $...$ and $$...$$
  processed = processed.replace(/__MATH_PLACEHOLDER_(\d+)__/g, (_, idx) => mathPlaceholders[Number(idx)]);
  processed = processed.replace(/__MATH_PLACE_INLINE_(\d+)__/g, (_, idx) => mathPlaceholders[Number(idx)]);

  // Pull trailing superscripts/subscripts back into math blocks (e.g. $...$^-1 -> $...^{-1}$)
  // More aggressive match for superscripts and subscripts
  processed = processed.replace(/\$([^\$\n]+)\$\^([\s]*\{?[a-zA-Z0-9\-\+]+\}?)/g, '$$$1^{$2}$');
  processed = processed.replace(/\$([^\$\n]+)\$_([\s]*\{?[a-zA-Z0-9\-\+]+\}?)/g, '$$$1_{$2}$');
  
  // Clean up double braces and extra spaces
  processed = processed.replace(/\^\{\s*\{([^\}]+)\}\s*\}/g, '^{$1}');
  processed = processed.replace(/\_\{\s*\{([^\}]+)\}\s*\}/g, '_{$1}');

  // Final Step: Deep Correction on ALL math expressions
  processed = processed.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\$([^\$\n]+)\$|\\\(([\s\S]*?)\\\)/g, (match, d1, d2, i1, i2) => {
    const isBlock = !!(d1 || d2);
    let mathContent = (d1 || d2 || i1 || i2 || '').trim();
    
    let corrected = convertAsciiMathToTex(mathContent);

    // Unit normalization (e.g. Jm^-2 -> J\,m^{-2}, S^-1 -> s^{-1})
    // Ensure symbols like J, m, s, N, T, S are treated as units with proper spacing
    // Normalize S to s for seconds and ensure proper superscript wrapping
    corrected = corrected.replace(/([JmNsTS])\s*m\^?\{?(-?\d+)\}?/g, '$1\\,m^{$2}');
    corrected = corrected.replace(/m\^?\{?(-?\d+)\}?\s*[sS]\^?\{?(-?\d+)\}?/g, 'm^{$1}\\,s^{$2}');
    corrected = corrected.replace(/([JmNsTS])\s*[sS]\^?\{?(-?\d+)\}?/g, '$1\\,s^{$2}');
    
    // Normalize units
    corrected = corrected.replace(/\\,S/g, '\\,s').replace(/\{S\}/g, '{s}');
    
    // Rule 35: Robust Brace matching to prevent broken LaTeX like S}^{-1}
    let balance = 0;
    let result = '';
    for (let i = 0; i < corrected.length; i++) {
      if (corrected[i] === '{') balance++;
      if (corrected[i] === '}') {
        if (balance > 0) {
          balance--;
        } else {
          continue; // Skip extra closing brace
        }
      }
      result += corrected[i];
    }
    while (balance > 0) {
      result += '}';
      balance--;
    }
    corrected = result;

    // Rule: Never allow HTML inside corrected math
    corrected = corrected.replace(/<[^>]+>/g, '').replace(/__HTML_PLACEHOLDER_\d+__/g, '');

    // Rule 16 & 17: Complex Matrix / Determinant
    if (corrected.includes('[[') && corrected.includes(']]')) {
      corrected = corrected.replace(/\[\s*(\[[^\]]+\](?:\s*,\s*\[[^\]]+\])*)\s*\]/g, (_, rowsStr) => {
        const rows = rowsStr.split(/\s*\]\s*,\s*\[\s*/).map((r: string) => {
          const cleanRow = r.replace(/[\[\]]/g, '').trim();
          return cleanRow.split(/\s*,\s*/).join(' & ');
        });
        const matrixContent = rows.join(' \\\\ ');
        const isDet = corrected.toLowerCase().includes('det') || corrected.toLowerCase().includes('determinant') || corrected.includes('|');
        const env = isDet ? 'vmatrix' : 'bmatrix';
        return `\\begin{${env}}${matrixContent}\\end{${env}}`;
      });
    }

    // Rule 15: Exponential e^x
    corrected = corrected.replace(/(?<!\\)e\^([a-zA-Z0-9])/g, 'e^{$1}');

    // Rule 35: Brace matching
    let openCount = (corrected.match(/\{/g) || []).length;
    let closeCount = (corrected.match(/\}/g) || []).length;
    while (openCount > closeCount) { corrected += '}'; closeCount++; }
    while (closeCount > openCount) { corrected = corrected.replace(/\}$/, ''); closeCount--; }

    // Rule 32: Ensure valid KaTeX (basic escape)
    corrected = corrected.replace(/\\([#&_%])/g, '\\$1');

    return isBlock ? `$$${corrected}$$` : `$${corrected}$`;
  });

  // Specific cleanup for cases where $ were nested or broken
  processed = processed.replace(/\$\$+/g, '$');
  processed = processed.replace(/\$\s*\$/g, '');

  // Restore HTML
  processed = processed.replace(/__HTML_PLACEHOLDER_(\d+)__/g, (_, idx) => htmlPlaceholders[Number(idx)]);

  // FINAL SAFETY: Never allow $ to wrap HTML tags
  processed = processed.replace(/\$<(p|strong|span|b|i|em|sup|sub|div|li|td|th)>([\s\S]*?)<\/\1>\$/g, '<$1>$$$2$</$1>');
  processed = processed.replace(/\$<(p|strong|span|b|i|em|sup|sub|div|li|td|th)>/g, '<$1>$');
  processed = processed.replace(/<\/(p|strong|span|b|i|em|sup|sub|div|li|td|th)>\$/g, '</$1>');
  
  // Clean up any double $ or empty $ created by the safety logic
  processed = processed.replace(/\$\$+/g, '$');
  processed = processed.replace(/\$\s*\$/g, '');

  return processed.trim();
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

export function convertMathyToLatex(htmlStr: string): string {
  if (!htmlStr) return '';
  
  // Replace <span class="mathy">...</span> with $...$
  let processed = htmlStr.replace(/<span\s+class=["']mathy["']>([\s\S]*?)<\/span>/gi, (_, inner) => {
    const tex = convertAsciiMathToTex(inner.trim());
    return `$${tex}$`;
  });
  
  // Replace <p class="mathy">...</p> with <p>$...$</p>
  processed = processed.replace(/<p\s+class=["']mathy["']>([\s\S]*?)<\/p>/gi, (_, inner) => {
    const tex = convertAsciiMathToTex(inner.trim());
    return `<p>$${tex}$</p>`;
  });
  
  return processed;
}

export function ensureMathWrapping(html: string): string {
  if (!html) return '';
  if (html.includes('$')) return html;
  
  // If the HTML has some math indicators like /, ^, √, or Greek letters, we should wrap the content of tags in $
  const hasMath = /[\/^√°]|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|omega/i.test(html);
  if (hasMath) {
    // Wrap the text inside tags, e.g. <p>R/(√5 - 1)</p> -> <p>$R/(√5 - 1)$</p>
    // Let's replace the inner text of tags with $...$
    return html.replace(/(<[^>]+>)([^<]+)(<\/[^>]+>)/g, (match, open, content, close) => {
      if (content.trim() === '' || content.includes('$')) return match;
      return `${open}$${content.trim()}$${close}`;
    });
  }
  return html;
}

export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  
  // Clean carriage returns
  const cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  let i = 0;
  while (i < cleanedText.length) {
    const char = cleanedText[i];
    const nextChar = cleanedText[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          cell += '"';
          i += 2;
        } else {
          // End of quote
          inQuotes = false;
          i++;
        }
      } else {
        cell += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
        i++;
      } else if (char === '\n') {
        row.push(cell);
        result.push(row);
        row = [];
        cell = '';
        i++;
      } else {
        cell += char;
        i++;
      }
    }
  }
  
  if (cell || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  
  return result;
}

const finalizeMCQ = (raw: any, seq: number): MCQData => {
  // Convert mathy syntax in question, explanation, and options first
  let rawQ = convertMathyToLatex(raw.question);
  let rawExp = convertMathyToLatex(raw.explanation);
  
  // Ensure math wrapping if any simple expression is missed
  rawQ = ensureMathWrapping(rawQ);
  rawExp = ensureMathWrapping(rawExp);
  
  const cleanQ = correctAndNormalizeLatex(rawQ);
  const cleanExp = correctAndNormalizeLatex(rawExp);
  
  const optionsData = Array.from({ length: 5 }, () => ({ text: '', image: '' }));
  const correctIndices: number[] = [];
  
  raw.options.slice(0, 5).forEach((opt: any, idx: number) => {
    let optText = convertMathyToLatex(opt.text);
    optText = ensureMathWrapping(optText);
    
    // Strip bullet points like ক. খ. etc. if any
    optText = optText.replace(/^\s*[কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহঅআইঈউঊঋএঐওঔA-Za-z1-2-3-4-5A-Ea-e]\s*[\dots\.-–—]\s*/, '');
    optText = optText.trim();
    
    optionsData[idx] = {
      text: correctAndNormalizeLatex(optText),
      image: ''
    };
    if (opt.isCorrect) {
      correctIndices.push(idx + 1);
    }
  });
  
  return {
    question: cleanQ,
    question_image: raw.question_image || '',
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
    correct_options: correctIndices.join(','),
    explanation: cleanExp,
    explanation_image: raw.explanation_image || '',
    type_id: raw.type_id || '',
    paper_id: raw.paper_id || '',
    chapter_id: raw.chapter_id || '',
    topic_id: raw.topic_id || '',
    sequence_order: String(seq)
  };
};

export const parseNewQbsFormat = (text: string): MCQData[] => {
  const rows = parseCSV(text);
  const results: MCQData[] = [];
  
  let currentMCQ: any = null;
  
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex].map(cell => cell.trim());
    if (row.length === 1 && row[0] === '') {
      continue;
    }
    
    // A question row has at least 3 elements, and row[1] is a number/ID and row[2] is a word/code (like 'one', 'two')
    const isQuestionRow = row.length >= 3 && /^\d+$/.test(row[1]) && /^[a-zA-Z0-9_-]+$/.test(row[2]);
    
    if (isQuestionRow) {
      if (currentMCQ) {
        results.push(finalizeMCQ(currentMCQ, results.length + 1));
      }
      
      let questionHtml = row[0];
      let paper_id = '';
      let chapter_id = '';
      
      const bracketMatch = questionHtml.match(/\[\s*([pP])\s*[-.]\s*(\d+)(?:\.(\d+))?/);
      if (bracketMatch) {
        paper_id = `${bracketMatch[1].toLowerCase()}${bracketMatch[2]}`;
        if (bracketMatch[3]) {
          chapter_id = bracketMatch[3];
        }
      }
      
      currentMCQ = {
        question: questionHtml,
        question_image: '',
        explanation: row[3] || '',
        explanation_image: '',
        type_id: '',
        paper_id,
        chapter_id,
        topic_id: '',
        options: []
      };
    } else {
      if (currentMCQ) {
        let isCorrect = false;
        let optionText = '';
        
        if (row.length >= 2) {
          isCorrect = row[0] === '*';
          optionText = row.slice(1).join(',');
        } else if (row.length === 1) {
          if (row[0].startsWith('*')) {
            isCorrect = true;
            optionText = row[0].substring(1);
            if (optionText.startsWith(',')) {
              optionText = optionText.substring(1);
            }
          } else {
            optionText = row[0];
            if (optionText.startsWith(',')) {
              optionText = optionText.substring(1);
            }
          }
        }
        
        currentMCQ.options.push({ text: optionText, isCorrect });
      }
    }
  }
  
  if (currentMCQ) {
    results.push(finalizeMCQ(currentMCQ, results.length + 1));
  }
  
  return results;
};

export const parseHtmlToMcqs = (htmlInput: string): MCQData[] => {
  const trimmed = htmlInput.trim();
  const isNewFormat = /^\s*".*?"\s*,\s*\d+\s*,\s*[a-zA-Z0-9_-]+\s*,/m.test(trimmed) || 
                      (/^\s*\*?,/m.test(trimmed) && trimmed.split('\n').some(line => line.trim().startsWith('*,')));
  
  if (isNewFormat) {
    return parseNewQbsFormat(htmlInput);
  }

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
        text: correctAndNormalizeLatex(optText),
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
      question = correctAndNormalizeLatex(qClone.innerHTML.trim());
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
      question = correctAndNormalizeLatex(tempDiv.innerHTML.trim());
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
      explanation = correctAndNormalizeLatex(bqClone.innerHTML.trim());
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
      topic_id,
      sequence_order: String(results.length + 1)
    });
  });

  return results;
};

export const generateCsvFromMcqs = (results: MCQData[]): string => {
  const header = 'question,question_image,option_1,option_1_image,option_2,option_2_image,option_3,option_3_image,option_4,option_4_image,option_5,option_5_image,correct_options,explanation,explanation_image,type_id,paper_id,chapter_id,topic_id,sequence_order';
  
  const escapeCSV = (str: string) => {
    return str.replace(/"/g, '""');
  };
  
  const rows = results.map((row, index) => {
    const seqOrder = row.sequence_order || String(index + 1);
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
      `"${escapeCSV(row.topic_id)}"`,
      seqOrder
    ].join(',');
  });
  
  return [header, ...rows].join('\n');
};
