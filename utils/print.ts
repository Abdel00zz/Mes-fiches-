
export interface PrintOptions {
    paper: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
    columns: 1 | 2;
    fontSize: 10 | 11 | 12; // in points (pt)
    margin: 'normal' | 'narrow' | 'wide';
}

const MARGINS = {
    normal: '9mm',
    narrow: '5mm',
    wide: '15mm'
};

export const generatePrintCSS = (options: PrintOptions): string => {
    return `
      /* Page Setup */
      @page {
        size: ${options.paper} ${options.orientation};
        margin: ${MARGINS[options.margin]};
      }

      /* Base Document Styles */
      #print-preview-sheet .print-layout,
      body.printing-active {
        font-size: ${options.fontSize}pt;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color: #1e293b !important;
        line-height: 1.5;
      }

      body.printing-active {
        background: #fff !important;
      }

      /* Layout & Flow */
      #print-preview-sheet .print-flow {
        column-count: ${options.columns};
        column-gap: ${options.columns > 1 ? '6mm' : '0'};
        column-fill: auto;
      }

      #print-preview-sheet .print-flow > * + * {
        margin-top: 0 !important;
      }

      /* Break Avoidance */
      .avoid-break,
      #print-preview-sheet .print-zone,
      #print-preview-sheet .print-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      #print-preview-sheet .print-block {
        break-inside: auto;
        page-break-inside: auto;
      }

      #print-preview-sheet .print-section {
        column-span: ${options.columns > 1 ? 'all' : 'auto'};
        margin-top: 3mm !important;
        margin-bottom: 2mm !important;
        border: none !important;
      }

      /* Block Styling — compact, no borders, no left accent */
      #print-preview-sheet .print-block {
        margin: 0 !important;
        border: none !important;
        border-radius: 1mm !important;
        box-shadow: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      #print-preview-sheet .print-block-header {
        border: none !important;
      }

      /* Answer Zones */
      #print-preview-sheet .print-zone-pattern {
        background-attachment: local !important;
        background-repeat: repeat !important;
        opacity: 1 !important;
      }

      #print-preview-sheet .print-rich-zone {
        border-color: #cbd5e1 !important;
        border-width: 0.2mm !important;
        border-style: solid !important;
        background-color: #ffffff !important;
      }

      /* Images */
      #print-preview-sheet .print-hq-image,
      #print-preview-sheet .print-zone-image {
        image-rendering: auto;
        page-break-inside: avoid;
      }

      /* Footer */
      #print-preview-sheet .print-footer {
        color: #94a3b8 !important;
        border: none !important;
        column-span: ${options.columns > 1 ? 'all' : 'auto'};
      }

      /* MathJax */
      #print-preview-sheet .MathJax,
      #print-preview-sheet mjx-container {
        color: inherit !important;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /* Preview Sheet Sizing */
      #print-preview-sheet {
        width: ${options.orientation === 'landscape' ? (options.paper === 'a4' ? '297mm' : '11in') : (options.paper === 'a4' ? '210mm' : '8.5in')};
        min-height: ${options.orientation === 'landscape' ? (options.paper === 'a4' ? '210mm' : '8.5in') : (options.paper === 'a4' ? '297mm' : '11in')};
        padding: ${MARGINS[options.margin]};
        box-sizing: border-box;
      }
    `;
};
