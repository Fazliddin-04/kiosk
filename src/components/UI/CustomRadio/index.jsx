import Image from 'next/image'

import { useRadioGroup } from '@mui/material/RadioGroup'
import { FormControlLabel, Radio } from '@mui/material'

import classNames from 'classnames'
import styles from './style.module.scss'

function CustomRadio({ id, value, label, branch, src, advanced }) {
  const radioGroup = useRadioGroup()
  let checked = false

  if (radioGroup) {
    checked = radioGroup.value === value
  }

  return (
    <FormControlLabel
      value={value}
      label={
        <div
          className={classNames(styles.labelContent, {
            [styles.branch]: branch,
            [styles.advanced]: advanced,
            [styles.payment]: src,
          })}
        >
          <div className={styles.image}>
            <Image src={src} objectFit="cover" layout="fill" alt={label} />
          </div>
          {label}
        </div>
      }
      className={classNames(styles.customRadio, {
        [styles.branch]: branch,
        [styles.advanced]: advanced,
        [styles.payment]: src,
        [styles.checked]: checked,
      })}
      control={<Radio color="primary" id={id} />}
      labelPlacement="start"
      sx={{
        flex: label ? 1 : null,
        justifyContent: 'space-between',
        marginLeft: 0,
      }}
    />
  )
}

export default CustomRadio
