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
import QRCode from 'react-qr-code'

const modalContent = {
  terminal: {
    title: 'Подтверждение',
    description: 'Вы действительно хотите оплатить через терминал?',
  },
  payme: {
    title: 'Подтверждение',
    description: 'Вы действительно хотите оплатить через Payme?',
  },
  click: {
    title: 'Подтверждение',
    description: 'Вы действительно хотите оплатить через Click?',
  },
}

function Checkout() {
  const [isDialog, setDialog] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState('')
  const [isLoading, setLoading] = useState(false)

  const router = useRouter()
  const productsId = useRef(null)
  const dispatch = useDispatch()
  const { t } = useTranslation('common')
  const { cart } = useSelector((state) => state.cart)

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

  return (
    <>
      <div className={styles.checkout}>
        <h3>Выберите тип оплаты</h3>
        <Box display="flex" justifyContent="center" gap={4}>
          <div className={styles.card} onClick={() => setDialog('click')}>
            <Image
              src="/images/click.png"
              alt="click"
              width={124}
              height={50}
            />
          </div>
          <div className={styles.card} onClick={() => setDialog('payme')}>
            <Image src="/images/payme.png" alt="payme" width={58} height={58} />
          </div>
          <div className={styles.card} onClick={() => setDialog('terminal')}>
            <Image
              src="/images/uzcard.png"
              alt="click"
              width={50}
              height={70}
            />
          </div>
        </Box>
        {selectedPayment === 'terminal' ? (
          <>
            <h4>Оплата через терминал</h4>
            <p className={styles.text}>
              Пожалуйста, вставьте пластиковую карту в терминал, и, набрав ПИН
              код, произведите оплату.
            </p>
            <p className={styles.text_mark}>
              После оплаты не забудьте не забудьте забрать карту
            </p>
            <Image
              src="/images/terminal.png"
              alt="terminal"
              width={132}
              height={300}
            />
          </>
        ) : (
          <>
            <h4>Оплата через {t(selectedPayment)}</h4>
            <p className={styles.text}>
              Откройте камеру вашего телефона или приложение{' '}
              {t(selectedPayment)}, перейдите в раздел QR оплата и отсканируйте
              данный QR
            </p>
            <p className={styles.text_mark}>Наведите камеру на QR</p>
            <div className={styles.qr_code}>
              <QRCode
                value={`https://maxway.uz`}
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox={`0 0 256 256`}
              />
            </div>
          </>
        )}
        <Box position="absolute" bottom={0} width="100%">
          <Footer isOrdering={true} />
        </Box>
      </div>
      <FormDialog
        open={Boolean(isDialog)}
        title={t(modalContent[isDialog]?.title)}
        descr={t(modalContent[isDialog]?.description)}
        handleClose={() => setDialog(false)}
      >
        <div className={styles.flexbox}>
          <Button color="grayscale" onClick={() => setDialog(false)}>
            {t('no')}
          </Button>
          <Button
            onClick={() => {
              setDialog(false)
              setSelectedPayment(isDialog)
            }}
          >
            {t('yes')}
          </Button>
        </div>
      </FormDialog>
    </>
  )
}

export default memo(Checkout)
