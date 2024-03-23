import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import styles from './styles.module.scss'
import { getGategoryList } from 'services'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import Image from 'next/image'

function Sidebar({ set, active }) {
  const [data, setData] = useState(null)

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getGategoryList()
        if (response) {
          setData(response)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className={styles.sidebar}>
      {data?.categories?.map((category) => (
        <div
          key={category.id}
          onClick={() => set({ id: category.id, title: category.title })}
          className={classNames(styles.item, {
            [styles.active]: category.id === active?.id,
          })}
        >
          {/* <Category
            title={category.title[router.locale]}
            img={category?.image}
            active={activeCategory?.includes(category.title.en)}
          /> */}
          <Image
            src={
              category.image
                ? process.env.BASE_URL + category.image
                : process.env.DEFAULT_IMG
            }
            alt={category.title.en}
            width={48}
            height={48}
          />
          {category.title[router.locale]}
        </div>
      ))}
    </div>
  )
}

export default Sidebar
