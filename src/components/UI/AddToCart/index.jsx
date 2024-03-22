import { memo } from 'react'
import styles from './style.module.scss'
import Counter from '../Counter/Counter'
import classNames from 'classnames'

function AddToCart({
  onClick,
  style,
  quantity,
  onIncrease,
  onDecrease,
  isOrdered,
  children,
}) {
  return (
    <div
      className={classNames(styles.wrapper, { [styles.isOrdered]: isOrdered })}
    >
      <div onClick={onClick} className={styles.button} style={{ ...style }}>
        {children}
      </div>
      <Counter
        className={styles.counter}
        variable={quantity}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
      />
    </div>
  )
}

export default memo(AddToCart)
