
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
      /* Dynamically Generated Print Styles */

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
        color: #0f172a !important;
      }
      
      body.printing-active {
        background: #fff !important;
      }
      
      /* Layout & Flow */
      #print-preview-sheet .print-flow {
        column-count: ${options.columns};
        column-gap: ${options.columns > 1 ? '8mm' : '0'};
        column-fill: auto;
      }

      /* Break Avoidance: Crucial for layout stability */
      .avoid-break,
      #print-preview-sheet .print-block,
      #print-preview-sheet .print-zone,
      #print-preview-sheet .print-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      #print-preview-sheet .print-section {
         column-span: ${options.columns > 1 ? 'all' : 'auto'};
      }

      /* Block & Component Styling */
      #print-preview-sheet .print-block {
          margin: 0 0 3.2mm 0 !important;
          border: 0.25mm solid rgba(148, 163, 184, 0.65) !important;
          border-radius: 1.6mm !important;
          box-shadow: none !important;
          background: rgba(241, 245, 249, 0.45) !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
      }
      
      #print-preview-sheet .print-block-header {
          border-bottom: 0.25mm dashed rgba(148, 163, 184, 0.7) !important;
      }
      
      #print-preview-sheet .print-section {
          margin-top: 1mm !important;
          margin-bottom: 3mm !important;
          border-bottom-width: 0.4mm !important;
          border-color: #0f172a !important;
      }
      
      #print-preview-sheet .print-zone-pattern {
        background-attachment: local !important;
        background-repeat: repeat !important;
        opacity: 1 !important;
      }
      
      #print-preview-sheet .print-rich-zone {
          border-color: #64748b !important;
          border-width: 0.25mm !important;
          border-style: solid !important;
          background-color: #ffffff !important;
      }
      
      #print-preview-sheet .print-hq-image,
      #print-preview-sheet .print-zone-image {
          image-rendering: auto;
          page-break-inside: avoid;
      }

      #print-preview-sheet .print-footer {
          color: #475569 !important;
          border-color: #cbd5e1 !important;
          column-span: ${options.columns > 1 ? 'all' : 'auto'};
      }

      /* MathJax specific overrides */
      #print-preview-sheet .MathJax,
      #print-preview-sheet mjx-container {
        color: inherit !important;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      /* Final overrides for sizing and preview */
      #print-preview-sheet {
          width: ${options.orientation === 'landscape' ? (options.paper === 'a4' ? '297mm' : '11in') : (options.paper === 'a4' ? '210mm' : '8.5in')};
          min-height: ${options.orientation === 'landscape' ? (options.paper === 'a4' ? '210mm' : '8.5in') : (options.paper === 'a4' ? '297mm' : '11in')};
          padding: ${MARGINS[options.margin]};
          box-sizing: border-box;
      }
    `;
};
