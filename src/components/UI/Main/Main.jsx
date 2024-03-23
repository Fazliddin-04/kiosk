import { useEffect, useState, useRef, forwardRef } from 'react'
import { Container, Dialog, DialogContent, Grid, Slide } from '@mui/material'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { fetcher } from 'utils/fetcher'
import Card from '../Card/Card'
import ComboCard from '../ComboCard/ComboCard'
import OriginCard from '../OriginCard/OriginCard'
import Category from '../Category'
import Intro from '../Intro'

import styles from './style.module.scss'
import { getCategoryWithChildren } from 'services'
import Sidebar from './components/Sidebar'
import FooterCart from './components/FooterCart'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />
})

const only_self_pickup = 'false'
const branch_id = ''
const client_id = ''
const menu_id = ''

function Main() {
  const [activeCategory, setActiveCategory] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [intro, setIntro] = useState(true)

  const { cart } = useSelector((state) => state.cart)

  const router = useRouter()
  const catalogRef = useRef(null)

  const { data: products } = useSWR(
    `/v2/product?page=1&limit=50&category_id=${
      activeCategory?.id || ''
    }&fields=image,description&product_types=origin,simple,combo`,
    (url) => fetcher(url)
  )

  return (
    <>
      <main className={styles.main}>
        <Sidebar set={setActiveCategory} active={activeCategory} />
        <section className={styles.section}>
          <h2>{activeCategory?.title?.[router.locale]}</h2>
          <Grid container spacing={2} columns={2}>
            {products?.products?.map((product) => (
              <Grid item key={product.id} xs={1}>
                {product.type === 'combo' ? (
                  <ComboCard product={product} />
                ) : product.type === 'origin' ? (
                  <OriginCard product={product} />
                ) : (
                  <Card product={product} />
                )}
              </Grid>
            ))}
          </Grid>
        </section>
      </main>

      <FooterCart />
      <Intro
        open={intro}
        onClose={() => setIntro(false)}
        onOpen={() => setIntro(true)}
      />
    </>
  )
}

export default Main
