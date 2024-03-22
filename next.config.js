/** @type {import('next').NextConfig} */
const nextTranslate = require('next-translate')

let baseUrl = 'https://cdn.delever.uz/delever/'

// if (process.env.NEXT_PUBLIC_TEST === 'prod') {
//   baseUrl = 'https://cdn.delever.uz/delever/'
// }

const nextConfig = nextTranslate({
  reactStrictMode: true,
  images: {
    domains: ['cdn.delever.uz'],
  },
  env: {
    BASE_URL: baseUrl,
  },
})

module.exports = nextConfig
