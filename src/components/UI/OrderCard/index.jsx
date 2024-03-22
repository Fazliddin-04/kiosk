import useTranslation from 'next-translate/useTranslation'
import { getStatus, getStatusName } from 'utils/getStatus'
import styles from './style.module.scss'

export default function OrderCard({ order, mobile, ...props }) {
  const { t } = useTranslation('common')
  return (
    <div
      className={`${styles.card} ${styles[getStatus(order.status_id)]}`}
      {...props}
    >
      <div>
        <p>
          {t('order_no')}
          {order?.pos_id ? order?.pos_id : '*'}
        </p>
        <p>
          {order.order_amount + order.co_delivery_price} {t('sum')}
        </p>
      </div>
      <div>
        <p>{new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
        <p className={styles.status}>{t(getStatusName(order?.status_id))}</p>
      </div>
    </div>
  )
}
