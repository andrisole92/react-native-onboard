import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import IconCameraF from '../../../static/assets/svg/camera-f.svg'
// import IconsCrossSmall from '../../../static/assets/svg/cross-small.svg'

import {
  ActivityIndicator,
  ColorValue,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { DraggableGrid } from 'react-native-draggable-grid'

import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'
import { Colors, View } from 'react-native-ui-lib'
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
  setHasError?: (value: boolean) => void
  autoFocus?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined
  backgroundColor?: ColorValue
  currentPage?: number
  pageIndex?: number
  totalPages?: number
  props?: any
  getAssetsPublicUrl?: (string) => string
  uploadImageFunction?: (
    base64Image: string,
    imageExtension?: string,
    pathname?: string
  ) => Promise<{ path: string; publicUrl: string }>
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

const MINIMUM_CROP_DIMENSIONS = {
  width: 50,
  height: 50,
}

export const ImageGridInputField: FC<FormEntryField & TextStyles> = ({
  uploadImageFunction,
  getAssetsPublicUrl,
  isRequired,
  setHasError,
  setCanContinue,
  onSaveData,
  setScrollEnabled,
  id,
  prefill,
}) => {
  const { cropImage } = useImageCropContext()
  const { width } = useWindowDimensions()

  const [values, setValues] = useState((prefill as any[]) ?? [null, null, null, null, null, null])

  const [data, setData] = useState([
    {
      index: 0,
      key: 'one',
      name: 'one',
      pic: values?.[0],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 1,
      key: 'two',
      name: 'two',
      pic: values?.[1],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 2,
      key: 'three',
      name: 'three',
      pic: values?.[2],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 3,
      key: 'four',
      name: 'four',
      pic: values?.[3],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 4,
      key: 'five',
      name: 'five',
      pic: values?.[4],
      isLoading: false,
      localUri: undefined,
    },
    {
      index: 5,
      key: 'six',
      name: 'six',
      pic: values?.[5],
      isLoading: false,
      localUri: undefined,
    },
  ])

  const totalImages = useMemo(() => data?.filter?.((im) => im?.localUri != null)?.length, [data])

  useEffect(() => {
    // setHasError(totalImages < 1)
  }, [isRequired, setHasError, totalImages])

  const onPress = useCallback(
    async (pic_index: number) => {
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          base64: true,
        })

        const croppedImage = await cropImage(result?.assets?.[0])

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
              ? { ...localItem, isLoading: false, localUri, disabledDrag: false }
              : localItem
          )
        )
        setValues((localValues) =>
          localValues?.map((val, index) => (index === pic_index ? res?.path : val))
        )
      } catch (e) {
        // logException(e)
      }
    },
    [cropImage, uploadImageFunction]
  )

  useEffect(() => {
    onSaveData?.({ id, value: values })
  }, [values, id, onSaveData])

  useEffect(() => {
    const newValues = data?.map((dataItem) => dataItem?.pic)
    console.log({ newValues })
    onSaveData?.({ id, value: newValues })

    // setValues()
  }, [data, id, onSaveData])

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
      const value = values?.[index]

      return value == null ? (
        localUri ? (
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
      ) : (
        <View>
          <Image
            source={{ uri: getAssetsPublicUrl(pic) }}
            style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, borderRadius: 22 }}
          />
          {/* <Pressable
          onPress={() => {}}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            padding: 0,
            borderRadius: 22,
            zIndex: 100,
            backgroundColor: Colors.$iconDanger,
          }}
        >
          <IconsCrossSmall width={24} height={24} fill={Colors.white} />
        </Pressable> */}
        </View>
      )
    },
    [getAssetsPublicUrl, onPress, values, width]
  )

  return (
    <View style={{ flex: 1, paddingVertical: 12, paddingBottom: 24 }}>
      <DraggableGrid
        onDragItemActive={() => setScrollEnabled(false)}
        itemHeight={(width / 3 / 3) * 4 - 15}
        numColumns={3}
        renderItem={render_item}
        data={data}
        onDragRelease={async (data) => {
          setScrollEnabled(true)
          setData(data)
        }}
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
