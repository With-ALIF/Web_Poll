import katex from 'katex';

export const preprocessMath = (math: string): string => {
  let processed = math;

  // 1. Process vec expressions (e.g. vecF, vec(F) -> \vec{F})
  processed = processed.replace(/vec\(([a-zA-Z])\)/g, '\\vec{$1}');
  processed = processed.replace(/vec([a-zA-Z])/g, '\\vec{$1}');

  // 2. Process ul expressions (underlined vectors, common in Physics)
  // e.g. ulF -> \underline{F}
  processed = processed.replace(/ul\(([a-zA-Z])\)/g, '\\underline{$1}');
  processed = processed.replace(/ul([a-zA-Z])/g, '\\underline{$1}');

  // 3. Process hat expressions (unit vectors)
  // e.g. hati -> \hat{i}, hatj -> \hat{j}, hatk -> \hat{k}
  processed = processed.replace(/hat\(([a-zA-Z])\)/g, '\\hat{$1}');
  processed = processed.replace(/hat([a-zA-Z])/g, '\\hat{$1}');

  // 4. Process bar expressions (e.g. barx -> \bar{x})
  processed = processed.replace(/bar\(([a-zA-Z])\)/g, '\\bar{$1}');
  processed = processed.replace(/bar([a-zA-Z])/g, '\\bar{$1}');

  // 5. Replace "*" multiplication/cross product with "\times"
  processed = processed.replace(/\*/g, '\\times');

  // 6. Automatically convert common raw math names/symbols missing backslashes (e.g. int, theta, pi, sin)
  const rawSymbols: { [key: string]: string } = {
    'int': '\\int',
    'oint': '\\oint',
    'sum': '\\sum',
    'prod': '\\prod',
    'lim': '\\lim',
    'theta': '\\theta',
    'alpha': '\\alpha',
    'beta': '\\beta',
    'gamma': '\\gamma',
    'delta': '\\delta',
    'epsilon': '\\epsilon',
    'lambda': '\\lambda',
    'mu': '\\mu',
    'pi': '\\pi',
    'phi': '\\phi',
    'omega': '\\omega',
    'Theta': '\\Theta',
    'Delta': '\\Delta',
    'Lambda': '\\Lambda',
    'Phi': '\\Phi',
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
    'oo': '\\infty',
    'inf': '\\infty',
    'xx': '\\times',
    'grad': '\\nabla',
    'del': '\\partial',
    'partial': '\\partial',
  };

  Object.keys(rawSymbols).forEach(key => {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Match only if not preceded by a letter, backslash, or underscore, and not followed by a letter
    const regex = new RegExp(`(?<![a-zA-Z\\\\_])${escapedKey}(?![a-zA-Z])`, 'g');
    processed = processed.replace(regex, rawSymbols[key]);
  });

  return processed;
};

export const renderMathInHtml = (html: string | undefined | null): string => {
  if (!html) return '';
  
  let processed = html;

  // 1. Process block math \[ ... \]
  processed = processed.replace(/\\\[(.*?)\\\]/gs, (_, math) => {
    try {
      return katex.renderToString(preprocessMath(math.trim()), { displayMode: true, throwOnError: false });
    } catch {
      return `\\[${math}\\]`;
    }
  });

  // 2. Process inline math \( ... \)
  processed = processed.replace(/\\\((.*?)\\\)/gs, (_, math) => {
    try {
      return katex.renderToString(preprocessMath(math.trim()), { displayMode: false, throwOnError: false });
    } catch {
      return `\\(${math}\\)`;
    }
  });

  // 3. Process block math $$ ... $$
  processed = processed.replace(/\$\$(.*?)\$\$/gs, (_, math) => {
    try {
      return katex.renderToString(preprocessMath(math.trim()), { displayMode: true, throwOnError: false });
    } catch {
      return `$$${math}$$`;
    }
  });

  // 4. Process inline math $ ... $
  processed = processed.replace(/\$([^\$\n]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(preprocessMath(math.trim()), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });

  return processed;
};

