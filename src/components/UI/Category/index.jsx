import { memo } from 'react'
import styles from './style.module.scss'
import classNames from 'classnames'
import Image from 'next/image'

function Category({
  title = '',
  img = '',
  active = false,
  imgStyle,
  showImg = false,
  ...props
}) {
  return (
    <div
      className={classNames(styles.category, {
        [styles.active]: active,
        [styles.with_img]: showImg,
      })}
      {...props}
    >
      {showImg && (
        <div className={styles.img} style={imgStyle}>
          <Image
            src={img ? process.env.BASE_URL + img : process.env.DEFAULT_IMG}
            alt={title}
            objectFit="cover"
            layout="fill"
          />
        </div>
      )}
      <p>{title}</p>
    </div>
  )
}

export default memo(Category)
