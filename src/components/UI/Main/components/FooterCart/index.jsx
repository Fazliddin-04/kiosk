import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import styles from './styles.module.scss'
import { getGategoryList } from 'services'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import Image from 'next/image'
import Button from 'components/UI/Button/Button'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material'
import CardX from 'components/UI/CardX/CardX'
import Link from 'next/link'

function FooterCart() {
  const [isExpanded, setExpanded] = useState(false)

  const router = useRouter()
  const { cart } = useSelector((state) => state.cart)

  return (
    <div className={styles.footer}>
      <div
        className={styles.toggle}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {isExpanded ? 'Развернуть' : 'Свернуть'}{' '}
        <KeyboardArrowDownRoundedIcon
          style={{ transform: `rotate(${isExpanded ? 180 : 0}deg)` }}
        />
      </div>
      {isExpanded && (
        <Box display="flex" gap={5} pt={3}>
          {cart?.map((item) => (
            <div key={item.key}>
              <CardX product={item} />
            </div>
          ))}
        </Box>
      )}
      <div className={styles.actions}>
        <Image
          src="/images/shopping-cart.svg"
          alt="shopping cart"
          width={24}
          height={24}
        />
        <p className={styles.price}>
          140 000 <span>сум</span>
        </p>
        <Link href="/cart" passHref>
          <Button color="secondary">Перейти в корзину</Button>
        </Link>
      </div>
    </div>
  )
}

export default FooterCart
