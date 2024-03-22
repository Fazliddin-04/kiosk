export function getCurrency(country, t) {
  return country === 'KAZ' ? '₸' : t('sum')
}
