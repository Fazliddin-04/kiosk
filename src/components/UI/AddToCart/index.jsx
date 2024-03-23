import { memo } from 'react'
import styles from './style.module.scss'
import Counter from '../Counter/Counter'
import classNames from 'classnames'
import Button from '../Button/Button'

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
    // className={classNames(styles.wrapper, { [styles.isOrdered]: isOrdered })}
    >
      {/* <div onClick={onClick} className={styles.button} style={{ ...style }}> */}
      {/* </div> */}
      {isOrdered ? (
        <Counter
          className={styles.counter}
          variable={quantity}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
        />
      ) : (
        <Button size="sm" onClick={onClick}>
          {children}
        </Button>
      )}
    </div>
  )
}

export default memo(AddToCart)
