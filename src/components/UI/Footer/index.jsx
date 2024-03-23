import { memo, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
// MUI
import { Box, Menu, MenuItem } from '@mui/material'
import {
  KeyboardArrowDownRounded,
  CheckRounded,
  ArrowBackRounded,
  CloseRounded,
} from '@mui/icons-material'
// Style
import classNames from 'classnames'
import styles from './style.module.scss'

function Footer({ isOrdering = false }) {
  return (
    <Box
      p={3}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Link href="/" passHref>
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowBackRounded />
          Назад
        </Box>
      </Link>
      {isOrdering && (
        <Box display="flex" alignItems="center" gap={1}>
          <CloseRounded />
          Отменить заказ
        </Box>
      )}
    </Box>
  )
}

export default Footer
