import classNames from 'classnames'
import styles from './style.module.scss'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { updateOrderType } from 'store/order/orderSlice'
import { Dialog, DialogContent } from '@mui/material'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import {
  ChevronLeftRounded,
  TableRestaurantRounded,
  DirectionsWalkRounded,
} from '@mui/icons-material'
import { updateLang } from 'store/auth/authSlice'

function Intro({ open = true, onClose, onOpen }) {
  const [hasSelectedType, setSelectedType] = useState(false)

  const router = useRouter()
  const dispatch = useDispatch()

  // const { lang } = useSelector((state) => state.auth)

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogContent
        className={classNames(styles.screen, {
          [styles.step_2]: false,
        })}
      >
        <Lang
          onSelect={(locale) => {
            router.push(router.asPath, undefined, { locale })
            // dispatch(updateLang(locale))
            if (!hasSelectedType) onClose()
          }}
        />
        {hasSelectedType && (
          <OrderType
            onSelect={(type) => {
              dispatch(updateOrderType(type))
              onClose()
            }}
            goBack={() => dispatch(updateLang(null))}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function OrderType({ onSelect, goBack }) {
  const { t } = useTranslation('common')

  return (
    <div className={styles.order_type}>
      <div className={styles.header} onClick={goBack}>
        <div className={styles.back_button}>
          <ChevronLeftRounded fontSize="large" />
        </div>
        <div>{t('back')}</div>
      </div>
      <header>
        <h2>{t('select_order_type')}</h2>
        <p>{t('select_order_type_text')}</p>
      </header>
      <div onClick={() => onSelect('hall')}>
        <div className={styles.icon_wrapper}>
          <TableRestaurantRounded />
        </div>
        {t('order_in_hall')}
      </div>
      <div onClick={() => onSelect('self-pickup')}>
        <div className={styles.icon_wrapper}>
          <DirectionsWalkRounded />
        </div>
        {t('takeaway')}
      </div>
    </div>
  )
}

function Lang({ onSelect }) {
  return (
    <div className={styles.lang}>
      <Image
        src="/images/maxway_logo.svg"
        alt="maxway"
        width={376}
        height={240}
        priority={true}
      />
      <div onClick={() => onSelect('uz')} style={{ marginTop: 48 }}>
        {/* <Image src="/images/uz.svg" alt="" width={36} height={36} />{' '} */}
        {"O'zbekcha"}
      </div>
      <div onClick={() => onSelect('ru')}>
        {/* <Image src="/images/ru.svg" alt="" width={36} height={36} /> */}
        Русский
      </div>
      <div onClick={() => onSelect('en')}>
        {/* <Image src="/images/en.svg" alt="" width={36} height={36} /> */}
        English
      </div>
    </div>
  )
}

export default Intro
