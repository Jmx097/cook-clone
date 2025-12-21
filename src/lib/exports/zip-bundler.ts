import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { prisma } from '@/lib/db';

export async function generateContentBundle(projectId: string, outputPath: string) {
  // Ensure export directory exists
  const exportDir = path.dirname(outputPath);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Fetch all data
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      researchReports: { orderBy: { version: 'desc' }, take: 1 },
      offers: { orderBy: { version: 'desc' }, take: 1 },
      assetBundles: { orderBy: { version: 'desc' }, take: 1 },
    }
  });

  if (!project) throw new Error(`Project ${projectId} not found`);

  // Create output stream
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  return new Promise<void>((resolve, reject) => {
    output.on('close', () => {
      console.log(`ZIP Bundle created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // 1. Project Info
    archive.append(JSON.stringify(project, null, 2), { name: 'project.json' });

    // 2. Research
    const report = project.researchReports[0];
    if (report) {
      archive.append(JSON.stringify(report, null, 2), { name: 'research/research.json' });
      // TODO: Convert JSON content to Markdown if possible, for now just dump
      archive.append(`# Market Research\n\n${JSON.stringify(report.content, null, 2)}`, { name: 'research/research.md' });
    }

    // 3. Offer
    const offer = project.offers[0];
    if (offer) {
      archive.append(JSON.stringify(offer, null, 2), { name: 'offer/offer.json' });
      archive.append(`# Offer Strategy\n\nGuarantee: ${offer.guarantee}\nRationale: ${offer.rationale}`, { name: 'offer/offer.md' });
    }

    // 4. Assets
    const assets = project.assetBundles[0];
    if (assets) {
      archive.append(JSON.stringify(assets, null, 2), { name: 'assets/assets.json' });
      // Helper to stringify sections
      const mdContent = `# Marketing Assets
      
## Landing Copy
${JSON.stringify(assets.landingCopy, null, 2)}

## Emails
${JSON.stringify(assets.emails, null, 2)}
`;
      archive.append(mdContent, { name: 'assets/assets.md' });
    }

    // 5. README
    const readme = `# Content Bundle for "${project.idea}"
    
Generated: ${new Date().toISOString()}

## Contents
* project.json: Metadata
* research/: Market research data
* offer/: Offer strategy
* assets/: Marketing copy and emails

## How to use
This data is yours. You can use it to build your website, write emails, or import into other tools.
`;
    archive.append(readme, { name: 'README.md' });

    archive.finalize();
  });
}
