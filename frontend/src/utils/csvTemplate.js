export const downloadCSVTemplate = () => {
  const headers = [
    'Company', 'Role', 'Source', 'Status',
    'Location', 'Salary', 'Applied Date',
    'Follow-up Date', 'Job URL', 'Notes',
  ];

  const example = [
    'Google', 'Full Stack Developer', 'LinkedIn',
    'Applied', 'Bangalore', '15-20 LPA',
    '2025-04-15', '2025-04-22',
    'https://careers.google.com/jobs/123',
    'Applied through referral',
  ];

  const csvContent = [headers.join(','), example.join(',')].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'applications-template.csv';
  a.click();
  URL.revokeObjectURL(url);
};
