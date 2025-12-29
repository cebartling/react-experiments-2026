export default {
  requireModule: ['tsx'],
  require: ['features/**/*.ts'],
  format: ['progress-bar', 'html:reports/cucumber/report.html'],
  formatOptions: { snippetInterface: 'async-await' },
  publishQuiet: true,
};
