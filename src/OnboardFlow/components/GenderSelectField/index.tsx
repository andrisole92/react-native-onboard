import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import ImageEditor from 'image-crop/src'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'

import { ColorValue, Pressable, StyleSheet } from 'react-native'

import { Colors, Text, View } from 'react-native-ui-lib'
import { TextStyles } from '../../types'

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
  deleteImage?: (string) => void
  getAssetsPublicUrl?: (string) => string
  uploadImageFunction?: (
    base64Image: string,
    imageExtension?: string,
    pathname?: string
  ) => Promise<{ path: string; publicUrl: string }>
}

const FONT_SIZE = 16

export const GenderSelectField: FC<FormEntryField & TextStyles> = ({
  isRequired,
  setHasError,
  setCanContinue,
  onSaveData,
  id,
  prefill,
}) => {
  const [value, setValue] = useState<string>(prefill ?? undefined)

  const selectGender = useCallback(
    (gender: string) => {
      setValue(gender)
      onSaveData({ value: gender, id })
    },
    [id, onSaveData]
  )

  useEffect(() => {
    setHasError(value == null)
  }, [setHasError, value])

  return (
    <View flex style={{ marginVertical: 12, flexDirection: 'column' }}>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Pressable
          onPress={() => selectGender('Male')}
          testID="signUpGenderOptionMale"
          style={[
            styles.genderSelectOption,
            { marginRight: 4 },
            value === 'Male' ? { backgroundColor: 'black' } : {},
          ]}
        >
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: FONT_SIZE,
              color: value === 'Male' ? Colors.white : Colors.fontPrimary,
            }}
          >
            Male
          </Text>
        </Pressable>
        <Pressable
          testID="signUpGenderOptionFemale"
          onPress={() => selectGender('Female')}
          style={[
            styles.genderSelectOption,
            { marginLeft: 4 },
            value === 'Female' ? { backgroundColor: 'black' } : {},
          ]}
        >
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: FONT_SIZE,
              color: value === 'Female' ? Colors.white : Colors.fontPrimary,
            }}
          >
            Female
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  option: {
    width: '100%',
    height: 60,
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
  genderSelectOption: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    borderRadius: 12,
    padding: 5,
    backgroundColor: '#FAFAFA',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
