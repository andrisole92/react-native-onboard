import * as ImagePicker from 'expo-image-picker'
import React, { FC, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  View as BaseView,
  ColorValue,
  StyleSheet,
  TextInput,
} from 'react-native'

import { decode } from 'base64-arraybuffer'
import { nanoid } from 'nanoid'
import {
  Avatar,
  AvatarHelper,
  AvatarProps,
  Button,
  Colors,
  Text,
  Typography,
  View,
} from 'react-native-ui-lib'
import { HORIZONTAL_PADDING_DEFAULT, VERTICAL_PADDING_DEFAULT } from '../../constants'
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
  uploadImageFunction?: (
    base64Image: string,
    imageExtension?: string,
    bucketName?: string
  ) => Promise<string | null>
}

export const AvatarInputField: FC<FormEntryField & TextStyles> = ({
  uploadImageFunction,
  primaryColor,
}) => {
  console.log({ uploadImageFunction, primaryColor })

  const [selectedPhoto, setSelectedPhoto] = useState<ImagePicker.ImagePickerAsset>(null)

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      base64: true,
    })
    const asset = result?.assets?.[0]
    setSelectedPhoto(asset)

    uploadImageFunction?.(asset?.base64, asset?.uri?.substr(asset?.uri.lastIndexOf('.') + 1))
  }

  return (
    <View flex center>
      <View
        marginT-20
        center
        style={{
          width: 280,
        }}
      >
        <Avatar
          size={248}
          source={{
            uri: selectedPhoto?.uri,
          }}
          label="AR"
        />

        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size={'small'} />
        </View>
      </View>
      <Button
        marginT-20
        label={'Upload'}
        size={Button.sizes.large}
        backgroundColor={Colors.black}
        labelStyle={{ fontWeight: 'bold' }}
        onPress={pickImage}
      />
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
})
