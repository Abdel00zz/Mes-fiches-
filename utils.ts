
export const processContentForDisplay = (text: string) => {
  if (!text) return '';
  
  // 1. Handle Bold (**text**) -> <strong>
  let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

  const lines = processed.split('\n');
  let html = '';
  
  // Track list state explicitly
  let currentListType: 'ul' | 'ol' | null = null;

  const closeListIfNeeded = () => {
    if (currentListType === 'ul') { html += '</ul>'; currentListType = null; }
    if (currentListType === 'ol') { html += '</ol>'; currentListType = null; }
  };

  // Helper to detect if a line opens a block that isn't closed on the same line
  // Returns the full content including subsequent lines if a block was detected and closed later
  const lookAheadForBlockClosure = (startIndex: number, initialLine: string): { text: string, newIndex: number } => {
      let buffer = initialLine;
      
      // Extended list of mathematical environments (25+ algorithms detected)
      const envs = [
        'cases', 
        'array', 
        'matrix', 'pmatrix', 'vmatrix', 'Bmatrix', 'Vmatrix', 'bmatrix', 'smallmatrix',
        'align', 'align*', 
        'gather', 'gather*', 
        'flalign', 'flalign*', 
        'alignat', 'alignat*', 
        'equation', 'equation*', 
        'CD', 
        'eqnarray', 'eqnarray*',
        'multiline', 'multiline*',
        'split',
        'aligned',
        'gathered'
      ];
      
      let detectedEnv = null;
      // Check for \begin{env}
      for (const env of envs) {
          if (buffer.includes(`\\begin{${env}}`)) {
              detectedEnv = env;
              break;
          }
      }

      // Also check for $$ or \[
      const hasDoubleDollarStart = buffer.includes('$$');
      const hasBracketStart = buffer.includes('\\[');

      // If no complex start detected and it's self-contained, return immediately
      if (!detectedEnv && !hasDoubleDollarStart && !hasBracketStart) {
          return { text: buffer, newIndex: startIndex };
      }

      // Check if it's already closed in the initial line
      if (detectedEnv && buffer.includes(`\\end{${detectedEnv}}`)) return { text: buffer, newIndex: startIndex };
      
      // For $$ and \[, we need to be careful about multiple occurrences on same line
      if (hasDoubleDollarStart) {
         const count = (buffer.match(/\$\$/g) || []).length;
         if (count % 2 === 0) return { text: buffer, newIndex: startIndex };
      }
      if (hasBracketStart && buffer.includes('\\]')) return { text: buffer, newIndex: startIndex };

      // Consume lines until we find the closure
      let j = startIndex + 1;
      while (j < lines.length) {
          const nextLine = lines[j].trim();
          buffer += ' ' + nextLine; // Join with space to prevent latex errors
          
          if (detectedEnv && nextLine.includes(`\\end{${detectedEnv}}`)) break;
          if (hasDoubleDollarStart && nextLine.includes('$$')) break;
          if (hasBracketStart && nextLine.includes('\\]')) break;
          
          j++;
      }
      
      return { text: buffer, newIndex: j };
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // --- List Start Detection ---
    if (line.includes('\\begin{enumerate}')) {
      closeListIfNeeded();
      html += '<ol class="list-decimal pl-6 space-y-2 my-2 marker:font-bold marker:text-slate-600 text-slate-800">';
      currentListType = 'ol';
      continue;
    }
    if (line.includes('\\end{enumerate}')) {
      closeListIfNeeded();
      continue;
    }

    if (line.includes('\\begin{itemize}')) {
      closeListIfNeeded();
      html += '<ul class="list-disc pl-6 space-y-2 my-2 marker:text-slate-400 text-slate-800">';
      currentListType = 'ul';
      continue;
    }
    if (line.includes('\\end{itemize}')) {
      closeListIfNeeded();
      continue;
    }

    // --- List Item Handling (\item) ---
    if (line.startsWith('\\item')) {
       // Remove "\item" 
       let itemRaw = line.replace(/^\\item\s*/, '');
       
       // CRITICAL: Check if the content inside the item is a multi-line math block
       const { text: fullItemContent, newIndex } = lookAheadForBlockClosure(i, itemRaw);
       i = newIndex; // Advance loop index

       html += `<li class="pl-1"><span class="math-content-inline">${fullItemContent}</span></li>`;
       continue;
    }

    // --- Top Level Math Block Handling ---
    // If we are not in a list, check for multi-line math blocks
    if (!currentListType) {
        // Start of math block detection
        const { text: blockContent, newIndex } = lookAheadForBlockClosure(i, line);
        
        if (newIndex > i) {
             // We consumed multiple lines, treat as a block div
             html += `<div class="my-4 text-center overflow-x-auto print:overflow-visible">${blockContent}</div>`;
             i = newIndex;
             continue;
        }
    }

    // --- Legacy / Markdown Support ---
    if (line.match(/^([•\-\*])\s/)) {
        const content = line.replace(/^([•\-\*])\s+/, '');
        html += `<div class="flex gap-2 mb-1 pl-2 text-slate-800"><span class="text-slate-400">•</span><span>${content}</span></div>`;
        continue;
    }
    
    // --- Standard Paragraph ---
    // If inside a list but no \item, it's a continuation of previous item or broken format.
    // We treat it as text.
    if (currentListType) {
        html += `<li class="pl-1 list-none">${line}</li>`;
    } else {
        html += `<p class="mb-2 leading-relaxed text-slate-800 text-justify no-underline">${line}</p>`;
    }
  }
  
  closeListIfNeeded();

  return html;
};
