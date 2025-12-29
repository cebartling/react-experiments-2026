import * as fs from 'node:fs';
import * as path from 'node:path';
import reporter from 'multiple-cucumber-html-reporter';

async function main(): Promise<void> {
  const jsonPath = path.join(process.cwd(), 'reports/cucumber/report.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('Error: Cucumber JSON report not found at', jsonPath);
    console.error('Run "npm run test:acceptance:report" first to generate the JSON report.');
    process.exit(1);
  }

  reporter.generate({
    jsonDir: 'reports/cucumber',
    reportPath: 'reports/cucumber/html',
    pageTitle: 'Data Table Spike - Acceptance Test Report',
    reportName: 'Acceptance Test Report',
    displayDuration: true,
    displayReportTime: true,
    metadata: {
      browser: {
        name: 'chromium',
        version: 'latest',
      },
      device: 'Local Machine',
      platform: {
        name: process.platform,
        version: process.version,
      },
    },
  });

  console.log('HTML report generated: reports/cucumber/html/index.html');
}

main().catch((error) => {
  console.error('Error generating report:', error);
  process.exit(1);
});
