import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'

import { ActivityIndicator, ColorValue, StyleSheet } from 'react-native'

import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'
import { Avatar, Button, Colors, Text, View } from 'react-native-ui-lib'
import { useImageCropContext } from '../../contexts/ImageCropContext'
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

const MINIMUM_CROP_DIMENSIONS = {
  width: 50,
  height: 50,
}

export const AvatarInputField: FC<FormEntryField & TextStyles> = ({
  uploadImageFunction,
  getAssetsPublicUrl,
  prefill,
  isRequired,
  setHasError,
  onSaveData,
  id,
}) => {
  const { cropImage } = useImageCropContext()
  const [error, setError] = useState(false)

  const [loading, setLoading] = useState<boolean>(false)

  const [selectedPhoto, setSelectedPhoto] = useState<ImagePicker.ImagePickerAsset>(null)
  const [value, setValue] = useState<string | undefined>(prefill)

  useEffect(() => {
    if (isRequired && value == null) setHasError(true)
  }, [isRequired, setHasError, value])

  const pickImage = useCallback(async () => {
    setError(false)
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: true,
      })

      const croppedImage = await cropImage(result?.assets?.[0], { fixedCropAspectRatio: 1 })
      setSelectedPhoto(croppedImage)
      const localUri = croppedImage.uri

      const manipResult = await manipulateAsync(
        localUri,
        [{ resize: { height: 600, width: 600 } }],
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
        }
      )

      const base64Img = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem?.EncodingType?.Base64,
      })

      setValue(null)
      setLoading(true)
      const res = await uploadImageFunction(
        base64Img,
        manipResult.uri?.substr(localUri.lastIndexOf('.') + 1),
        '/avatars/'
      )
      setValue(res?.path)
      setLoading(false)
      setHasError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    }
  }, [cropImage, uploadImageFunction, setHasError])

  useEffect(() => {
    onSaveData?.({ id, value })
  }, [value, id, onSaveData])

  return (
    <View flex center>
      {error && (
        <Text color={Colors.red30} marginT-20>
          Sorry, something went wrong
        </Text>
      )}
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
            uri: value ? getAssetsPublicUrl(value) : selectedPhoto?.uri,
          }}
          label="AR"
        />

        {loading && (
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
        )}
      </View>
      <Button
        marginT-20
        label={loading ? 'Uploading' : 'Upload'}
        disabled={loading}
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
