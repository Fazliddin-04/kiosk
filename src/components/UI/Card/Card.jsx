import { useState, useEffect, memo, useCallback, useContext } from 'react'
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
// Hooks
import useCartProduct from 'hooks/useCartProduct'
// Components
import AddToCart from '../AddToCart'
import Button from '../Button/Button'
import CheckboxModifier from '../CheckboxModifier'
import Carousel from '../Carousel/Carousel'
import MiniCard from '../MiniCard/MiniCard'
import OrderDialog from '../OrderDialog/OrderDialog'
import ModifierCheckbox from '../ModifierCheckbox/ModifierCheckbox'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'
import { Grid } from '@mui/material'
import { useDispatch } from 'react-redux'
import { ADD_TO_CART, DECREMENT, INCREMENT, REMOVE } from 'store/cart/cartSlice'
import NumberToPrice from '../NumberToPrice'

const menu_id = ''

function Card({ size, product }) {
  const [isOrderPopup, setisOrderPopup] = useState(false)
  const [orderModifiers, setOrderModifiers] = useState([])
  const [modifiersPrice, setModifiersPrice] = useState(0)
  const [modifiersQuantity, setModifiersQuantity] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0)

  const dispatch = useDispatch()

  const { data: modifiers } = useSWR(
    isOrderPopup && product.has_modifier
      ? '/v2/modifier?product_id=' + product.id
      : null,
    fetcher
  )

  const { data: favouritesData } = useSWR(
    isOrderPopup ? '/v2/product-favourites?product_ids=' + product.id : null,
    fetcher
  )

  const router = useRouter()
  const { t } = useTranslation('common')

  const { isOrdered, productInCart } = useCartProduct(
    product.id,
    orderModifiers
  )

  const addToCartHandler = useCallback(() => {
    dispatch(
      ADD_TO_CART({
        price: product.out_price + totalDiscountPrice,
        product_id: product.id,
        type: product.type,
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
  }, [
    orderModifiers,
    product.id,
    product.out_price,
    product.type,
    product.title,
    router.locale,
    quantity,
    dispatch,
    totalDiscountPrice,
  ])

  const onClickCardHandler = useCallback(() => {
    !product.has_modifier ? addToCartHandler() : setisOrderPopup(true)
  }, [product.has_modifier, addToCartHandler])

  const onOrderClick = () => {
    addToCartHandler()
    setisOrderPopup(false)
    setOrderModifiers([])
  }

  const removeHandler = () => {
    dispatch(REMOVE(productInCart?.key))
    setisOrderPopup(false)
    setQuantity(1)
  }

  const modifierQuantityHandler = (modifierId) => {
    if (isOrderedModifierHandler(modifierId)) {
      let elementQuantity = 0
      productInCart?.order_modifiers.map((item) => {
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
    if (productInCart?.order_modifiers.length > 0) {
      let isIncluded = false
      productInCart?.order_modifiers.map((item) => {
        item.modifier_id == modifierId && (isIncluded = true)
      })
      return isIncluded
    }
  }

  // Select first group modifiers, save group modifiers id & min_amount to state
  useEffect(() => {
    if (isOrderPopup && product.has_modifier) {
      let compulsoryModifiers = []
      let firstGroupItems = []
      let modifiersQuantityMock = []
      if (modifiers?.product_modifiers?.single_modifiers) {
        for (const modifier of modifiers?.product_modifiers?.single_modifiers) {
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
      if (modifiers?.product_modifiers?.group_modifiers) {
        for (const group of modifiers?.product_modifiers?.group_modifiers) {
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
    }
  }, [modifiers, product.has_modifier, isOrderPopup])
  // Get total price of modifiers
  useEffect(() => {
    if (orderModifiers) {
      let sum = 0
      for (const modifier of orderModifiers) {
        sum += modifier.modifier_price * modifier.modifier_quantity
      }
      setModifiersPrice(sum)
    }
  }, [orderModifiers])
  // Filter order modifiers (modifier price == 0 && remove from state)
  useEffect(() => {
    if (orderModifiers.length > 0) {
      const filteredState = orderModifiers.filter(
        (item) => item.modifier_quantity !== 0
      )
      setOrderModifiers(filteredState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modifiersQuantity])
  // Calculate discounts total price
  useEffect(() => {
    if (product?.discounts?.length > 0) {
      let sum = 0
      for (const discount of product.discounts) {
        sum += discount.discount_price
      }
      setTotalDiscountPrice(sum)
    }
  }, [product.discounts])

  return (
    <>
      <div
        className={classNames(styles.card, {
          [styles.small]: size === 'sm',
          [styles.unavailable]: menu_id ? !product.active_in_menu : false,
        })}
      >
        <div
          className={classNames(styles.card_img, {
            [styles.loading]: !product.image,
          })}
          onClick={
            (menu_id && product.active_in_menu) || !menu_id
              ? () => setisOrderPopup(true)
              : undefined
          }
        >
          <Image
            src={
              product.image
                ? process.env.BASE_URL + product.image
                : process.env.DEFAULT_IMG
            }
            alt={product.title[router.locale]}
            objectFit="cover"
            layout="fill"
          />
        </div>
        <div
          className={styles.card_content}
          onClick={
            (menu_id && product.active_in_menu) || !menu_id
              ? () => setisOrderPopup(true)
              : undefined
          }
        >
          <h4 className={styles.title}>{product.title[router.locale]}</h4>
          <p className={styles.description}>
            {product.description[router.locale].substring(0, 35) +
              (product.description[router.locale].length > 35 ? '...' : '')}
          </p>
        </div>
        <div className={styles.card_actions}>
          <p className={styles.price}>
            {product?.discounts?.length > 0 ? (
              <>
                <strike className={styles.original_price}>
                  <NumberToPrice value={product.out_price} />
                </strike>{' '}
                <span className={styles.with_discount}>
                  <NumberToPrice
                    value={product.out_price + totalDiscountPrice}
                  />
                </span>
              </>
            ) : (
              <NumberToPrice value={product.out_price} />
            )}
          </p>
          <div className={styles.button}>
            {(menu_id && product.active_in_menu) || !menu_id ? (
              <AddToCart
                onClick={onClickCardHandler}
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
      </div>
      <OrderDialog
        open={isOrderPopup}
        setQuantity={setQuantity}
        quantity={quantity}
        product={product}
        discountPrice={totalDiscountPrice}
        productInCart={productInCart}
        isOrdered={isOrdered}
        modifiersPrice={modifiersPrice}
        removeHandler={removeHandler}
        onOrderClick={onOrderClick}
        handleClose={() => setisOrderPopup(false)}
      >
        <div className={styles.dialog_content}>
          {modifiers?.product_modifiers?.single_modifiers &&
            modifiers?.product_modifiers?.single_modifiers.map((modifier) => (
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
            ))}
          {modifiers?.product_modifiers?.group_modifiers &&
            modifiers?.product_modifiers?.group_modifiers.map(
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
        {favouritesData?.favourites?.length > 0 && (
          <div className={styles.recommended}>
            <h4>{t('something_else?')}</h4>
            <div className={styles.box}>
              <Carousel size="small">
                {favouritesData?.favourites?.map((product) => (
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

export default memo(Card)
