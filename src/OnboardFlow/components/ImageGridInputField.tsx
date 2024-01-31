import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import IconCameraF from '../../../static/assets/svg/camera-f.svg'
import IconsCrossSmall from '../../../static/assets/svg/cross-small.svg'

import {
  ActivityIndicator,
  Alert,
  ColorValue,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { DraggableGrid } from 'react-native-draggable-grid'

import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'
import { Colors, Text, View } from 'react-native-ui-lib'
import { useImageCropContext } from '../contexts/ImageCropContext'
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
  hasError?: boolean
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
  setScrollEnabled?: React.Dispatch<React.SetStateAction<boolean>>
}

const MINIMUM_CROP_DIMENSIONS = {
  width: 50,
  height: 50,
}

export const ImageGridInputField: FC<FormEntryField & TextStyles> = ({
  uploadImageFunction,
  getAssetsPublicUrl,
  isRequired,
  hasError,
  setHasError,
  setCanContinue,
  onSaveData,
  setScrollEnabled,
  id,
  prefill,
  deleteImage,
}) => {
  const { cropImage, pickImage } = useImageCropContext()
  const { width } = useWindowDimensions()

  const [data, setData] = useState([
    {
      index: 0,
      key: 'one',
      name: 'one',
      pic: prefill?.[0],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 1,
      key: 'two',
      name: 'two',
      pic: prefill?.[1],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 2,
      key: 'three',
      name: 'three',
      pic: prefill?.[2],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 3,
      key: 'four',
      name: 'four',
      pic: prefill?.[3],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 4,
      key: 'five',
      name: 'five',
      pic: prefill?.[4],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 5,
      key: 'six',
      name: 'six',
      pic: prefill?.[5],
      isLoading: false,
      localUri: undefined,
    },
  ])

  const totalImages = useMemo(() => data?.filter?.((im) => im?.pic != null)?.length, [data])

  useEffect(() => {
    console.log({ totalImages, error: totalImages < 2 })
    isRequired && setHasError(totalImages < 2)
  }, [isRequired, setHasError, totalImages])

  const onPress = useCallback(
    async (pic_index: number) => {
      try {
        const croppedImage = await pickImage()

        const localUri = croppedImage.uri

        const manipResult = await manipulateAsync(
          localUri,
          [{ resize: { height: 1200, width: 900 } }],
          {
            compress: 0.8,
            format: SaveFormat.JPEG,
          }
        )

        const base64Img = await FileSystem.readAsStringAsync(manipResult.uri, {
          encoding: FileSystem?.EncodingType?.Base64,
        })

        setData((localData) =>
          localData?.map((localItem) =>
            localItem?.index === pic_index ? { ...localItem, isLoading: true, localUri } : localItem
          )
        )

        const res = await uploadImageFunction(
          base64Img,
          manipResult.uri?.substr(localUri.lastIndexOf('.') + 1),
          '/images/'
        )

        setData((localData) =>
          localData?.map((localItem) =>
            localItem?.index === pic_index
              ? {
                  ...localItem,
                  isLoading: false,
                  localUri: undefined,
                  disabledDrag: false,
                  pic: res?.path,
                }
              : localItem
          )
        )
      } catch (e) {
        // logException(e)
      }
    },
    [pickImage, uploadImageFunction]
  )

  useEffect(() => {
    onSaveData?.({ id, value: data?.map((item) => item?.pic) })
  }, [data, id, onSaveData])

  const onDeleteImagePress = useCallback(
    (picIndex: number) => {
      Alert.alert('Delete this image?', undefined, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const value = data?.[picIndex]?.pic

            if (value) {
              setData((dataVal) =>
                dataVal?.map((_, idx) =>
                  idx === picIndex ? { ..._, pic: undefined, localUri: undefined } : _
                )
              )
              deleteImage(value)
            }
          },
        },
      ])
    },
    [data, deleteImage]
  )

  const render_item = useCallback(
    ({
      pic,
      index,
      isLoading,
      localUri,
    }: {
      name: string
      key: string
      pic: any
      index: number
      isLoading: boolean
      localUri: string
    }) => {
      const ITEM_WIDTH = width / 3 - 17
      const ITEM_HEIGHT = (ITEM_WIDTH / 3) * 4

      if (pic)
        return (
          <View>
            <Image
              source={{ uri: getAssetsPublicUrl(pic) }}
              style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, borderRadius: 22 }}
            />
            <Pressable
              onPress={() => onDeleteImagePress(index)}
              style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                padding: 0,
                borderRadius: 22,
                zIndex: 100,
                backgroundColor: Colors.$iconDanger,
              }}
            >
              <IconsCrossSmall width={24} height={24} fill={Colors.white} />
            </Pressable>
          </View>
        )

      return localUri ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={{ uri: localUri }}
            style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, borderRadius: 22 }}
          />
          {isLoading && (
            <ActivityIndicator
              size={48}
              animating={true}
              color={Colors.main}
              style={{ position: 'absolute' }}
            />
          )}
        </View>
      ) : (
        <Pressable
          testID="imageUploadButton"
          onPress={() => onPress(index)}
          style={[
            styles.touchable,
            {
              backgroundColor: '#f5f5f5',
              borderColor: Colors.main,
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
            },
          ]}
        >
          <IconCameraF width={32} height={32} fill={Colors.main} />
        </Pressable>
      )
    },
    [getAssetsPublicUrl, onDeleteImagePress, onPress, width]
  )

  return (
    <View style={{ flex: 1, paddingVertical: 12, paddingBottom: 24 }}>
      <DraggableGrid
        onDragItemActive={() => setScrollEnabled(false)}
        itemHeight={(width / 3 / 3) * 4 - 15}
        numColumns={3}
        renderItem={render_item}
        data={data}
        onDragRelease={async (newData) => {
          setScrollEnabled(true)
          // console.log({ newData })
          setData(newData)
        }}
      />
      {hasError && (
        <Text color={Colors.red30} marginT-20>
          please upload at least two photos
        </Text>
      )}
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
  touchable: {
    width: 120,
    height: 160,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    margin: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  item: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item_text: {
    fontSize: 40,
    color: '#FFFFFF',
  },
})
