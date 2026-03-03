'use client';

/**
 * Genera un PDF a partir de uno o varios elementos del DOM.
 * Cada elemento se convierte en una o más páginas A4.
 * Orden: los IDs se añaden en el orden del array.
 */
export async function generatePdf(pageIds: string[], filename: string): Promise<void> {
  const { default: jsPDF }      = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const pdf        = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin     = 10;
  const usableW    = pageWidth  - margin * 2;
  const usableH    = pageHeight - margin * 2;

  let firstPage = true;

  for (const id of pageIds) {
    const element = document.getElementById(id);
    if (!element) continue;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pageImgH = (usableH / usableW) * canvas.width; // alto de página en px de canvas
    const imgH     = (canvas.height / canvas.width) * usableW; // alto total en mm

    if (!firstPage) pdf.addPage();
    firstPage = false;

    if (imgH <= usableH) {
      // Cabe en una sola página PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', margin, margin, usableW, imgH);
    } else {
      // Fragmentar este elemento en múltiples páginas
      let yOffset = 0;
      let firstSlice = true;

      while (yOffset < canvas.height) {
        const sliceH    = Math.min(pageImgH, canvas.height - yOffset);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width  = canvas.width;
        pageCanvas.height = sliceH;
        const ctx = pageCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        const pageData   = pageCanvas.toDataURL('image/jpeg', 0.92);
        const renderedH  = (sliceH / canvas.width) * usableW;

        if (!firstSlice) pdf.addPage();
        firstSlice = false;

        pdf.addImage(pageData, 'JPEG', margin, margin, usableW, renderedH);
        yOffset += sliceH;
      }
    }
  }

  pdf.save(filename);
}
