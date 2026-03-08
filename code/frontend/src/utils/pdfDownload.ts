import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadReportAsPDF(element: HTMLElement, filename: string = 'AgriConnect_Report.pdf') {
  try {
    // Wait for any images/charts to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create canvas from element with improved settings and proper margins
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowHeight: element.scrollHeight,
      imageTimeout: 5000,
      ignoreElements: (element) => {
        // Optionally ignore certain elements that don't need to be captured
        return element.classList?.contains('no-print') || false;
      }
    });

    // Create PDF with proper margins
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // 15mm margins on all sides
    const contentWidth = pageWidth - (2 * margin);
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Add header with title and timestamp
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AgriConnect - Admin Report', margin, margin);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated: ${new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin, margin + 6);
    pdf.setTextColor(0, 0, 0);

    // Add image with pagination and proper margins
    let yPos = margin + 12;
    let heightLeft = imgHeight;
    let sourceY = 0;
    let isFirstPage = true;

    while (heightLeft > 0) {
      if (!isFirstPage) {
        pdf.addPage();
        yPos = margin;
      }

      const availableHeight = pageHeight - yPos - margin;
      const heightToAdd = Math.min(availableHeight, heightLeft);
      
      // Calculate source rectangle for partial image
      const sourceHeight = (heightToAdd * canvas.width) / contentWidth;
      
      // Create a temporary canvas for the current page section
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const tempImgData = tempCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(tempImgData, 'PNG', margin, yPos, contentWidth, heightToAdd);
      }

      sourceY += sourceHeight;
      heightLeft -= heightToAdd;
      isFirstPage = false;
    }

    // Download PDF
    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(`${filename.replace('.pdf', '')}_${timestamp}.pdf`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('PDF download error:', errorMessage);
    throw new Error(`Failed to generate PDF: ${errorMessage}`);
  }
}
