import { Box } from '@mui/material'
import Image from 'next/image'
import Carousel from '../UI/Carousel/Carousel'
import Header from '../UI/Header'

export default function Layout({ children }) {
  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Box bgcolor="#7E5FA6">
        <Carousel>
          <Box minWidth={720} width="100%" height={196} position="relative">
            <Image
              src="/images/banner.png"
              alt="banner"
              layout="fill"
              objectFit="cover"
            />
          </Box>
        </Carousel>
      </Box>
      <Header />
      {children}
      {/* <ToastContainer position="top-center" /> */}
    </Box>
  )
}
