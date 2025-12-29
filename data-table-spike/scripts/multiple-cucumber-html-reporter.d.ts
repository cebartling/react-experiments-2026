declare module 'multiple-cucumber-html-reporter' {
  interface ReportMetadata {
    browser?: {
      name: string;
      version: string;
    };
    device?: string;
    platform?: {
      name: string;
      version: string;
    };
  }

  interface ReportOptions {
    jsonDir: string;
    reportPath: string;
    pageTitle?: string;
    reportName?: string;
    displayDuration?: boolean;
    displayReportTime?: boolean;
    metadata?: ReportMetadata;
    customData?: {
      title: string;
      data: Array<{ label: string; value: string }>;
    };
  }

  const reporter: {
    generate(options: ReportOptions): void;
  };

  export default reporter;
}
