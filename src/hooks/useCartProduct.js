import { useCallback, useRef } from "react"
import { useSelector } from "react-redux"

export default function useCartProduct(productId, selectedModifiers, selVariants) {
  const productInCart = useRef(null)
  const isOrdered = useRef(false)
  const { cart } = useSelector(state => state.cart)

  const onCheckProduct = useCallback(() => {
    if (cart.length > 0) {
      for (const item of cart) {
        if (item.product_id === productId) {
          let productVariants = ''
          let myVariants = ''
          if (selVariants) {
            item.variants.map((el) => (productVariants += el.variant_id + '_'))
            selVariants.map((el) => (myVariants += el.variant_id + '_'))
          }
          if (item.order_modifiers.length > 0) {
            let a = ''
            let b = ''
            item.order_modifiers.map((el) => (a += '_' + el.modifier_id))
            selectedModifiers.map((el) => (b += '_' + el.modifier_id))
            const bFiltered = b.split('_').filter((e) => e !== '')
            if (item.order_modifiers.length === selectedModifiers.length) {
              if (item.order_modifiers.length == 1 && a.includes(bFiltered[0])) {
                if (selVariants) {
                  if (productVariants == myVariants) {
                    productInCart.current = item
                    isOrdered.current = true
                  } else {
                    productInCart.current = null
                    isOrdered.current = false
                  }
                } else {
                  productInCart.current = item
                  isOrdered.current = true
                }
                break
              } else if (
                item.order_modifiers.length == 2 &&
                a.includes(bFiltered[0]) &&
                a.includes(bFiltered[1])
              ) {
                if (selVariants) {
                  if (productVariants == myVariants) {
                    productInCart.current = item
                    isOrdered.current = true
                  } else {
                    productInCart.current = null
                    isOrdered.current = false
                  }
                } else {
                  productInCart.current = item
                  isOrdered.current = true
                }
                break
              } else if (
                item.order_modifiers.length == 3 &&
                a.includes(bFiltered[0]) &&
                a.includes(bFiltered[1]) &&
                a.includes(bFiltered[2])
              ) {
                if (selVariants) {
                  if (productVariants == myVariants) {
                    productInCart.current = item
                    isOrdered.current = true
                  } else {
                    productInCart.current = null
                    isOrdered.current = false
                  }
                } else {
                  productInCart.current = item
                  isOrdered.current = true
                }
                break
              } else if (
                item.order_modifiers.length == 4 &&
                a.includes(bFiltered[0]) &&
                a.includes(bFiltered[1]) &&
                a.includes(bFiltered[2]) &&
                a.includes(bFiltered[3])
              ) {
                if (selVariants) {
                  if (productVariants == myVariants) {
                    productInCart.current = item
                    isOrdered.current = true
                  } else {
                    productInCart.current = null
                    isOrdered.current = false
                  }
                } else {
                  productInCart.current = item
                  isOrdered.current = true
                }
                break
              } else if (
                item.order_modifiers.length == 5 &&
                a.includes(bFiltered[0]) &&
                a.includes(bFiltered[1]) &&
                a.includes(bFiltered[2]) &&
                a.includes(bFiltered[3]) &&
                a.includes(bFiltered[4])
              ) {
                if (selVariants) {
                  if (productVariants == myVariants) {
                    productInCart.current = item
                    isOrdered.current = true
                  } else {
                    productInCart.current = null
                    isOrdered.current = false
                  }
                } else {
                  productInCart.current = item
                  isOrdered.current = true
                }
                break
              } else {
                productInCart.current = null
                isOrdered.current = false
                break
              }
            } else {
              productInCart.current = null
              isOrdered.current = false
              break
            }
          } else {
            if (selVariants) {
              if (productVariants == myVariants) {
                productInCart.current = item
                isOrdered.current = true
              }
            } else {
              productInCart.current = item
              isOrdered.current = true
            }
            break
          }
        } else {
          productInCart.current = null
          isOrdered.current = false
        }
      }
    } else {
      isOrdered.current = false
      productInCart.current = null
    }
  }, [cart, selectedModifiers, productId, selVariants])

  onCheckProduct()

  return { isOrdered: isOrdered.current, productInCart: productInCart.current }
}
