import { useState, useEffect, memo, useCallback, useRef } from 'react'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'
// MUI
import { ChevronLeftRounded } from '@mui/icons-material'
// Components
import CardX from '../CardX/CardX'
import Button from '../Button/Button'
import Bill from '../Bill'
// Style
import styles from './style.module.scss'
import axios from 'axios'
import FormDialog from '../FormDialog/FormDialog'
import Carousel from '../Carousel/Carousel'
import MiniCard from '../MiniCard/MiniCard'
import { fetcher } from 'utils/fetcher'
import { useDispatch, useSelector } from 'react-redux'
import { CLEAR } from 'store/cart/cartSlice'

function Cart({ set }) {
  const [isDialog, setIsDialog] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLoading, setLoading] = useState(false)

  const productsId = useRef(null)
  const dispatch = useDispatch()
  const { t } = useTranslation('common')
  const { cart } = useSelector((state) => state.cart)

  const { data: favourites } = useSWR(
    productsId?.current
      ? '/v2/product-favourites?product_ids=' + productsId.current
      : null,
    fetcher
  )

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

  const onSubmit = useCallback(() => {
    setLoading(true)
    const data = {
      message: {
        from: {
          id: webApp?.initDataUnsafe?.user?.id,
          is_bot: false,
        },
        chat: {
          id: tg_chat_id,
          type: 'private',
        },
        date: Date.now(),
        web_app_data: {
          button_text: '',
          data: '',
        },
      },
    }
    // Send products data
    axios
      .post(process.env.NEXT_PUBLIC_TG_BOT_URL, {
        id: `${tg_chat_id}:${shipper_id}`,
        products: cart,
      })
      .then((res1) => {
        if (res1.status === 200) {
          dispatch(CLEAR())
          axios.post(webhook_url, data).finally(() => {
            webApp?.close()
            setLoading(false)
          })
        }
      })
      .catch((err) => {
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, tg_chat_id, shipper_id, webApp, webhook_url])

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
        <Button style={{ width: '100%' }} onClick={() => set(false)}>
          {t('back_to_menu')}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className={styles.cart}>
        <div className={styles.header}>
          <div>
            <div className={styles.back_button}>
              <ChevronLeftRounded fontSize="large" onClick={() => set(false)} />
            </div>
            <h2>{t('cart')}</h2>
          </div>
          <div onClick={() => setIsDialog(true)}>Очистить корзину</div>
        </div>
        <div className={styles.flexbox_col_between}>
          <div className={styles.box}>
            {cart?.map((item) => (
              <CardX key={item.key} product={item} />
            ))}
          </div>
          {favourites?.favourites?.length > 0 && (
            <div className={styles.favourites}>
              <h3>{t('something_else?')}</h3>
              <Carousel>
                {favourites?.favourites?.map((product) => (
                  <MiniCard key={product.id} product={product} />
                ))}
              </Carousel>
            </div>
          )}

          <div>
            <Bill totalPrice={totalPrice} />
            <Button
              color={isLoading ? 'disabled' : 'primary'}
              type="submit"
              onClick={onSubmit}
            >
              {t('checkout_order')}
            </Button>
          </div>
        </div>
      </div>
      <FormDialog
        open={isDialog}
        title={t('attention')}
        usedFor="alert"
        descr={t('are_you_sure-cart')}
        handleClose={() => setIsDialog(false)}
      >
        <div className={styles.flexbox}>
          <Button color="grayscale" onClick={() => setIsDialog(false)}>
            {t('no')}
          </Button>
          <Button onClick={() => dispatch(CLEAR())}>{t('yes')}</Button>
        </div>
      </FormDialog>
    </>
  )
}

export default memo(Cart)
