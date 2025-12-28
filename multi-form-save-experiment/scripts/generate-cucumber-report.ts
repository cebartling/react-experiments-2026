import report from 'multiple-cucumber-html-reporter';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

report.generate({
  jsonDir: path.join(projectRoot, 'reports/cucumber'),
  reportPath: path.join(projectRoot, 'reports/cucumber-html'),
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
  customData: {
    title: 'Run Info',
    data: [
      { label: 'Project', value: 'Multi-Form Save Experiment' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Execution Start Time', value: new Date().toISOString() },
    ],
  },
  displayDuration: true,
  displayReportTime: true,
  pageTitle: 'Cucumber Test Report',
  reportName: 'Multi-Form Save Experiment - Acceptance Tests',
});

console.log('HTML report generated at reports/cucumber-html/index.html');
