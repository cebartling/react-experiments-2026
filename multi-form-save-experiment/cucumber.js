export default {
  default: {
    paths: ['features/**/*.feature'],
    import: ['features/step-definitions/**/*.ts', 'features/support/**/*.ts'],
    loader: ['tsx'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
