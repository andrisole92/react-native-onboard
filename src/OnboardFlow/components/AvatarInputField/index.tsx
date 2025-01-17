import * as FileSystem from "expo-file-system"
import * as ImagePicker from "expo-image-picker"
import React, { FC, useCallback, useEffect, useState } from "react"

import { ActivityIndicator, ColorValue } from "react-native"

import { Analytics } from "app/lib/Analytics"
import { MyToast } from "app/lib/MyToast"
import { colors } from "app/theme"
import { ImageResult, SaveFormat, manipulateAsync } from "expo-image-manipulator"
import FaceDetection, {
  FaceDetectorContourMode,
  FaceDetectorLandmarkMode,
} from "react-native-face-detection"
import { Avatar, Button, Colors, Text, View } from "react-native-ui-lib"
import { useImageCropContext } from "../../contexts/ImageCropContext"
import { TextStyles } from "../../types"
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
  deleteImage?: (string) => void
  getAssetsPublicUrl?: (string) => string
  uploadImageFunction?: (
    imageResult: ImageResult,
    imageExtension?: string,
    pathname?: string,
  ) => Promise<{ path: string }>
  options: any
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
  options,
  id,
}) => {
  const { cropImage } = useImageCropContext()
  const [error, setError] = useState(false)

  const [loading, setLoading] = useState<boolean>(false)

  const [selectedPhoto, setSelectedPhoto] = useState<ImagePicker.ImagePickerAsset>()
  const [value, setValue] = useState<string | undefined>(prefill)

  useEffect(() => {
    if (isRequired && value == null) setHasError?.(true)
  }, [isRequired, setHasError, value])

  const pickImage = useCallback(async () => {
    setError(false)
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      })

      const croppedImage = await cropImage(result?.assets?.[0], { fixedCropAspectRatio: 1 })
      setSelectedPhoto(croppedImage)

      if (options?.faceDetectionRequired ?? true) {
        const faces = await FaceDetection.processImage(croppedImage?.uri, {
          landmarkMode: FaceDetectorLandmarkMode.ALL,
          contourMode: FaceDetectorContourMode.ALL,
        })

        if (faces?.length === 0) {
          MyToast.show({ type: "error", text1: "No faces detected in the image" })
          throw new Error("No faces detected in the image")
        }
      }

      const localUri = croppedImage.uri

      const manipResult = await manipulateAsync(
        localUri,
        [{ resize: { height: 400, width: 400 } }],
        {
          compress: 1,
          format: SaveFormat.JPEG,
        },
      )

      setValue(undefined)
      setLoading(true)
      const res = await uploadImageFunction?.(
        manipResult,
        manipResult.uri?.substr(manipResult.uri.lastIndexOf(".") + 1),
        "/avatars/",
      )
      setValue(res?.path)
      setLoading(false)
      setHasError?.(false)
    } catch (err) {
      Analytics.logError(err)
      setError(true)
    }
  }, [cropImage, options?.faceDetectionRequired, uploadImageFunction, setHasError])

  useEffect(() => {
    onSaveData?.({ id, value })
  }, [value, id, onSaveData])

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
          backgroundColor={colors.background}
          size={248}
          source={{
            uri: value != null ? getAssetsPublicUrl?.(value) : selectedPhoto?.uri,
          }}
          label="AR"
        />

        {loading && (
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size={"small"} color={"white"} />
          </View>
        )}
      </View>
      <Button
        marginT-20
        label={loading ? "Uploading" : "Upload"}
        disabled={loading}
        size={Button.sizes.large}
        backgroundColor={Colors.black}
        labelStyle={{ fontWeight: "bold" }}
        onPress={pickImage}
      />
      {error && (
        <Text color={Colors.red30} marginT-20>
          Sorry, something went wrong
        </Text>
      )}
    </View>
  )
}
