import { useState } from 'react'
import PropTypes from 'prop-types'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import classNames from 'classnames'
import styles from './style.module.scss'
import InputMask from 'react-input-mask'

export default function Input({
  id,
  label,
  type,
  placeholder,
  edit,
  onEdit,
  value,
  className,
  disabled,
  onChange,
  isError,
  mask,
  errorMessage = 'Ошибка',
  required,
}) {
  const [editing, setEditing] = useState(false)

  const onTelChange = (e) => {
    if (
      /[0-9]/.test(e.nativeEvent.data) ||
      e.nativeEvent.inputType == 'deleteContentBackward'
    )
      onChange(e)
  }

  const editHandler = () => {
    if (editing) {
      onEdit()
      setEditing(false)
    } else setEditing(true)
  }

  return (
    <div
      className={classNames(styles.formControl, {
        [styles.phone]: type === 'tel',
        [className]: className,
      })}
    >
      <label className={styles.label}>{label}</label>
      <div className={styles.input_wrapper}>
        {mask ? (
          <InputMask
            type={type === 'number' ? 'tel' : type}
            required={required}
            autoComplete="off"
            mask={mask}
            maskChar={null}
            value={value}
            onChange={(e) => onChange(e)}
            disabled={disabled || (edit && !editing)}
            placeholder={
              placeholder ? placeholder + (required ? '*' : '') : null
            }
            className={classNames(styles.input, {
              [styles.error]: isError,
              [styles.disabled]: disabled || (edit && !editing),
            })}
          />
        ) : (
          <input
            type={type === 'number' ? 'tel' : type}
            placeholder={
              placeholder ? placeholder + (required ? '*' : '') : null
            }
            className={classNames(styles.input, {
              [styles.error]: isError,
              [styles.disabled]: disabled || (edit && !editing),
            })}
            disabled={disabled || (edit && !editing)}
            value={value}
            onChange={(e) => {
              type === 'tel' ? onTelChange(e) : onChange(e)
            }}
            id={id}
            required={required}
            autoComplete="off"
          />
        )}
        {edit && (
          <div className={styles.edit} onClick={editHandler}>
            {editing ? <CheckRoundedIcon /> : <EditRoundedIcon />}
          </div>
        )}
      </div>

      {isError && (
        <p
          style={{
            display: 'block',
            color: '#f00',
          }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}

Input.propTypes = {
  required: PropTypes.bool,
}
