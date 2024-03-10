import { format, subDays, subYears } from "date-fns"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import {
  ColorValue,
  Keyboard,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  View,
} from "react-native"
import DatePicker from "react-native-date-picker"
import { HORIZONTAL_PADDING_DEFAULT, VERTICAL_PADDING_DEFAULT } from "../constants"
import { TextStyles } from "../types"

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
  hasError?: boolean
  setHasError?: (value: boolean) => void
  autoFocus?: boolean
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined
  backgroundColor?: ColorValue
  currentPage?: number
  pageIndex?: number
  totalPages?: number
  props?: any
  options: any
}

const FAIL_SILENTLY = "failedSilently"

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
  hasError,
  setHasError,
  setCanContinue,
  isRequired,
  onSaveData,
  autoFocus,
  autoCapitalize,
  currentPage,
  pageIndex,
  options,
}) => {
  const [errorMessage, setErrorMessage] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const [date, setDate] = useState(
    prefill ? new Date(prefill ?? subDays(new Date(), 365)) : undefined,
  )

  useEffect(() => {
    if (isRequired) {
      setHasError?.(date == null)
    }
  }, [date, isRequired, setHasError])

  const [open, setOpen] = useState(false)

  const onConfirm = useCallback(
    (date: Date) => {
      setOpen(false)
      setDate(date)
      Keyboard.dismiss()
      const newDate = date?.toISOString()?.split("T")?.[0]
      onSaveData?.({ value: newDate, id })
    },
    [id, onSaveData],
  )

  const onCancel = useCallback(() => {
    Keyboard.dismiss()
    setOpen(false)
  }, [])

  const openPicker = (e: NativeSyntheticEvent<NativeTouchEvent | TextInputFocusEventData>) => {
    e.preventDefault()
    Keyboard.dismiss()
    setOpen(true)
  }

  return (
    <View style={{}}>
      <DatePicker
        theme="light"
        modal
        mode={"date"}
        open={open}
        date={date ?? options?.defaultDate}
        maximumDate={options?.maximumDate}
        minimumDate={options?.minimumDate}
        timeZoneOffsetInMinutes={new Date().getTimezoneOffset()}
        onDateChange={setDate}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <Pressable
        onPressIn={openPicker}
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
      >
        <Text style={{ fontSize: 16 }}>{date ? format(date, "MMM dd, yyyy") : placeHolder}</Text>
      </Pressable>

      {errorMessage && errorMessage != FAIL_SILENTLY ? (
        <Text style={[textStyle, styles.errorText]}>{errorMessage}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  option: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    color: "#a60202",
    paddingTop: 8,
  },
})

export default DateTimeField
