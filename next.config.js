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
    DEFAULT_IMG: baseUrl + '812cbd25-1110-4b99-a24c-3d2d14eab3a0',
  },
})

module.exports = nextConfig
