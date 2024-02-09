import { ImageResult } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import ImageEditor from 'image-crop/src'
import * as React from 'react'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { View } from 'react-native'

const MINIMUM_CROP_DIMENSIONS = {
  width: 50,
  height: 50,
}

type Options = { fixedCropAspectRatio?: number }

type ContextType = {
  cropImage: (
    asset: ImagePicker.ImagePickerAsset,
    options?: Options
  ) => Promise<ImagePicker.ImagePickerAsset>
  pickImage: (options?: Options) => Promise<ImagePicker.ImagePickerAsset>
}

const ImageCropContext = createContext<ContextType>(null)

type Props = {
  children: React.ReactElement | Array<React.ReactElement>
}

const DEFAULT_ASPECT_RATIO = 3 / 4

export function ImageCropContextProvider({ children }: Props): React.ReactElement {
  const [aspectRation, setAspectRation] = useState(DEFAULT_ASPECT_RATIO)
  const promiseRef = useRef<
    | {
        resolve: (
          value: ImagePicker.ImagePickerAsset | PromiseLike<ImagePicker.ImagePickerAsset>
        ) => void
        reject: (reason?: any) => void
      }
    | undefined
  >()
  const [mImage, setMImage] = useState<ImageResult | null>(null)

  const onCloseEditor = useCallback(async () => {
    setMImage(null)
    promiseRef?.current?.reject(new Error('Editor Was Closed'))
  }, [])

  const onEditingComplete = useCallback(async (croppedImage: any) => {
    promiseRef?.current?.resolve(croppedImage)
  }, [])

  const cropImage = useCallback(
    async (
      asset: ImagePicker.ImagePickerAsset,
      options?: Options
    ): Promise<ImagePicker.ImagePickerAsset> => {
      setMImage(asset)
      setAspectRation(options?.fixedCropAspectRatio ?? DEFAULT_ASPECT_RATIO)

      return new Promise((resolve, reject) => {
        promiseRef.current = { resolve, reject }
      })
    },
    []
  )

  const pickImage = useCallback(
    async (options?: Options): Promise<ImagePicker.ImagePickerAsset> => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      })
      return cropImage(result?.assets?.[0], options)
    },
    [cropImage]
  )

  return (
    <ImageCropContext.Provider value={{ cropImage, pickImage }}>
      <ImageEditor
        mode="crop-only"
        visible={mImage != null}
        image={mImage}
        fixedCropAspectRatio={aspectRation}
        lockAspectRatio
        minimumCropDimensions={MINIMUM_CROP_DIMENSIONS}
        onCloseEditor={onCloseEditor}
        onEditingComplete={onEditingComplete}
      />
      {children}
    </ImageCropContext.Provider>
  )
}

export function useImageCropContext(): ContextType {
  const context = useContext(ImageCropContext)
  if (context == null) {
    throw new Error('useImageCropContext should be used within ImageCropContext')
  }
  return context
}
