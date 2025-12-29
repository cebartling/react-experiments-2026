import * as fs from 'node:fs';
import * as path from 'node:path';

interface CucumberStep {
  keyword: string;
  name: string;
  result: {
    status: string;
    duration?: number;
  };
}

interface CucumberScenario {
  keyword: string;
  name: string;
  steps: CucumberStep[];
}

interface CucumberFeature {
  keyword: string;
  name: string;
  description?: string;
  elements: CucumberScenario[];
}

function generateHtmlReport(features: CucumberFeature[]): string {
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  features.forEach((feature) => {
    feature.elements.forEach((scenario) => {
      scenario.steps.forEach((step) => {
        if (step.result.status === 'passed') passed++;
        else if (step.result.status === 'failed') failed++;
        else skipped++;
      });
    });
  });

  const total = passed + failed + skipped;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cucumber Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; padding: 2rem; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 1rem; }
    .summary { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .stat { background: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { color: #666; font-size: 0.875rem; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .skipped { color: #f59e0b; }
    .feature { background: white; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
    .feature-header { padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #eee; }
    .feature-name { font-weight: 600; color: #333; }
    .scenario { padding: 1rem; border-bottom: 1px solid #eee; }
    .scenario:last-child { border-bottom: none; }
    .scenario-name { font-weight: 500; margin-bottom: 0.5rem; }
    .step { padding: 0.25rem 0; padding-left: 1rem; font-size: 0.875rem; }
    .step-passed { color: #22c55e; }
    .step-failed { color: #ef4444; }
    .step-skipped { color: #f59e0b; }
    .timestamp { color: #999; font-size: 0.875rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cucumber Test Report</h1>
    <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
    <div class="summary">
      <div class="stat">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total Steps</div>
      </div>
      <div class="stat">
        <div class="stat-value passed">${passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat">
        <div class="stat-value failed">${failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat">
        <div class="stat-value skipped">${skipped}</div>
        <div class="stat-label">Skipped</div>
      </div>
      <div class="stat">
        <div class="stat-value">${passRate}%</div>
        <div class="stat-label">Pass Rate</div>
      </div>
    </div>
    ${features
      .map(
        (feature) => `
      <div class="feature">
        <div class="feature-header">
          <div class="feature-name">${feature.keyword}: ${feature.name}</div>
        </div>
        ${feature.elements
          .map(
            (scenario) => `
          <div class="scenario">
            <div class="scenario-name">${scenario.keyword}: ${scenario.name}</div>
            ${scenario.steps
              .map(
                (step) => `
              <div class="step step-${step.result.status}">
                ${step.keyword}${step.name} - ${step.result.status}
              </div>
            `
              )
              .join('')}
          </div>
        `
          )
          .join('')}
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>`;
}

async function main(): Promise<void> {
  const jsonPath = path.join(process.cwd(), 'reports/cucumber/report.json');
  const htmlPath = path.join(process.cwd(), 'reports/cucumber/report.html');

  if (!fs.existsSync(jsonPath)) {
    console.error('Error: Cucumber JSON report not found at', jsonPath);
    console.error('Run "npm run test:acceptance:report" first to generate the JSON report.');
    process.exit(1);
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const features: CucumberFeature[] = JSON.parse(jsonContent);

  const htmlContent = generateHtmlReport(features);

  const outputDir = path.dirname(htmlPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(htmlPath, htmlContent);
  console.log('HTML report generated:', htmlPath);
}

main().catch((error) => {
  console.error('Error generating report:', error);
  process.exit(1);
});
