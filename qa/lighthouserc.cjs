module.exports = {
  ci: {
    collect: {
      url: [
        'https://qexus.github.io/',
        'https://qexus.github.io/manac/',
        'https://qexus.github.io/fisheries/',
        'https://qexus.github.io/fisheries-ca/',
      ],
      numberOfRuns: 1,
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: '--headless --no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      // Second baseline: compare published builds after Manac accessible-name/CSP/image and repository publishing fixes.
      // Report low scores rather than failing deployment due to network variability.
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './qa/lighthouse-reports' },
  },
};
