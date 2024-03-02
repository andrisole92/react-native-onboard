import { Text } from "app/components"
import { ImageResult } from "expo-image-manipulator"
import React, { FC, useEffect, useState } from "react"
import { Dimensions, Image, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TextStack } from "../components/TextStack"
import {
  HORIZONTAL_PADDING_DEFAULT,
  TEXT_ALIGN_DEFAULT,
  VERTICAL_PADDING_DEFAULT,
} from "../constants"
import { FormElementTypesConfig } from "../index"
import { PageData, TextStyles } from "../types"

export interface PageProps {
  style?: StyleProp<ViewStyle> | undefined
  pageIndex: number
  currentPage: number
  totalPages: number
  pageData: PageData
  formElementTypes?: FormElementTypesConfig
  customVariables?: object
  goToNextPage: () => void
  onSaveData?: (data: any) => void
  goToPreviousPage: () => void
  textAlign?: "left" | "center" | "right"
  width: number
  maxTextHeight?: number
  setMaxTextHeight?: (height: number) => void
  primaryColor?: string
  secondaryColor?: string
  canContinue?: boolean
  setCanContinue?: (value: boolean) => void
  deleteImage?: (string) => void
  getAssetsPublicUrl?: (string) => string
  uploadImageFunction?: (
    imageResult: ImageResult,
    imageExtension?: string,
    pathname?: string,
  ) => Promise<{ path: string }>
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>
  scrollEnabled: boolean
}

export const Page: FC<PageProps & TextStyles> = ({
  style,
  titleStyle,
  subtitleStyle,
  textStyle,
  pageData,
  pageIndex,
  customVariables,
  currentPage,
  totalPages,
  goToNextPage,
  goToPreviousPage,
  textAlign = TEXT_ALIGN_DEFAULT,
  width,
  maxTextHeight,
  setMaxTextHeight,
  onSaveData,
  primaryColor,
  secondaryColor,
  setScrollEnabled,
  setCanContinue,
}) => {
  const [imageHeight, setImageHeight] = useState(0)
  const [containerHeight, setContainerHeight] = useState<number>(
    Dimensions.get("window").height ?? 0,
  )

  const onContainerLayout = (event) => {
    setContainerHeight(event.nativeEvent.layout.height)
  }

  const onTextStackLayout = (event) => {
    setMaxTextHeight && setMaxTextHeight(event.nativeEvent.layout.height)
  }

  useEffect(() => {
    setCanContinue(true)
  }, [setCanContinue])

  useEffect(() => {
    if (pageData.imageUri) {
      Image.getSize(pageData.imageUri, (width, height) => {
        setImageHeight(height)
      })
    }
  }, [pageData.imageUri])

  function ImageComponent() {
    if (pageData.imageComponent) {
      return pageData.imageComponent
    }
    return null
  }

  return (
    <View style={[styles.container, style, { width: width }]} onLayout={onContainerLayout}>
      {pageData.imageUri && (
        <Image
          source={pageData?.imageSource ?? { uri: pageData.imageUri }}
          style={{
            width: "auto",
            height: "50%",
            marginVertical: VERTICAL_PADDING_DEFAULT * 3,
            maxHeight: "50%",
          }}
          resizeMode="contain"
        />
      )}
      <View style={styles.imageComponentWrapper}>
        <ImageComponent />
      </View>
      <View style={styles.bottomContainer}>
        <ScrollView onLayout={onTextStackLayout}>
          <TextStack
            title={pageData?.title}
            subtitle={pageData?.subtitle}
            textStyle={textStyle}
            textAlign={textAlign}
            titleStyle={titleStyle}
            subtitleStyle={subtitleStyle}
          />
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    // flex: 1,
    // flexDirection: "column",
    // paddingHorizontal: HORIZONTAL_PADDING_DEFAULT,
  },
  image: {
    width: "100%",
    marginVertical: VERTICAL_PADDING_DEFAULT * 3,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  imageComponentWrapper: {
    alignItems: "center",
  },
})
