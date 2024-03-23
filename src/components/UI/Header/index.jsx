import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import styles from './styles.module.scss'
import Image from 'next/image'

export default function Header() {
  return (
    <header className={styles.header}>
      <Image
        src="/images/maxway_logo_2.svg"
        alt="maxway"
        width={54}
        height={34}
      />
      <p>Меню</p>
      <p className={styles.time}>
        <AccessTimeRoundedIcon />
        17:07
      </p>
    </header>
  )
}
