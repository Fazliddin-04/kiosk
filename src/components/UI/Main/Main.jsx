import { useEffect, useState, useRef, forwardRef } from 'react'
import { Container, Dialog, DialogContent, Grid, Slide } from '@mui/material'
import useSWR from 'swr'
import { StarBorderRounded } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { fetcher } from 'utils/fetcher'
import Cart from '../Cart/Cart'
import HallCart from '../Cart/HallCart'
import Card from '../Card/Card'
import ComboCard from '../ComboCard/ComboCard'
import OriginCard from '../OriginCard/OriginCard'
import Category from '../Category'
import Intro from '../Intro'

import styles from './style.module.scss'
import { getCategoryWithChildren } from 'services'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />
})

const only_self_pickup = 'false'
const branch_id = ''
const client_id = ''
const menu_id = ''

function Main() {
  const [activeCategory, setActiveCategory] = useState(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [scrollDir, setScrollDir] = useState('scrolling down')
  const [isFixedCatalog, setIsFixedCatalog] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [intro, setIntro] = useState(true)
  const [subcategories, setSubcategories] = useState({})

  const { order_type } = useSelector((state) => state.order)
  const { cart } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)

  const catalogRef = useRef(null)
  const catalogMenuRef = useRef(null)
  const router = useRouter()

  const { data: categories } = useSWR(
    `/v2/category-with-products?page=1&limit=20&order_source=hall&with_discounts=true&only_delivery=false&only_self_pickup=${only_self_pickup}&branch_id=${branch_id}&client_id=${client_id}${
      // menu_id ? '&menu_id=' + menu_id :
      ''
    }${order_type && order_type === 'hall' ? '&order_type=hall' : ''}`,
    (url) => fetcher(url)
  )

  console.log(categories)

  const addSubcategoriesHandler = (category) => {
    if (!subcategories[category?.id] && category?.child_categories?.length > 0)
      getCategoryWithChildren(category?.id, {
        menu_id: menu_id,
      })
        .then((res) =>
          setSubcategories((prevState) => ({
            ...prevState,
            [res?.id]:
              res?.child_categories?.length > 0 && res?.child_categories,
          }))
        )
        .catch((err) => console.log(err))
  }

  // Active category animation
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    if (scrollPosition > catalogRef.current.offsetTop - 10)
      setIsFixedCatalog(true)
    else {
      setIsFixedCatalog(false)
      catalogMenuRef.current.scrollLeft = 0
    }
    catalogRef.current.childNodes.forEach((child) => {
      scrollPosition > child.offsetTop - 60 &&
        scrollPosition < child.offsetTop + child.offsetHeight - 60 &&
        setActiveCategory(child.id)
    })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollPosition])
  // Get next subcategories
  useEffect(() => {
    categories?.categories?.forEach((category, idx) => {
      if (
        activeCategory === category.title.en &&
        categories?.categories?.length - 1 !== idx
      ) {
        let nextCategory = categories?.categories[idx + 1]
        addSubcategoriesHandler(nextCategory)
      } else if (!idx) addSubcategoriesHandler(category)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, categories?.categories])
  // Detecting scroll direction
  useEffect(() => {
    const threshold = 0
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }
      setScrollDir(scrollY > lastScrollY ? 'scrolling down' : 'scrolling up')
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollDir])

  // Change catalog menu scroll-x position
  useEffect(() => {
    if (catalogMenuRef?.current?.childNodes)
      catalogMenuRef.current.childNodes.length &&
        catalogMenuRef.current.childNodes?.forEach((child) => {
          if (child.childNodes[0].attributes[0].value == '#' + activeCategory) {
            catalogMenuRef.current.scrollLeft =
              child.offsetLeft - catalogMenuRef.current.offsetLeft
          }
        })
  }, [activeCategory, scrollDir])

  const handleScroll = () => {
    const position = window.pageYOffset
    setScrollPosition(position)
  }

  return (
    <>
      <main className={styles.main}>
        <Container disableGutters>
          <div className={styles.catalog}>
            <div className={styles.wrapper} ref={catalogMenuRef}>
              {categories?.categories?.map((category) => (
                <div key={category.id}>
                  <a href={`#${category.title.en}`}>
                    <Category
                      title={category.title[router.locale]}
                      img={category?.image}
                      active={activeCategory?.includes(category.title.en)}
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
          <section ref={catalogRef}>
            {categories?.categories?.map((category) => (
              <div
                key={category.id}
                id={category.title.en}
                className={styles.section}
              >
                <h2
                  className={classNames({
                    [styles.parent_category]:
                      subcategories && subcategories[category.id],
                  })}
                >
                  {category.title[router.locale]}
                </h2>
                <Grid
                  container
                  spacing={{ xs: 2, lg: 2 }}
                  columns={{ xs: 2, sm: 3, md: 4, lg: 4 }}
                >
                  {category?.products &&
                    category?.products?.map((product) => (
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
              </div>
            ))}
          </section>
        </Container>
        {cart.length > 0 && (
          <div className={styles.cart} onClick={() => setIsCartOpen(true)}>
            <ShoppingCartRoundedIcon />
            <div className={styles.count}>{cart.length}</div>
          </div>
        )}
      </main>
      <Dialog
        fullScreen={true}
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        TransitionComponent={Transition}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <Cart set={setIsCartOpen} />
        </DialogContent>
      </Dialog>
      <Intro
        open={intro}
        onClose={() => setIntro(false)}
        onOpen={() => setIntro(true)}
      />
    </>
  )
}

export default Main
