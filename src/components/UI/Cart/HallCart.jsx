import { useState, useEffect, memo, useCallback, useRef } from 'react'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'
import { useDispatch, useSelector } from 'react-redux'
import { fetcher } from 'utils/fetcher'
import { updateId } from 'store/order/orderSlice'
// MUI
import { ChevronLeftRounded } from '@mui/icons-material'
import { RadioGroup } from '@mui/material'
// Components
import CardX from '../CardX/CardX'
import Button from '../Button/Button'
import Bill from '../Bill'
import FormDialog from '../FormDialog/FormDialog'
import Carousel from '../Carousel/Carousel'
import MiniCard from '../MiniCard/MiniCard'
import Textarea from '../Textarea'
import CustomRadio from '../CustomRadio'
import { createOrder } from 'services'
import AuthDialog from '../AuthDialog'
// Style
import styles from './style.module.scss'
import { CLEAR } from 'store/cart/cartSlice'
import { setIdDetails } from 'store/queries/querySlice'
import { useRouter } from 'next/router'

const branch_id = ''

function HallCart({ set }) {
  const [isTrusted, setTrusted] = useState(false)
  const [isDialog, setIsDialog] = useState(false)
  const [isAuthDialog, setAuthDialog] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLoading, setLoading] = useState(false)
  const [stepsData, setStepsData] = useState({
    address: '',
    branch_id: '',
    branch_name: '',
    description: '',
    destination_address: '',
    location: {
      lat: null,
      long: null,
    },
    phone_number: '',
    products: [],
  })
  const [formData, setFormData] = useState({
    aggregator_id: null,
    accommodation: '',
    apartment: '',
    building: '',
    co_delivery_price: 0,
    delivery_type: 'hall',
    discounts: [],
    extra_phone_number: '',
    description: '',
    floor: '',
    id: '',
    fare_id: '',
    future_time: null,
    is_cancel_old_order: false,
    is_courier_call: true,
    is_preorder: false,
    is_reissued: false,
    paid: false,
    payment_type: '',
    source: 'hall',
    status_id: 'ccb62ffb-f0e1-472e-bf32-d130bea90617',
    steps: [],
    to_address: '',
    to_location: { lat: 41.26935630336735, long: 69.23841858451905 },
  })

  const router = useRouter()
  const dispatch = useDispatch()
  const productsId = useRef(null)
  const { t } = useTranslation('common')
  const { cart } = useSelector((state) => state.cart)
  const { order_type } = useSelector((state) => state.order)
  const { user } = useSelector((state) => state.auth)

  const { data: favourites } = useSWR(
    productsId?.current
      ? '/v2/product-favourites?product_ids=' + productsId.current
      : null,
    fetcher
  )

  const { data: branchData } = useSWR(
    branch_id ? '/v1/branches/' + branch_id : null,
    fetcher
  )

  useEffect(() => {
    if (branchData) {
      setStepsData((prevState) => ({
        ...prevState,
        address: branchData.address,
        branch_id: branchData.id,
        branch_name: branchData.name,
        destination_address: branchData.destination,
        phone_number: branchData.phone,
        location: {
          lat: branchData.location.lat,
          long: branchData.location.long,
        },
      }))
    }
  }, [branchData])

  useEffect(() => {
    if (cart.length > 0) {
      let total = 0
      const productArr = []
      for (const item of cart) {
        total += item.price * item.quantity
        if (item.order_modifiers.length > 0) {
          for (const modifier of item.order_modifiers) {
            total +=
              +modifier.modifier_price *
              +(modifier?.modifier_quantity * item.quantity)
          }
        }
        const mockProduct = {
          price: item.price,
          product_id: item.product_id,
          type: item.type,
          variants: item.variants,
          quantity: item.quantity,
          client_id: user?.id,
          order_modifiers: [],
        }
        if (item.order_modifiers.length > 0) {
          for (const modifier of item.order_modifiers) {
            mockProduct.order_modifiers.push({
              ...modifier,
              modifier_quantity:
                item.quantity > 1
                  ? modifier.modifier_quantity * item.quantity
                  : modifier.modifier_quantity,
              name: undefined,
              type: undefined,
            })
          }
        }
        productArr.push(mockProduct)
      }
      setTotalPrice(total)
      setStepsData((prevState) => ({ ...prevState, products: productArr }))
    }
  }, [cart, user?.id])

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

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const onSubmit = useCallback(() => {
    setLoading(true)
    const data = {
      ...formData,
      delivery_type: order_type || 'hall',
      client_id: user?.id,
      steps: [stepsData],
      crm_table_id,
      crm_table_number: +crm_table_number,
    }

    createOrder(data, { Authorization: user?.access_token })
      .then((res) => {
        dispatch(CLEAR())
        dispatch(updateId(res?.order_id))
        router.push('/')
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, stepsData, user?.id, user?.access_token, set])

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
          {crm_table_number && (
            <h3>
              {t('table_number')}: {crm_table_number}
            </h3>
          )}
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
            <section>
              <h3>{t('comment')}</h3>
              <Textarea
                id="description"
                placeholder={t('comment_example')}
                value={formData.description}
                onChange={onChange}
              />
            </section>
            <section>
              <h3>{t('payment_method')}</h3>
              <RadioGroup
                aria-labelledby="payment-method"
                value={formData.payment_type}
                onChange={onChange}
                className={styles.payment_types}
              >
                {payment_types?.map(
                  (type) =>
                    type.is_used && (
                      <CustomRadio
                        key={type.value}
                        id="payment_type"
                        value={type.value}
                        src={`/images/${
                          type.value === 'apelsin' ? 'uzum' : type.value
                        }.svg`}
                        label={
                          type.label === 'Apelsin' ? 'Uzum Pay' : type.label
                        }
                      />
                    )
                )}
              </RadioGroup>
            </section>
            <Bill totalPrice={totalPrice} />
            <Button
              color={
                isLoading || !formData?.payment_type ? 'disabled' : 'primary'
              }
              disabled={isLoading || !formData?.payment_type}
              type="submit"
              onClick={() =>
                !(isLoading || !formData?.payment_type) && setTrusted(true)
              }
            >
              {t(
                !formData?.payment_type
                  ? 'select_payment_method'
                  : 'checkout_order'
              )}
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
      <FormDialog
        open={isTrusted}
        title={t('attention')}
        usedFor="alert"
        descr={t('are_you_sure-order', {
          warning:
            formData.payment_type === 'payme' ||
            formData.payment_type === 'click' ||
            formData.payment_type === 'uzum' ||
            formData.payment_type === 'apelsin'
              ? t('online_payment_warning')
              : '',
        })}
        handleClose={() => setTrusted(false)}
      >
        <div className={styles.flexbox}>
          <Button color="grayscale" onClick={() => setTrusted(false)}>
            {t('no')}
          </Button>
          <Button
            onClick={() => {
              setTrusted(false)
              user ? onSubmit() : setAuthDialog(true)
            }}
          >
            {t('yes')}
          </Button>
        </div>
      </FormDialog>
      <AuthDialog
        open={isAuthDialog}
        handleClose={() => setAuthDialog(false)}
        onLastConfirm={onSubmit}
      />
    </>
  )
}

export default memo(HallCart)
