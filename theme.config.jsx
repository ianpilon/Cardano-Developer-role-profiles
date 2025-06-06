const React = require('react')

module.exports = {
  logo: <span style={{ fontWeight: 'bold' }}>Cardano Developer Profiles</span>,
  project: {
    link: 'https://github.com/cardano-foundation',
  },
  docsRepositoryBase: 'https://github.com/yourusername/cardano-docs',
  footer: {
    text: `© ${new Date().getFullYear()} Cardano Developer Profiles`,
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Cardano Developer Profiles'
    }
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    titleComponent: ({ title }) => <>{title}</>
  },
  navigation: {
    prev: true,
    next: true
  },
  toc: {
    float: true,
    title: "On This Page",
  },
  darkMode: true,
}
