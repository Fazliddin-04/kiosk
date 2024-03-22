module.exports = {
  locales: ['ru', 'en', 'uz'],
  defaultLocale: 'ru',
  loadLocaleFrom: (lang, ns) =>
    import(`/src/locales/${lang}/${ns}.json`).then((m) => m.default),
  pages: {
    '*': ['common']

  },
  localeDetection: false,
}
