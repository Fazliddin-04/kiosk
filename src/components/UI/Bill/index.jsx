import useTranslation from 'next-translate/useTranslation'
import styles from './style.module.scss'
import NumberToPrice from 'components/UI/NumberToPrice'

function Bill({ discounts, totalPrice }) {
  const { t } = useTranslation('common')

  return (
    <div className={styles.bill}>
      <h4> {t('total')}</h4>
      <div className={styles.text}>
        {t('products')}{' '}
        <span>
          <NumberToPrice value={totalPrice} />
        </span>
      </div>
      {discounts?.discounts?.length > 0 &&
        discounts?.discounts?.map((discount) => (
          <div className={styles.text} key={discount.discount_id}>
            {t(discount?.discount_type)}
            <span>{discount.discount_title[router.locale]}</span>
          </div>
        ))}

      <div className={styles.action}>
        <div className={styles.text}>
          {t('to_pay')}
          {discounts?.all_discount_price ? (
            <p>
              <span className={styles.original_price_deleted}>
                <NumberToPrice value={totalPrice} hideCurrency={true} />
              </span>
              <span>
                <NumberToPrice
                  value={totalPrice + discounts?.all_discount_price}
                />
              </span>
            </p>
          ) : (
            <span>
              <NumberToPrice value={totalPrice} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Bill
