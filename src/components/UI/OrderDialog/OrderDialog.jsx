import { forwardRef, memo } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import { useDispatch } from 'react-redux'
// Utils & Redux store
import numToPrice from 'utils/numToPrice'
import { INCREMENT, DECREMENT } from 'store/cart/cartSlice'
// MUI
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
// Component
import Counter from '../Counter/Counter'
import Button from '../Button/Button'
// Styles
import styles from './style.module.scss'
import classNames from 'classnames'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function OrderDialog({
  open,
  product,
  productInCart,
  isOrdered,
  quantity,
  handleClose,
  setQuantity,
  removeHandler,
  onOrderClick,
  discountPrice = 0,
  modifiersPrice = 0,
  children,
}) {
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const router = useRouter()

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={classNames(styles.dialog, {
        [styles.mobile]: false,
        [styles.desktop]: true,
      })}
      maxWidth="md"
      TransitionComponent={Transition}
    >
      <div className={styles.flexbox}>
        <div className={styles.image_wrapper}>
          <div
            className={classNames(styles.image, {
              [styles.loading]: product == null,
            })}
          >
            <Image
              src={
                product?.image
                  ? process.env.BASE_URL + product?.image
                  : process.env.DEFAULT_IMG
              }
              alt={product?.title[router.locale]}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.content_wrapper}>
            <DialogTitle
              className={classNames(styles.title, {
                [styles.loading]: product == null,
              })}
            >
              {product?.title[router.locale]}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                className={classNames(styles.descr, {
                  [styles.loading]: product == null,
                })}
              >
                {product?.description[router.locale]}
              </DialogContentText>
              {product == null && <div className={styles.loading_text}></div>}
              {product == null && <div className={styles.loading_text}></div>}
              {children}
            </DialogContent>
          </div>
          <DialogActions className={styles.actions}>
            <Counter
              variable={
                productInCart?.quantity ? productInCart.quantity : quantity
              }
              onIncrease={() =>
                productInCart?.quantity
                  ? dispatch(INCREMENT(productInCart?.key))
                  : setQuantity((prevState) => ++prevState)
              }
              onDecrease={() => {
                productInCart?.quantity && isOrdered
                  ? productInCart.quantity > 1
                    ? dispatch(DECREMENT(productInCart?.key))
                    : removeHandler()
                  : quantity > 1
                  ? setQuantity((prevState) => --prevState)
                  : setQuantity(1)
              }}
              className={styles.counter}
            />
            {isOrdered ? (
              <Button
                style={{ justifyContent: 'space-between' }}
                color="disabled"
              >
                <p>
                  {product?.discounts?.length > 0 && (
                    <small>
                      <strike>
                        {numToPrice(
                          productInCart?.quantity
                            ? (product?.out_price + modifiersPrice) *
                                productInCart.quantity
                            : (product?.out_price + modifiersPrice) * quantity,
                          t('sum')
                        )}
                      </strike>
                    </small>
                  )}{' '}
                  {numToPrice(
                    productInCart?.quantity
                      ? (product?.out_price + modifiersPrice + discountPrice) *
                          productInCart.quantity
                      : (product?.out_price + modifiersPrice + discountPrice) *
                          quantity,
                    t('sum')
                  )}
                </p>
              </Button>
            ) : (
              <Button
                style={{ justifyContent: 'space-between' }}
                onClick={() => product && onOrderClick()}
                color={product ? 'primary' : 'disabled'}
              >
                <p>
                  {product?.discounts?.length > 0 && (
                    <small>
                      <strike>
                        {numToPrice(
                          productInCart?.quantity
                            ? (product?.out_price + modifiersPrice) *
                                productInCart.quantity
                            : (product?.out_price + modifiersPrice) * quantity,
                          t('sum')
                        )}
                      </strike>
                    </small>
                  )}{' '}
                  {numToPrice(
                    productInCart?.quantity
                      ? (product?.out_price + modifiersPrice + discountPrice) *
                          productInCart.quantity
                      : (product?.out_price + modifiersPrice + discountPrice) *
                          quantity,
                    t('sum')
                  )}
                </p>
              </Button>
            )}
          </DialogActions>
        </div>
      </div>
      <IconButton onClick={handleClose} className={styles.closeIcon}>
        <CloseIcon />
      </IconButton>
    </Dialog>
  )
}

export default memo(OrderDialog)
