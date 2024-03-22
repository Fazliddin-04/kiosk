import { memo } from 'react'
// Slick js
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

function Carousel({ children }) {
  const settings = {
    arrows: false,
    dots: false,
    infinite: false,
    speed: 500,
    swipeToSlide: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    className: `slider variable-width`,
  }

  return <Slider {...settings}>{children}</Slider>
}

export default memo(Carousel)
