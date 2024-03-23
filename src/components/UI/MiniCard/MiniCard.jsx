import { useState, useEffect, memo, useContext } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useSWR from 'swr'
// Hooks
import useCartProduct from 'hooks/useCartProduct'
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
// Components
import Button from '../Button/Button'
import Counter from '../Counter/Counter'
import OrderDialog from '../OrderDialog/OrderDialog'
import ModifierCheckbox from '../ModifierCheckbox/ModifierCheckbox'
// Style
import classNames from 'classnames'
import styles from './style.module.scss'
import CartContext from 'context/CartContext'
import { Grid } from '@mui/material'
import CheckboxModifier from '../CheckboxModifier'
import { useDispatch } from 'react-redux'
import { ADD_TO_CART, DECREMENT, INCREMENT, REMOVE } from 'store/cart/cartSlice'
import NumberToPrice from '../NumberToPrice'

function MiniCard({ product, size }) {
  const [orderModifiers, setOrderModifiers] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [isOrderPopup, setisOrderPopup] = useState(false)
  const [modifiersPrice, setModifiersPrice] = useState(0)
  const [modifiersQuantity, setModifiersQuantity] = useState([])
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0)

  const dispatch = useDispatch()

  const router = useRouter()
  const { t } = useTranslation('common')

  const { isOrdered, productInCart } = useCartProduct(
    product?.id,
    orderModifiers
  )

  const { data: modifiers } = useSWR(
    isOrderPopup && product.has_modifier
      ? '/v2/modifier?product_id=' + product.id
      : null,
    fetcher
  )

  // Select first group modifiers, save group modifiers id & min_amount to state
  useEffect(() => {
    if (
      isOrderPopup &&
      product.has_modifier &&
      modifiers?.product_modifiers?.group_modifiers
    ) {
      let firstGroupItems = []
      let modifiersQuantityMock = []
      modifiers?.product_modifiers?.group_modifiers?.map((group) => {
        modifiersQuantityMock.push({
          id: group.id,
          quantity: group.min_amount,
        })
        let firstGroupItem = {}
        group?.variants?.map((variant, idx) => {
          if (idx === 0)
            firstGroupItem = {
              modifier_id: variant?.id,
              modifier_price: +variant?.out_price,
              modifier_quantity: group?.min_amount || 1,
              parent_id: group?.id,
              name: variant?.title,
              type: 'group',
            }
        })
        firstGroupItems.push(firstGroupItem)
      })
      setOrderModifiers(firstGroupItems)
      setModifiersQuantity(modifiersQuantityMock)
    }
  }, [modifiers, product.has_modifier, isOrderPopup])

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

  const clickHandler = () => {
    !product?.has_modifier ? addToCartHandler() : setisOrderPopup(true)
  }

  const addToCartHandler = () => {
    dispatch(
      ADD_TO_CART({
        price: product?.out_price + totalDiscountPrice,
        product_id: product?.id,
        type: product?.type,
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
  }

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

  return (
    <>
      <div
        className={classNames(styles.card, { [styles.small]: size == 'small' })}
      >
        <div className={styles.card_img}>
          <Image
            src={
              product?.image
                ? process.env.BASE_URL + product?.image
                : process.env.DEFAULT_IMG
            }
            alt={product?.title[router.locale]}
            layout="fill"
            objectFit="cover"
            priority={true}
          />
        </div>
        <div className={styles.content}>
          <h5 className={styles.title}>{product?.title[router.locale]}</h5>
          <div className={styles.actions}>
            {isOrdered ? (
              <div className={styles.counter}>
                <Counter
                  variable={productInCart.quantity}
                  onIncrease={() => dispatch(INCREMENT(productInCart?.key))}
                  onDecrease={() => {
                    productInCart.quantity > 1
                      ? dispatch(DECREMENT(productInCart?.key))
                      : removeHandler()
                  }}
                  className={styles.counter}
                />
              </div>
            ) : (
              <Button
                size="sm"
                onClick={clickHandler}
                style={{ width: 'fit-content' }}
              >
                {product?.discounts?.length > 0 ? (
                  <>
                    <strike className={styles.original_price}>
                      <NumberToPrice value={product.out_price} />
                    </strike>{' '}
                    <span className={styles.with_discount}>
                      <NumberToPrice
                        value={product?.out_price + totalDiscountPrice}
                      />
                    </span>
                  </>
                ) : (
                  <NumberToPrice value={product?.out_price} />
                )}
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
      </OrderDialog>
    </>
  )
}

export default memo(MiniCard)
