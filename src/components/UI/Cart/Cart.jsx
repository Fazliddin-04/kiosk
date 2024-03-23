import { useState, useEffect, memo, useCallback, useRef } from 'react'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
// Components
import CardX from '../CardX/CardX'
import Button from '../Button/Button'
// Style
import styles from './style.module.scss'
import FormDialog from '../FormDialog/FormDialog'
import { useDispatch, useSelector } from 'react-redux'
import { CLEAR } from 'store/cart/cartSlice'
import { useRouter } from 'next/router'
import { Box, Grid } from '@mui/material'
import numToPrice from 'utils/numToPrice'
import Footer from 'components/UI/Footer'
import Link from 'next/link'

function Cart() {
  const [isDialog, setDialog] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLoading, setLoading] = useState(false)

  const router = useRouter()
  const productsId = useRef(null)
  const dispatch = useDispatch()
  const { t } = useTranslation('common')
  const { cart } = useSelector((state) => state.cart)

  // const { data: favourites } = useSWR(
  //   productsId?.current
  //     ? '/v2/product-favourites?product_ids=' + productsId.current
  //     : null,
  //   fetcher
  // )

  useEffect(() => {
    if (cart.length > 0) {
      let total = 0
      cart?.map((product) => {
        total += product.price * product.quantity
        if (product.order_modifiers.length > 0) {
          for (const modifier of product.order_modifiers) {
            total +=
              +modifier.modifier_price *
              +(modifier?.modifier_quantity * product.quantity)
          }
        }
      })
      setTotalPrice(total)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])

  // Get Product Favourites
  useEffect(() => {
    const productIdsArr = []
    if (cart.length > 0) {
      for (const product of cart) {
        productIdsArr.push(product.product_id)
      }
      productsId.current = productIdsArr.join(',')
    }
  }, [cart])

  const onSubmit = () => {
    setLoading(true)
    const data = {}
    // Send products data
    console.log('submitted!')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  if (cart.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.info}>
          <Image
            src="/images/empty_cart.svg"
            alt="empty cart"
            width={100}
            height={100}
            priority={true}
          />
          <p>{t('your_basket_is_empty')}</p>
        </div>
        <Button style={{ width: '100%' }} onClick={() => router.push('/')}>
          {t('back_to_menu')}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className={styles.cart}>
        <div className={styles.box}>
          <Grid columns={4} container p={3}>
            {cart?.map((item) => (
              <Grid item xs={1} key={item.key}>
                <CardX product={item} />
              </Grid>
            ))}
            {/* {favourites?.favourites?.length > 0 && (
            <div className={styles.favourites}>
              <h3>{t('something_else?')}</h3>
              <Carousel>
                {favourites?.favourites?.map((product) => (
                  <MiniCard key={product.id} product={product} />
                ))}
              </Carousel>
            </div>
          )} */}
          </Grid>
        </div>
        <Grid
          columns={3}
          container
          sx={{ placeItems: 'center' }}
          p={3}
          borderTop="1px solid #fff"
          borderBottom="1px solid #fff"
          fontSize={24}
          fontWeight={700}
        >
          <Grid item xs={1}>
            Итого
          </Grid>
          <Grid item xs={1}>
            <p style={{ textAlign: 'center', color: '#FFD300' }}>
              {numToPrice(totalPrice)}
            </p>
          </Grid>
          <Grid item xs={1}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/checkout" passHref>
                <Button color={isLoading ? 'disabled' : 'secondary'}>
                  {t('checkout_order')}
                </Button>
              </Link>
            </div>
          </Grid>
        </Grid>

        <Footer />
      </div>
      <FormDialog
        open={isDialog}
        title={t('attention')}
        usedFor="alert"
        descr={t('are_you_sure-cart')}
        handleClose={() => setDialog(false)}
      >
        <div className={styles.flexbox}>
          <Button color="grayscale" onClick={() => setDialog(false)}>
            {t('no')}
          </Button>
          <Button onClick={() => dispatch(CLEAR())}>{t('yes')}</Button>
        </div>
      </FormDialog>
    </>
  )
}

export default memo(Cart)
