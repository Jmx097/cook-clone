import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

export async function generateBusinessPlanPdf(projectId: string, outputPath: string) {
  // Ensure export directory exists
  const exportDir = path.dirname(outputPath);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // In a real app, successful auth logic for local usage implies bypassing or using a local token.
    // Since we are "local-first" and have no complex auth on localhost by default, 
    // we assume the page is accessible or we might need to inject a cookie if auth is pervasive.
    // For now, we assume localhost:3000 access is open or we use a widely permitted local strategy.
    
    // Construct the URL for the report view
    // Note: In production/local execution, this needs to be the actual running URL.
    // We assume localhost:3000 for this local-first mission.
    const reportUrl = `http://localhost:3000/project/${projectId}/export/view`;

    await page.goto(reportUrl, { waitUntil: 'networkidle' });

    // Print to PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });

    console.log(`PDF generated at: ${outputPath}`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
