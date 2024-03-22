import React from 'react'
import Head from 'next/head'

export default function SEO({ title }) {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5"
      />
      <title>{title || 'Web App'}</title>
      <meta
        name="description"
        content="Mahsulotlar ro'yxati va ma'lumotlarini tezda tanishish uchun veb-ilova"
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || 'Web App'} key="ogtitle" />
      <meta
        property="og:description"
        content="Mahsulotlar ro'yxati va ma'lumotlarini tezda tanishish uchun veb-ilova"
        key="ogdesc"
      />
      <meta
        property="og:site_name"
        content={title || 'Web App'}
        key="ogsitename"
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title || 'Web App'} />
      <meta
        name="twitter:description"
        content="Mahsulotlar ro'yxati va ma'lumotlarini tezda tanishish uchun veb-ilova"
      />
      <meta name="twitter:site" content={title || 'Web App'} />
      <meta name="twitter:creator" content="Delever" />
      <meta name="theme-color" content="#317EFB" />

      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}
