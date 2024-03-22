import { useState, useEffect, useCallback, useMemo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useDispatch, useSelector } from 'react-redux'
// Redux store
import {
  codeConfirm,
  getUserByPhone,
  reset,
  updateUserDetails,
  updateName,
} from 'store/auth/authSlice'
// Components
import Countdown from '../Countdown'
import Input from '../Input'
import Button from '../Button/Button'
import FormDialog from '../FormDialog/FormDialog'
// Stylev
import styles from './style.module.scss'

const countryPhoneMask = '+\\9\\98 99 999 99 99'
const countryPhonePlaceHolder = '+998 __ ___ __ __'

function AuthDialog({ open, handleClose, onLastConfirm }) {
  const [otpDialog, setOtpDialog] = useState(false)
  const [nameDialog, setNameDialog] = useState(false)
  const [countReset, setCountReset] = useState(true)
  const [otp, setOtp] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [phoneError, setPhoneError] = useState(false)
  const [otpError, setOtpError] = useState(false)
  const [nameError, setNameError] = useState(false)

  const onClose = useCallback(() => {
    handleClose()
    setOtp('')
    setPhoneNumber('')
    setName('')
    setOtpDialog(false)
    setNameDialog(false)
  }, [handleClose])

  const { t } = useTranslation('common')
  const dispatch = useDispatch()

  const { user, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      if (!otpDialog) {
        setPhoneError(true)
      } else {
        setOtpError(true)
      }
    }

    if (isSuccess) {
      if (message === 'phone number is submitted') {
        setOtpDialog(true)
      }
    }

    // Redirect when logged in
    if (user) {
      if (user?.name !== 'user') {
        onClose()
        if (open) onLastConfirm()
      } else {
        setNameDialog(true)
      }
    } else {
      setNameDialog(false)
    }

    dispatch(reset())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, user, message, dispatch])

  useEffect(() => {
    if (otpDialog) {
      setTimeout(() => {
        setCountReset(false)
      }, 60000)
    }

    return () => {
      setCountReset(true)
    }
  }, [otpDialog])

  const onOtpChange = (e) => {
    const txt = e.target.value
    // prevent more than 12 characters, ignore the spacebar, allow the backspace
    if ((txt.length == 6 || e.which == 32) & (e.which !== 8)) e.preventDefault()
    // add spaces after 3 & 7 characters, allow the backspace
    e.target.value.length <= 6 ? setOtp(e.target.value) : setOtp(otp)
    setOtpError(false)
  }

  const onTelChange = (e) => {
    setPhoneError(false)
    setPhoneNumber(e.target.value)
  }

  const onTelSubmit = (e) => {
    e.preventDefault()

    if (phoneNumber.replace(' ', '').length >= 11) {
      dispatch(getUserByPhone({ phone: phoneNumber.replaceAll(' ', '') }))
    } else setPhoneError(true)
  }

  const onOTPSubmit = (e) => {
    e.preventDefault()
    if (otp.length == 6) {
      dispatch(
        codeConfirm({
          code: otp,
          phone: phoneNumber.replaceAll(' ', ''),
        })
      )
    }
  }

  const onNameSubmit = (e) => {
    e.preventDefault()
    if (name.length > 0) {
      dispatch(
        updateUserDetails({
          id: user?.id,
          name: name,
          phone: user?.phone,
          access_token: user?.access_token,
        })
      )
      dispatch(updateName(name))
      setNameDialog(false)
      handleClose()
    } else setNameError(true)
  }

  const onCountReset = () => {
    setCountReset(true)
    dispatch(
      getUserByPhone({ phone: '+998' + phoneNumber.replaceAll(' ', '') })
    )
    setTimeout(() => {
      setCountReset(false)
    }, 60000)
  }

  return (
    <FormDialog
      open={open}
      title={t('sign_in')}
      descr={t('sign_in_with_your_phone_number')}
      handleClose={onClose}
      usedFor="auth"
      modalType="xs"
      className={styles.authDialog}
    >
      {!nameDialog ? (
        <>
          <form onSubmit={onTelSubmit}>
            <Input
              type="tel"
              placeholder={countryPhonePlaceHolder}
              label={t('phone_number')}
              mask={countryPhoneMask}
              onChange={onTelChange}
              value={phoneNumber}
              disabled={otpDialog}
              isError={phoneError}
              errorMessage={t('wrong_phone_entered')}
            />
            {!otpDialog && (
              <div className={styles.buttonWrapper}>
                <Button
                  type="submit"
                  color={phoneNumber.replace(' ', '').length < 11 && 'disabled'}
                >
                  {t('send_code')}
                </Button>
              </div>
            )}
          </form>
          {otpDialog && (
            <form onSubmit={onOTPSubmit} className={styles.otp_form}>
              <Input
                label={t('confirmation_code')}
                id="otp"
                type="number"
                onChange={(e) =>
                  !/[A-Z]/i.test(e.target.value) && onOtpChange(e)
                }
                value={otp}
                isError={otpError}
                errorMessage={t('wrong_code_entered')}
              />
              <div className={styles.countdownWrapper}>
                {otpDialog && countReset ? (
                  <Countdown value={60} />
                ) : (
                  <p className={styles.buttonText} onClick={onCountReset}>
                    {t('send_again')}
                  </p>
                )}
              </div>
              <div className={styles.buttonWrapper}>
                <Button type="submit" color={otp.length < 6 && 'disabled'}>
                  {t('confirm')}
                </Button>
              </div>
            </form>
          )}
        </>
      ) : (
        <form onSubmit={onNameSubmit}>
          <Input
            label={t('name')}
            id="name"
            type="text"
            placeholder={t('enter_your_name')}
            onChange={(e) => {
              setName(e.target.value)
              setNameError(false)
            }}
            value={name}
            isError={nameError}
            errorMessage={t('enter_your_name')}
          />
          <div className={styles.buttonWrapper}>
            <Button type="submit">{t('confirm')}</Button>
          </div>
        </form>
      )}
    </FormDialog>
  )
}

export default AuthDialog
