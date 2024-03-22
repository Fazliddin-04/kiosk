import { memo } from 'react'
import styles from './style.module.scss'
import classNames from 'classnames'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'

function CheckboxModifier({
  title = '',
  name = '',
  img = '',
  price = 0,
  checked = false,
  onChange,
  ...props
}) {
  const { t } = useTranslation('common')
  return (
    <label
      htmlFor={name}
      className={classNames(styles.checkbox, { [styles.active]: checked })}
      {...props}
    >
      <div className={styles.img}>
        <Image
          src={
            img
              ? process.env.BASE_URL + img
              : process.env.BASE_URL + '9440048a-fe6b-4be7-9541-d94d2a8d1951'
          }
          alt={title}
          objectFit="cover"
          layout="fill"
        />
      </div>
      <h5>{title}</h5>
      <p className={styles.price}>
        {price} {t('sum')}
      </p>
      <CheckCircleRoundedIcon color="primary" className={styles.check} />
      <input
        type="checkbox"
        id={name}
        style={{ display: 'none' }}
        onChange={onChange}
        checked={checked}
      />
    </label>
  )
}

export default memo(CheckboxModifier)
