import { memo } from 'react'
import styles from './style.module.scss'

function Textarea({ id, placeholder, onChange, value }) {
  return (
    <div className={styles.formControl}>
      <textarea
        id={id}
        placeholder={placeholder ? placeholder : ''}
        className={styles.textarea}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default memo(Textarea)
