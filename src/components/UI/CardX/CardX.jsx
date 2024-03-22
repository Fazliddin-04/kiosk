import { useState, useEffect, memo, useCallback, useContext } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'
// Utils
import { fetcher } from 'utils/fetcher'
import numToPrice from 'utils/numToPrice'
// Components
import Counter from '../Counter/Counter'
import FormDialog from '../FormDialog/FormDialog'
import Button from '../Button/Button'
// Style
import classNames from 'classnames'
import styles from './style.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { DECREMENT, INCREMENT, REMOVE } from 'store/cart/cartSlice'
import NumberToPrice from '../NumberToPrice'

function CardX({ product, className, ordered }) {
  const [isDialog, setIsDialog] = useState(false)
  const [variantsInfo, setVariantsInfo] = useState([])
  const [modifiersData, setModifiersData] = useState(null)

  const router = useRouter()
  const dispatch = useDispatch()
  const { t } = useTranslation('common')
  const { cart } = useSelector((state) => state.cart)

  const { data: modifiers } = useSWR(
    !ordered && product?.order_modifiers.length > 0
      ? '/v2/modifier?product_id=' + product.product_id
      : null,
    fetcher
  )

  const { data: variantsData, error: comboErr } = useSWR(
    !ordered && product.type === 'combo' && product?.variants
      ? '/v2/combo/' + product.product_id
      : null,
    fetcher
  )
  const { data: productData, error: productErr } = useSWR(
    !ordered ? '/v2/product/' + product.product_id : null,
    fetcher
  )

  useEffect(() => {
    if (variantsData && product?.variants) {
      // If products is combo, get info about variants
      let variantMap = []
      variantsData.groups.map((group, idx) => {
        if (group.id === product?.variants[idx].group_id) {
          group.variants.map((variant) => {
            if (variant.id === product?.variants[idx].variant_id) {
              variantMap.push(variant)
            }
          })
        }
      })
      setVariantsInfo(variantMap)
    }
  }, [variantsData, product])

  useEffect(() => {
    if (productErr || comboErr) {
      dispatch(REMOVE(product.key))
    }
  }, [comboErr, dispatch, product.key, productErr])

  const onIncrease = () => {
    dispatch(INCREMENT(product?.key))
  }

  const onDecrease = () => {
    product.quantity <= 1
      ? setIsDialog(true)
      : dispatch(DECREMENT(product?.key))
  }

  const removeHandler = () => {
    dispatch(REMOVE(product?.key))
    setIsDialog(false)
  }

  useEffect(() => {
    if (modifiers?.product_modifiers) {
      let modifiersTitle = []
      for (const key in modifiers.product_modifiers) {
        if (Object.hasOwnProperty.call(modifiers.product_modifiers, key)) {
          const value = modifiers.product_modifiers[key]
          if (key == 'single_modifiers' && value)
            value.map((mod) => {
              const modifierInCart = getModifierInCart(mod.id)
              if (modifierInCart) {
                modifiersTitle.push({
                  id: mod.id,
                  title: mod.name,
                  price: mod.price,
                  quantity: modifierInCart.modifier_quantity,
                })
              }
            })
          if (key == 'group_modifiers' && value)
            value.map((mod) =>
              mod?.variants?.map((variant) => {
                const modifierInCart = getModifierInCart(variant.id)
                if (modifierInCart) {
                  modifiersTitle.push({
                    id: variant.id,
                    title: variant.title,
                    price: variant.out_price,
                    quantity: modifierInCart.modifier_quantity,
                  })
                }
              })
            )
        }
      }
      setModifiersData(modifiersTitle)
    }
  }, [modifiers?.product_modifiers, getModifierInCart])

  const getModifierInCart = useCallback(
    (modifierId) => {
      let result
      cart?.map(
        (item) =>
          product.key == item.key &&
          item.order_modifiers.map((item) =>
            item.modifier_id === modifierId ? (result = item) : item
          )
      )
      return result
    },
    [cart, product.key]
  )

  return (
    <>
      <div
        className={classNames(styles.cardX, {
          [styles.ordered]: ordered,
          [className]: className,
        })}
      >
        <div className={styles.cardX_img}>
          {productData?.title && !ordered ? (
            <Image
              src={
                productData?.image
                  ? process.env.BASE_URL + productData?.image
                  : process.env.BASE_URL +
                    '9440048a-fe6b-4be7-9541-d94d2a8d1951'
              }
              alt={productData?.title[router.locale]}
              objectFit="cover"
              layout="fill"
              priority={true}
            />
          ) : (
            ordered &&
            product && (
              <Image
                src={
                  product?.image
                    ? process.env.BASE_URL + product?.image
                    : process.env.BASE_URL +
                      'f1bedaa2-2682-4fe1-9564-05a31aa66852'
                }
                alt={product?.name}
                objectFit="cover"
                layout="fill"
                priority={true}
              />
            )
          )}
        </div>
        <div className={styles.content}>
          <div>
            <h4
              className={classNames(styles.title, {
                [styles.loading]: productData == null && !ordered,
              })}
            >
              {ordered ? (
                <>
                  {product?.name}
                  <br />
                  {product?.quantity} {t('pcs')}
                </>
              ) : (
                productData?.title && productData?.title[router.locale]
              )}
            </h4>
            {!ordered && (
              <p
                className={classNames(styles.description, {
                  [styles.loading]:
                    (ordered && !product) || (!ordered && !productData),
                })}
              >
                {variantsInfo.length > 0 &&
                  variantsInfo.map((variant, idx) => (
                    <span
                      key={
                        product?.variants[idx].group_id +
                        product?.variants[idx].variant_id
                      }
                    >
                      {variant.title[router.locale]} (
                      {product?.variants[idx].variant_id === variant.id &&
                        product?.variants[idx].quantity}{' '}
                      {t('pcs')}){variantsInfo?.length - 1 !== idx && ', '}
                      {}
                    </span>
                  ))}
                {modifiersData?.map((modifier, idx) => (
                  <span key={modifier.id}>
                    {modifier.title[router.locale]} ({modifier.quantity}{' '}
                    {t('pcs')}){modifiersData?.length - 1 !== idx && ', '}
                  </span>
                ))}
                {!modifiers &&
                  !variantsInfo.length &&
                  productData?.description &&
                  productData?.description[router.locale].substring(0, 120) +
                    (productData?.description[router.locale].length > 120
                      ? '...'
                      : '')}
              </p>
            )}
          </div>
          <div className={styles.actions}>
            {!ordered && (
              <Counter
                className={styles.counter}
                variable={product?.quantity}
                onDecrease={onDecrease}
                onIncrease={onIncrease}
              />
            )}
            <p className={styles.price}>
              {ordered ? (
                <NumberToPrice value={product?.total_amount} />
              ) : (
                <NumberToPrice value={product?.price} />
              )}
            </p>
          </div>
        </div>
      </div>
      <FormDialog
        open={isDialog}
        title={t('attention')}
        usedFor="alert"
        descr={t('are_you_sure-product')}
        handleClose={() => setIsDialog(false)}
      >
        <div className={styles.flexbox}>
          <Button color="grayscale" onClick={() => setIsDialog(false)}>
            {t('no')}
          </Button>
          <Button onClick={() => removeHandler()}>{t('yes')}</Button>
        </div>
      </FormDialog>
    </>
  )
}

export default memo(CardX)
