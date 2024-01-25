import RNDateTimePicker from '@react-native-community/datetimepicker'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ColorValue, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native'
import DatePicker from 'react-native-date-picker'
import { DatePickerInput } from 'react-native-paper-dates'
import { DateTimePicker } from 'react-native-ui-lib'
import { HORIZONTAL_PADDING_DEFAULT, VERTICAL_PADDING_DEFAULT } from '../constants'
import { TextStyles } from '../types'

export interface FormEntryField {
  label?: string
  placeHolder?: string
  type: string
  /**
   * @deprecated Use onSaveData instead
   */
  onSetText?: (text: string) => void
  onSaveData?: (data: any) => void
  getErrorMessage?: (text: string) => string
  isRequired?: boolean
  prefill?: string
  id: string
  primaryColor?: string
  secondaryColor?: string
  canContinue?: boolean
  setCanContinue?: (value: boolean) => void
  setHasError?: (value: boolean) => void
  autoFocus?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined
  backgroundColor?: ColorValue
  currentPage?: number
  pageIndex?: number
  totalPages?: number
  props?: any
}

const FAIL_SILENTLY = 'failedSilently'

export const DateTimeField: FC<FormEntryField & TextStyles> = ({
  label,
  placeHolder,
  type,
  onSetText,
  getErrorMessage,
  textStyle,
  id,
  primaryColor,
  secondaryColor,
  prefill,
  backgroundColor,
  canContinue,
  setHasError,
  setCanContinue,
  isRequired,
  onSaveData,
  autoFocus,
  autoCapitalize,
  currentPage,
  pageIndex,
}) => {
  const inputRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [text, setText] = useState(prefill ?? '')

  const [date, setDate] = useState(new Date(prefill ?? new Date()))

  const [open, setOpen] = useState(false)

  const onConfirm = useCallback(
    (date: Date) => {
      setOpen(false)
      setDate(date)
      Keyboard.dismiss()
      const newDate = date?.toISOString()?.split('T')?.[0]
      onSaveData({ value: newDate, id })
    },
    [id, onSaveData]
  )

  const onCancel = useCallback(() => {
    Keyboard.dismiss()
    setOpen(false)
  }, [])

  const openPicker = () => {
    Keyboard.dismiss()
    setOpen(true)
  }

  return (
    <View style={{}}>
      <DatePicker
        modal
        mode={'date'}
        open={open}
        date={date}
        maximumDate={new Date()}
        timeZoneOffsetInMinutes={new Date().getTimezoneOffset()}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <TextInput
        onPressIn={openPicker}
        onFocus={openPicker}
        value={date?.toISOString()?.split('T')?.[0]}
        placeholder={placeHolder}
        style={[
          styles.option,
          {
            paddingVertical: VERTICAL_PADDING_DEFAULT,
            paddingHorizontal: HORIZONTAL_PADDING_DEFAULT,
            marginTop: VERTICAL_PADDING_DEFAULT,
          },
          { borderColor: isFocused ? primaryColor : secondaryColor },
          textStyle,
        ]}
      />
      {/* <TextField {...rest} onFocus={setOpen.bind(this, true)} /> */}
      {/* <DatePickerInput
        locale="en"
        label={label}
        placeholder={placeHolder}
        value={prefill ? new Date(prefill) : new Date()}
        onChange={(date) => {
          onSaveData({ value: date?.toISOString()?.split('T')[0], id })
        }}
        inputMode="start"
      /> */}

      {errorMessage && errorMessage != FAIL_SILENTLY ? (
        <Text style={[textStyle, styles.errorText]}>{errorMessage}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  option: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    color: '#a60202',
    paddingTop: 8,
  },
})

export default DateTimeField
