import { useState, useEffect, useCallback, memo, useContext } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useSWR from 'swr'
// Utils
import { fetcher } from 'utils/fetcher'
import numToPrice from 'utils/numToPrice'
import {
  onModifierChange,
  onGroupModifierChange,
  onIncreaseModifierQuantity,
  onIncreaseModifierVariantQuantity,
  onDecreaseModifierQuantity,
  onDecreaseModifierVariantQuantity,
} from 'utils/modifierActions'
// hooks
import useCartProduct from 'hooks/useCartProduct'
// Components
import { toast } from 'react-toastify'
import { RadioGroup, FormControlLabel, Radio, Grid } from '@mui/material'
import ModifierCheckbox from '../ModifierCheckbox/ModifierCheckbox'
import MiniCard from '../MiniCard/MiniCard'
import Carousel from '../Carousel/Carousel'
import OrderDialog from '../OrderDialog/OrderDialog'
import Button from '../Button/Button'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'
import AddToCart from '../AddToCart'
import CheckboxModifier from '../CheckboxModifier'
import { useDispatch } from 'react-redux'
import { ADD_TO_CART, DECREMENT, INCREMENT, REMOVE } from 'store/cart/cartSlice'

const only_self_pickup = 'false'
const branch_id = ''
const client_id = ''
const menu_id = ''

function OriginCard({ size, product }) {
  const [quantity, setQuantity] = useState(1)
  const [originProps, setOriginProps] = useState([])
  const [activeVariant, setActiveVariant] = useState(null)
  const [activeOptions, setActiveOptions] = useState(null)
  const [productVariants, setProductVariants] = useState({})
  const [isOrderPopup, setisOrderPopup] = useState(false)
  const [orderModifiers, setOrderModifiers] = useState([])
  const [modifiersPrice, setModifiersPrice] = useState(0)
  const [modifiersQuantity, setModifiersQuantity] = useState([])
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0)

  const router = useRouter()
  const { t } = useTranslation('common')
  const { isOrdered, productInCart } = useCartProduct(
    activeVariant?.id,
    orderModifiers
  )

  const dispatch = useDispatch()

  const { data: productData } = useSWR(
    isOrderPopup && product?.id
      ? `/v2/product/${product.id}?order_source=bot&only_delivery=false&only_self_pickup=${only_self_pickup}&branch_id=${branch_id}&client_id=${client_id}&with_discounts=true`
      : null,
    fetcher
  )

  const { data: favourites } = useSWR(
    activeVariant
      ? '/v2/product-favourites?product_ids=' + activeVariant?.id
      : null,
    fetcher
  )

  const { data: variantModifiers } = useSWR(
    activeVariant?.has_modifier
      ? '/v2/modifier?product_id=' + activeVariant?.id
      : null,
    fetcher
  )

  const onOrderClick = () => {
    if (product.type == 'origin' && activeVariant) {
      dispatch(
        ADD_TO_CART({
          price: activeVariant?.out_price + totalDiscountPrice,
          product_id: activeVariant?.id,
          type: 'variant',
          variants: [],
          order_modifiers: orderModifiers?.map((item) => ({
            ...item,
            name: undefined,
            type: undefined,
          })),
          quantity: quantity,
          name: product.title[router.locale],
        })
      )
      setisOrderPopup(false)
      setOrderModifiers([])
    } else {
      toast.info('Variantlardan birini tanlang!')
    }
  }

  const onOptionChange = (val, idx) => {
    setActiveOptions((prevState) =>
      prevState.map((e, i) => (i == idx ? val : e))
    )
  }

  const removeHandler = () => {
    dispatch(REMOVE(productInCart?.key))
    setisOrderPopup(false)
    setQuantity(1)
  }

  const modifierQuantityHandler = (modifierId) => {
    if (isOrderedModifierHandler(modifierId)) {
      let elementQuantity = 0
      productInCart?.order_modifiers?.map((item) => {
        item.modifier_id == modifierId &&
          (elementQuantity = item.modifier_quantity)
      })
      return elementQuantity
    }
    const element = orderModifiers.find(
      (item) => item.modifier_id === modifierId
    )
    return element?.modifier_quantity ?? 0
  }
  const checkModifierHandler = (modifierId) => {
    const element = orderModifiers.find(
      (item) => item.modifier_id === modifierId
    )
    return element ? element : isOrderedModifierHandler(modifierId)
  }
  const isOrderedModifierHandler = (modifierId) => {
    if (productInCart?.order_modifiers?.length > 0) {
      let isIncluded = false
      productInCart?.order_modifiers?.map((item) => {
        item.modifier_id == modifierId && (isIncluded = true)
      })
      return isIncluded
    }
  }

  // Get variants & property oprtions & select default variant
  useEffect(() => {
    if (productData) {
      const variantsMap = {}
      const optionsMap = {}
      const firstOptions = []
      for (const variantProduct of productData.variant_products) {
        let optionIds = ''
        for (let j = 0; j < variantProduct.product_property.length; j++) {
          const element = variantProduct.product_property[j]
          optionsMap[element.option_id] = element.option_id
          if (optionIds.length > 0) {
            optionIds += '_' + element.option_id
          } else {
            optionIds += element.option_id
          }
        }
        variantsMap[optionIds] = variantProduct
      }
      setProductVariants(variantsMap)
      setOriginProps(productData.properties)
      // Set first options of property to state
      Object.keys(variantsMap)[0]
        ?.split('_')
        .forEach((option) => {
          firstOptions.push(option)
        })
      setActiveOptions(firstOptions)
    }
  }, [productData])

  // Get modifiers by variant
  useEffect(() => {
    if (variantModifiers) {
      let compulsoryModifiers = []
      let firstGroupItems = []
      let modifiersQuantityMock = []
      if (variantModifiers?.product_modifiers?.single_modifiers) {
        for (const modifier of variantModifiers.product_modifiers
          ?.single_modifiers) {
          if (modifier?.is_compulsory) {
            let compulsoryItem = {
              modifier_id: modifier?.id,
              modifier_price: +modifier?.price,
              modifier_quantity: modifier?.min_amount || 1,
              parent_id: '',
              name: modifier?.name,
            }
            compulsoryModifiers.push(compulsoryItem)
          }
        }
      }
      if (variantModifiers?.product_modifiers?.group_modifiers) {
        for (const group of variantModifiers.product_modifiers
          ?.group_modifiers) {
          modifiersQuantityMock.push({
            id: group.id,
            quantity: group.min_amount,
          })
          let firstGroupItem = {}
          for (let idx = 0; idx < group?.variants?.length; idx++) {
            const variant = group?.variants[idx]
            if (idx === 0)
              firstGroupItem = {
                modifier_id: variant?.id,
                modifier_price: +variant?.out_price,
                modifier_quantity: group?.min_amount || 1,
                parent_id: group?.id,
                name: variant?.title,
                type: 'group',
              }
          }
          firstGroupItems.push(firstGroupItem)
        }
      }
      setOrderModifiers([...firstGroupItems, ...compulsoryModifiers])
      setModifiersQuantity(modifiersQuantityMock)
    } else {
      setOrderModifiers([])
      setModifiersQuantity([])
    }
  }, [variantModifiers])
  // Get ordered modifiers price
  useEffect(() => {
    if (orderModifiers) {
      let sum = 0
      for (const modifier of orderModifiers) {
        sum += modifier.modifier_price * modifier.modifier_quantity
      }
      setModifiersPrice(sum)
    }
  }, [orderModifiers])
  // Set variant by options
  useEffect(() => {
    for (const [key, value] of Object.entries(productVariants)) {
      if (key == activeOptions.join('_')) {
        setActiveVariant(value)
        break
      } else {
        setActiveVariant(null)
      }
    }
  }, [activeOptions, productVariants])

  // Calculate discounts total price
  useEffect(() => {
    if (activeVariant?.discounts) {
      let sum = 0
      for (const discount of activeVariant.discounts) {
        sum += discount.discount_price
      }
      setTotalDiscountPrice(sum)
    }
  }, [activeVariant?.discounts])

  return (
    <>
      <div
        className={classNames(styles.card, {
          [styles.small]: size === 'sm',
          [styles.unavailable]: menu_id ? !product.active_in_menu : false,
        })}
        onClick={
          (menu_id && product.active_in_menu) || !menu_id
            ? () => setisOrderPopup(true)
            : undefined
        }
      >
        <div
          className={classNames(styles.card_img, {
            [styles.loading]: !product.image,
          })}
        >
          <Image
            src={
              product.image
                ? process.env.BASE_URL + product.image
                : process.env.BASE_URL + '9440048a-fe6b-4be7-9541-d94d2a8d1951'
            }
            alt={product.title[router.locale]}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className={styles.card_content}>
          <h4 className={styles.title}>{product.title[router.locale]}</h4>
          {/* {size !== 'sm' && (
            <p className={styles.description}>
              {product.description[router.locale].substring(0, 35) +
                (product.description[router.locale].length > 35 ? '...' : '')}
            </p>
          )} */}
          <p
            dangerouslySetInnerHTML={{
              __html: t('sum_from', {
                price: numToPrice(product.out_price, ''),
              }),
            }}
          />
        </div>
        <div className={styles.card_actions}>
          {(menu_id && product.active_in_menu) || !menu_id ? (
            <AddToCart
              onClick={() => setisOrderPopup(true)}
              isOrdered={isOrdered}
              quantity={productInCart?.quantity}
              onIncrease={() => dispatch(INCREMENT(productInCart?.key))}
              onDecrease={() => {
                productInCart?.quantity > 1
                  ? dispatch(DECREMENT(productInCart?.key))
                  : removeHandler()
              }}
            >
              {t('add')}
            </AddToCart>
          ) : (
            <Button size="sm" color="grayscale">
              {t('will_be_later')}
            </Button>
          )}
        </div>
      </div>
      <OrderDialog
        open={isOrderPopup}
        quantity={quantity}
        isOrdered={isOrdered}
        product={activeVariant}
        discountPrice={totalDiscountPrice}
        productInCart={productInCart}
        modifiersPrice={modifiersPrice}
        setQuantity={setQuantity}
        onOrderClick={onOrderClick}
        removeHandler={removeHandler}
        handleClose={() => setisOrderPopup(false)}
      >
        <div className={styles.dialog_content}>
          {originProps?.map((property, idx) => (
            <div key={property.id} className={styles.option_group}>
              <h4>{property.title[router.locale]}</h4>
              <RadioGroup
                aria-labelledby={property.title.en}
                value={activeOptions[idx]}
                onChange={(e) => onOptionChange(e.target.value, idx)}
              >
                {property.options.map((option) =>
                  idx !== 0
                    ? Object.keys(productVariants).some((item) =>
                        item.includes(
                          idx == 1
                            ? activeOptions[0] + '_' + option.id
                            : idx == 2
                            ? activeOptions[0] +
                              '_' +
                              activeOptions[1] +
                              '_' +
                              option.id
                            : activeOptions[0] +
                              '_' +
                              activeOptions[1] +
                              '_' +
                              activeOptions[2] +
                              '_' +
                              option.id
                        )
                      ) && (
                        <FormControlLabel
                          value={option.id}
                          key={option.id}
                          control={
                            <Radio
                              color="primary"
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          label={option.title[router.locale]}
                          className={styles.option}
                        />
                      )
                    : idx == 0 &&
                      Object.keys(productVariants).some((item) =>
                        item.split('_').includes(option.id)
                      ) && (
                        <FormControlLabel
                          value={option.id}
                          key={option.id}
                          control={
                            <Radio
                              color="primary"
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          label={option.title[router.locale]}
                          className={styles.option}
                        />
                      )
                )}
              </RadioGroup>
            </div>
          ))}
          {variantModifiers?.product_modifiers?.single_modifiers?.map(
            (modifier) => (
              <div
                key={modifier.id + modifier.from_product_id}
                className={styles.single_modifier}
              >
                <h4>{modifier.category_name[router.locale]}</h4>
                <ModifierCheckbox
                  checked={checkModifierHandler(modifier?.id)}
                  quantity={modifierQuantityHandler(modifier?.id) * quantity}
                  name={modifier.name['en']}
                  onChange={({ target }) =>
                    onModifierChange(
                      target.checked,
                      modifier,
                      setOrderModifiers
                    )
                  }
                  label={modifier.name[router.locale]}
                  outPrice={modifier.price}
                  isCompulsory={modifier.is_compulsory}
                  decrease={() =>
                    onDecreaseModifierQuantity(
                      modifier,
                      orderModifiers,
                      setOrderModifiers
                    )
                  }
                  increase={() =>
                    onIncreaseModifierQuantity(
                      modifier,
                      orderModifiers,
                      setOrderModifiers
                    )
                  }
                  single
                />
              </div>
            )
          )}
          {variantModifiers?.product_modifiers?.group_modifiers &&
            variantModifiers?.product_modifiers?.group_modifiers.map(
              (modifier, idx) =>
                modifiersQuantity[idx]?.id === modifier.id &&
                (modifier.is_checkbox ? (
                  <div
                    key={modifier.id + modifier.from_product_id}
                    className={styles.modifier_group_checkbox}
                  >
                    <h4>{modifier.name[router.locale]}</h4>
                    <Grid container spacing={2}>
                      {modifier?.variants.map((variant) => (
                        <Grid item xs={4} key={variant.id}>
                          <CheckboxModifier
                            img={variant.image}
                            checked={checkModifierHandler(variant?.id)}
                            onChange={({ target }) =>
                              onGroupModifierChange(
                                target.checked,
                                variant,
                                modifier,
                                orderModifiers,
                                setOrderModifiers,
                                modifiersQuantity,
                                setModifiersQuantity
                              )
                            }
                            title={variant.title[router.locale]}
                            name={variant.title['en'] + variant.out_price}
                            price={variant.out_price}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                ) : (
                  <div
                    key={modifier.id + modifier.from_product_id}
                    className={styles.modifier_group}
                  >
                    <h4>{modifier.name[router.locale]}</h4>
                    {modifier?.variants.map((variant) => (
                      <div key={variant.id}>
                        <ModifierCheckbox
                          checked={checkModifierHandler(variant?.id)}
                          quantity={
                            modifierQuantityHandler(variant?.id) * quantity
                          }
                          name={variant.title['en']}
                          onChange={({ target }) =>
                            onGroupModifierChange(
                              target.checked,
                              variant,
                              modifier,
                              orderModifiers,
                              setOrderModifiers,
                              modifiersQuantity,
                              setModifiersQuantity
                            )
                          }
                          label={variant.title[router.locale]}
                          outPrice={variant.out_price}
                          decrease={() =>
                            onDecreaseModifierVariantQuantity(
                              variant,
                              modifier,
                              orderModifiers,
                              setOrderModifiers,
                              modifiersQuantity,
                              setModifiersQuantity
                            )
                          }
                          increase={() =>
                            onIncreaseModifierVariantQuantity(
                              variant,
                              modifier,
                              orderModifiers,
                              setOrderModifiers,
                              modifiersQuantity,
                              setModifiersQuantity
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                ))
            )}
        </div>
        {favourites?.favourites?.length > 0 && (
          <div className={styles.recommended}>
            <h4>{t('something_else?')}</h4>
            <div className={styles.box}>
              <Carousel size="small">
                {favourites?.favourites?.map((product) => (
                  <MiniCard key={product.id} product={product} size="small" />
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </OrderDialog>
    </>
  )
}

export default memo(OriginCard)
