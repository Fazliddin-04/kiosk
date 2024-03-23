import { useState, useEffect, memo, useContext } from 'react'
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
// MUI
import { RadioGroup, FormControlLabel, Radio, Grid } from '@mui/material'
// Components
import Button from '../Button/Button'
import Carousel from '../Carousel/Carousel'
import MiniCard from '../MiniCard/MiniCard'
import OrderDialog from '../OrderDialog/OrderDialog'
// Style
import styles from './style.module.scss'
import ModifierCheckbox from '../ModifierCheckbox/ModifierCheckbox'
import useCartProduct from 'hooks/useCartProduct'
import CartContext from 'context/CartContext'
import classNames from 'classnames'
import AddToCart from '../AddToCart'
import CheckboxModifier from '../CheckboxModifier'
import { useDispatch } from 'react-redux'
import {
  ADD_TO_CART,
  DECREMENT_LAST,
  INCREMENT_LAST,
  REMOVE,
  REMOVE_LAST,
} from 'store/cart/cartSlice'
import NumberToPrice from '../NumberToPrice'

const menu_id = ''

function ComboCard({ product }) {
  const [quantity, setQuantity] = useState(1)
  const [isOrderPopup, setisOrderPopup] = useState(false)
  const [comboGroups, setComboGroups] = useState([])
  const [currentVariant, setCurrentVariant] = useState([])
  const [orderModifiers, setOrderModifiers] = useState([])
  const [modifiersPrice, setModifiersPrice] = useState(0)
  const [modifiersQuantity, setModifiersQuantity] = useState([])
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0)

  const dispatch = useDispatch()
  const { t } = useTranslation('common')
  const router = useRouter()

  const { data: comboData } = useSWR(
    isOrderPopup && product?.id ? '/v2/combo/' + product.id : null,
    fetcher
  )

  const { data: modifiers } = useSWR(
    isOrderPopup && product.has_modifier
      ? '/v2/modifier?product_id=' + product.id
      : null,
    fetcher
  )

  const { data: favourites } = useSWR(
    isOrderPopup ? '/v2/product-favourites?product_ids=' + product.id : null,
    fetcher
  )

  const { isOrdered, productInCart } = useCartProduct(
    product.id,
    orderModifiers,
    currentVariant
  )

  useEffect(() => {
    if (comboData) {
      setComboGroups(comboData.groups)
      if (!currentVariant.length) {
        const variantsMap = []
        for (const group of comboData?.groups) {
          variantsMap.push({
            group_id: group.id,
            quantity: group.quantity,
            variant_id: group.variants[0].id,
            variant_name: undefined,
          })
        }
        setCurrentVariant(variantsMap)
      }
    }
  }, [comboData, currentVariant.length, router.locale])
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

  const addToCartHandler = () => {
    dispatch(
      ADD_TO_CART({
        price: product.out_price + totalDiscountPrice,
        product_id: product.id,
        type: 'combo',
        variants: currentVariant,
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
  }

  const onRadioChange = (group_id, variant_id) => {
    setCurrentVariant((prevState) =>
      prevState.map((el) =>
        el.group_id === group_id ? { ...el, variant_id } : el
      )
    )
  }

  const removeHandler = () => {
    dispatch(REMOVE(productInCart?.key))
    setisOrderPopup(false)
    setQuantity(1)
  }

  const removeLastHandler = () => {
    dispatch(REMOVE_LAST(product.id))
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
      productInCart?.order_modifiers.map((item) => {
        item.modifier_id == modifierId && (isIncluded = true)
      })
      return isIncluded
    }
  }

  return (
    <>
      <div
        className={classNames(styles.card, {
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
                : process.env.DEFAULT_IMG
            }
            alt={product.title[router.locale]}
            objectFit="cover"
            layout="fill"
          />
          {/* {(menu_id && product.active_in_menu) || !menu_id ? (
            <div className={styles.unavailable}>
              {t('temporarily_unavailable')}
            </div>
          ) : null} */}
        </div>
        <div className={styles.card_content}>
          <h4 className={styles.title}>{product.title[router.locale]}</h4>
          <p className={styles.description}>
            {product.description[router.locale].substring(0, 35) +
              (product.description[router.locale].length > 35 ? '...' : '')}
          </p>
        </div>
        <div className={styles.card_actions}>
          <p>
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
                onIncrease={() => dispatch(INCREMENT_LAST(product.id))}
                onDecrease={() => {
                  productInCart?.quantity !== 1
                    ? dispatch(DECREMENT_LAST(product.id))
                    : removeLastHandler()
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
        quantity={quantity}
        isOrdered={isOrdered}
        productInCart={productInCart}
        discountPrice={totalDiscountPrice}
        product={product}
        modifiersPrice={modifiersPrice}
        setQuantity={setQuantity}
        onOrderClick={onOrderClick}
        removeHandler={removeHandler}
        handleClose={() => setisOrderPopup(false)}
      >
        <div className={styles.dialog_content}>
          {comboGroups.length > 0 &&
            currentVariant.length > 0 &&
            comboGroups?.map((group, idx) => (
              <div key={group.id} className={styles.option_group}>
                <h4>{group.title[router.locale]}</h4>
                <RadioGroup
                  aria-labelledby={group.title['en']}
                  name={group.title['en']}
                  value={currentVariant[idx].variant_id}
                  onChange={(e) => onRadioChange(group.id, e.target.id)}
                >
                  {group?.variants.map((variant) =>
                    group?.type === 'combo_basic' ? (
                      <div key={variant.id}>
                        <FormControlLabel
                          value={variant.title['en']}
                          control={
                            <Radio
                              color="primary"
                              id={variant.id}
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          checked={true}
                          label={variant.title[router.locale]}
                          className={styles.option}
                        />
                        <span>x {group.quantity}</span>
                      </div>
                    ) : (
                      <div key={variant.id}>
                        <FormControlLabel
                          value={variant.title['en']}
                          control={
                            <Radio
                              color="primary"
                              id={variant.id}
                              value={variant.id}
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          label={variant.title[router.locale]}
                          className={styles.option}
                        />
                        <span>x {group.quantity}</span>
                      </div>
                    )
                  )}
                </RadioGroup>
              </div>
            ))}
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
        {favourites?.length > 0 && (
          <div className={styles.recommended}>
            <h4>{t('something_else?')}</h4>
            <div className={styles.box}>
              <Carousel size="small">
                {favourites?.map((product) => (
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

export default memo(ComboCard)
