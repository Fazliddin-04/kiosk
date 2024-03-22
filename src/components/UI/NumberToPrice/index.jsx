import numToPrice from 'utils/numToPrice'
import { getCurrency } from 'utils/byCountry'
import useTranslation from 'next-translate/useTranslation'

function NumberToPrice({ value = 0, hideCurrency = false }) {
  const { t } = useTranslation('common')

  return <>{numToPrice(value, hideCurrency ? '' : getCurrency('UZ', t))}</>
}

export default NumberToPrice
