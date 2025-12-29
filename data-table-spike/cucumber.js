export default {
  import: ['features/**/*.ts'],
  format: ['progress-bar', 'html:reports/cucumber/report.html'],
  formatOptions: { snippetInterface: 'async-await' },
  publishQuiet: true,
};
