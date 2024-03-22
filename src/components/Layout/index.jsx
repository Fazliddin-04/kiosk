import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ToastContainer position="top-center" />
    </>
  )
}
