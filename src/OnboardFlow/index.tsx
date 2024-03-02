import React, { FC, useCallback, useEffect, useRef, useState } from "react"

import { ImageResult } from "expo-image-manipulator"
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  Modal,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import PagerView, { PagerViewProps } from "react-native-pager-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { BottomSheet, BottomSheetRef } from "./BottomSheet"
import { Footer } from "./Footer"
import { Page, PageProps } from "./Page"
import { DotPagination } from "./Pagination/components/Dot"
import { SwiperFlatList } from "./Swiper"
import { SwiperFlatListRefProps } from "./Swiper/SwiperProps"

import { FormEntryField } from "./components/InputField"
import { PrimaryButton, PrimaryButtonProps } from "./components/PrimaryButton"
import { SecondaryButton, SecondaryButtonProps } from "./components/SecondaryButton"
import {
  COLOR_PRIMARY_DEFAULT,
  COLOR_SECONDARY_DEFAULT,
  DEFAULT_FORM_ENTRY_TYPES,
  HORIZONTAL_PADDING_DEFAULT,
  VERTICAL_PADDING_DEFAULT,
} from "./constants"
import { ImageCropContextProvider } from "./contexts/ImageCropContext"
import { DEFAULT_PAGE_TYPES } from "./pageTypes"
import { OnboardFlowProps, PageData, PaginationProps, StepResponseData, TextStyles } from "./types"

export type PageType = string

export type OnboardPageConfigParams<Props> = {
  props: Props
} & PageProps &
  TextStyles

export type FormElementTypeConfigParams<Props> = {
  props: Props
} & FormEntryField &
  TextStyles

export type OnboardPageTypesConfig = {
  [key: string]: (params: OnboardPageConfigParams<any>) => React.ReactNode
}

export type FormElementTypesConfig = {
  [key: string]: (params: FormElementTypeConfigParams<any>) => React.ReactNode
}

export interface OnboardComponents {
  PrimaryButtonComponent: FC<PrimaryButtonProps>
  SecondaryButtonComponent: FC<SecondaryButtonProps>
  PaginationComponent: FC<PaginationProps>
}

type PageWrapperProps = {
  index: number
  currentPageValue: number
  pageData: PageData
  pagesMerged: any
  containerWidth: number
  formElementTypes: FormElementTypesConfig
  pageStyle: StyleProp<ViewStyle>
  textStyle: StyleProp<TextStyle>
  titleStyle: StyleProp<TextStyle>
  subtitleStyle: StyleProp<TextStyle>
  totalPages: number
  goToNextPage: () => void
  goToPreviousPage: () => void
  textAlign: "center" | "left" | "right"
  customVariables: object
  primaryColor: string
  secondaryColor: string
  deleteImage?: (string) => void
  getAssetsPublicUrl?: (string) => string
  uploadImageFunction?: (
    imageResult: ImageResult,
    imageExtension?: string,
    pathname?: string,
  ) => Promise<{ path: string }>
  scrollEnabled: boolean
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>
  canContinue: boolean
  setCanContinue: (value: boolean) => void
  maxTextHeight?: number
  setMaxTextHeight?: (height: number) => void
  onSaveData: (data: StepResponseData, pageId: string) => void
  getPageId: (pageData: PageData, index: number) => string
}

const PageWrapper = ({
  index,
  currentPageValue,
  pageData,
  pagesMerged,
  containerWidth,
  formElementTypes,
  pageStyle,
  textStyle,
  titleStyle,
  subtitleStyle,
  totalPages,
  goToNextPage,
  goToPreviousPage,
  textAlign,
  customVariables,
  primaryColor,
  secondaryColor,
  canContinue,
  setCanContinue,
  uploadImageFunction,
  maxTextHeight,
  setMaxTextHeight,
  onSaveData,
  getPageId,
  setScrollEnabled,
  scrollEnabled,
  getAssetsPublicUrl,
  deleteImage,
}: PageWrapperProps) => {
  useEffect(() => {
    if (index === currentPageValue && pageData?.dismissKeyboard) Keyboard.dismiss()
  }, [currentPageValue, index, pageData?.dismissKeyboard])

  const onSaveDataWrapper = useCallback(
    (dataProp) => {
      onSaveData?.(
        dataProp.data && dataProp.source ? dataProp : { data: dataProp, source: pageData },
        getPageId(pageData, index),
      )
    },
    [getPageId, index, onSaveData, pageData],
  )

  if (pageData?.type === "custom" && pageData) return null

  // return (
  //   <View>
  //     <Text>First page</Text>
  //   </View>
  // )
  return pageData.type && pagesMerged[pageData.type] ? (
    <View key={index} style={{ height: "100%" }}>
      {pagesMerged[pageData.type]({
        formElementTypes: formElementTypes,
        style: [pageStyle, pageData.style ? (pageData.style as StyleProp<ViewStyle>) : null],
        textStyle: [
          textStyle,
          pageData.textStyle ? (pageData.textStyle as StyleProp<TextStyle>) : null,
        ],
        titleStyle: [
          titleStyle,
          pageData.titleStyle ? (pageData.titleStyle as StyleProp<TextStyle>) : null,
        ],
        subtitleStyle: [
          subtitleStyle,
          pageData.subtitleStyle ? (pageData.subtitleStyle as StyleProp<TextStyle>) : null,
        ],
        pageData,
        pageIndex: index,
        currentPage: currentPageValue,
        totalPages,
        goToNextPage,
        goToPreviousPage,
        textAlign,
        width: containerWidth,
        props: pageData.props,
        customVariables,
        primaryColor,
        secondaryColor,
        onSaveData: onSaveDataWrapper,
        setCanContinue,
        canContinue,
        uploadImageFunction,
        getAssetsPublicUrl,
        deleteImage,
        setScrollEnabled,
        scrollEnabled,
      })}
    </View>
  ) : (
    <View key={index} style={{ width: containerWidth }}>
      <Page
        formElementTypes={formElementTypes}
        style={[pageStyle, pageData.style ? (pageData.style as StyleProp<ViewStyle>) : null]}
        titleStyle={[
          titleStyle,
          pageData.titleStyle ? (pageData.titleStyle as StyleProp<TextStyle>) : null,
        ]}
        subtitleStyle={[
          subtitleStyle,
          pageData.subtitleStyle ? (pageData.subtitleStyle as StyleProp<TextStyle>) : null,
        ]}
        textStyle={[
          textStyle,
          pageData.textStyle ? (pageData.textStyle as StyleProp<TextStyle>) : null,
        ]}
        pageData={pageData}
        pageIndex={index}
        currentPage={currentPageValue}
        totalPages={totalPages}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        textAlign={textAlign}
        width={containerWidth}
        maxTextHeight={maxTextHeight}
        setMaxTextHeight={setMaxTextHeight}
        customVariables={customVariables}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onSaveData={onSaveDataWrapper}
        setCanContinue={setCanContinue}
        canContinue={canContinue}
        uploadImageFunction={uploadImageFunction}
        getAssetsPublicUrl={getAssetsPublicUrl}
        setScrollEnabled={setScrollEnabled}
        scrollEnabled={scrollEnabled}
        deleteImage={deleteImage}
      />
    </View>
  )
}

function insert<T>(arr: T[], index: number, newData: T[]) {
  return [...arr.slice(0, index), ...newData, ...arr.slice(index)]
}

export const OnboardFlow: FC<OnboardFlowProps & TextStyles> = ({
  autoPlay = false,
  backgroundImageUri,
  dismissButtonStyle,
  fullscreenModal,
  textStyle,
  onBack,
  onDone,
  onNext,
  onSaveData,
  canContinue,
  setCanContinue,
  pageStyle,
  pageTypes = DEFAULT_PAGE_TYPES,
  formElementTypes = DEFAULT_FORM_ENTRY_TYPES,
  pages: pagesProp,
  paginationColor = COLOR_SECONDARY_DEFAULT,
  paginationSelectedColor = COLOR_PRIMARY_DEFAULT,
  showDismissButton = false,
  enableScroll = true,
  style,
  subtitleStyle,
  textAlign = "center",
  titleStyle,
  type = "fullscreen",
  HeaderComponent = () => null,
  customVariables = {},
  FooterComponent = Footer,
  PaginationComponent = DotPagination,
  PrimaryButtonComponent = PrimaryButton,
  primaryButtonStyle,
  primaryButtonTextStyle,
  SecondaryButtonComponent = SecondaryButton,
  primaryColor = COLOR_PRIMARY_DEFAULT,
  secondaryColor = COLOR_SECONDARY_DEFAULT,
  currentPage,
  setCurrentPage,
  uploadImageFunction,
  getAssetsPublicUrl,
  deleteImage,
  ...props
}) => {
  const { top } = useSafeAreaInsets()
  const [pages, setPages] = useState<PageData[]>(pagesProp)
  const [scrollEnabled, setScrollEnabled] = useState(true)

  useEffect(() => setPages(pagesProp), [pagesProp])

  const pagesMerged = { ...DEFAULT_PAGE_TYPES, ...pageTypes }
  const [currentPageInternal, setCurrentPageInternal] = useState(0)
  const [modalVisible, setModalVisible] = useState(true)
  const [canContinueInternal, setCanContinueInternal] = useState(false)
  const swiperRef = useRef<PagerView>(null)
  const [containerWidth, setContainerWidth] = useState<number>(Dimensions.get("window").width ?? 0)
  const windowHeight = Dimensions.get("window").height
  const [maxTextHeight, setMaxTextHeight] = useState<number>(0)
  const bottomSheetRef = useRef<BottomSheetRef>(null)
  const currentPageValue = currentPage ?? currentPageInternal
  const setCurrentPageValue = setCurrentPage ?? setCurrentPageInternal

  const showHeader = pages[currentPageValue].showHeader !== false
  const showFooter = pages[currentPageValue].showFooter !== false

  const components: OnboardComponents = {
    PrimaryButtonComponent,
    PaginationComponent,
    SecondaryButtonComponent,
  }

  const canContinueValue = canContinue ?? canContinueInternal
  const setCanContinueValue = setCanContinue ?? setCanContinueInternal

  const onLayout = useCallback((event) => {
    setContainerWidth(event.nativeEvent.layout.width)
  }, [])

  const getPageId = useCallback((pageData: PageData, index: number) => {
    return pageData?.id ?? index + ""
  }, [])

  const handleIndexChange = useCallback(
    (item: { index: number; prevIndex: number }) => {
      if (item.index != currentPageValue) {
        setCurrentPageValue(item.index)
      }
      if (item.index > item.prevIndex) {
        onNext?.()
        return
      }
      if (item.index < item.prevIndex) {
        onBack?.()
        return
      }
    },
    [currentPageValue, onBack, onNext, setCurrentPageValue],
  )

  const handleDone = useCallback(() => {
    setModalVisible(false)
    bottomSheetRef.current?.close()
    onDone && onDone()
  }, [onDone])

  const goToNextPage = useCallback(() => {
    const currPage = pages[currentPageValue]
    if (currPage?.isConditional) {
      setPages((val) => [
        ...val.slice(0, currentPageValue + 1),
        ...(currPage.pages ?? []),
        ...val.slice(currentPageValue + 1),
      ])
    }

    if (currentPageValue >= pages?.length - 1) {
      handleDone()
      return
    }
    const nextIndex = currentPageValue + 1
    // setCurrentPageValue(nextIndex)
    swiperRef.current?.setPage(nextIndex)
  }, [currentPageValue, handleDone, pages, setCurrentPageValue])

  const goToPreviousPage = useCallback(() => {
    const nextIndex = currentPageValue - 1
    if (nextIndex < 0) {
      return
    }
    // setCurrentPageValue(nextIndex)
    swiperRef.current?.setPage(nextIndex)
  }, [setCurrentPageValue])

  const DismissButton = useCallback(() => {
    return (
      <View style={[styles.dismissIconContainer]}>
        <TouchableOpacity onPress={handleDone}>
          <Text style={[styles.dismissIcon, dismissButtonStyle]}>✕</Text>
        </TouchableOpacity>
      </View>
    )
  }, [dismissButtonStyle, handleDone])

  const updateMaxTextHeight = useCallback(
    (height: number) => {
      if (height > maxTextHeight) {
        setMaxTextHeight(height)
      }
    },
    [maxTextHeight],
  )

  const content = (
    <ImageCropContextProvider>
      <ImageBackground
        source={{ uri: backgroundImageUri }}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <SafeAreaView style={[styles.container, style]} onLayout={onLayout}>
          {showDismissButton ? <DismissButton /> : null}
          {showHeader && HeaderComponent ? (
            <HeaderComponent
              paginationSelectedColor={paginationSelectedColor}
              paginationColor={paginationColor}
              goToPreviousPage={goToPreviousPage}
              pages={pages}
              style={[styles.footer, !showFooter ? { opacity: 0.0 } : null]}
              Components={components}
              currentPage={currentPageValue}
              goToNextPage={goToNextPage}
              canContinue={canContinueValue}
              setCanContinue={setCanContinueValue}
              showFooter={showFooter}
            />
          ) : null}
          <View style={styles.content}>
            <PagerView
              style={{ width: "100%", height: "100%" }}
              ref={swiperRef}
              onPageSelected={(e) => setCurrentPageValue(e?.nativeEvent?.position)}
            >
              {pages?.map((pageData, index) => {
                return (
                  <PageWrapper
                    key={index}
                    deleteImage={deleteImage}
                    key={pageData?.title}
                    pagesMerged={pagesMerged}
                    getPageId={getPageId}
                    formElementTypes={formElementTypes}
                    pageStyle={pageStyle}
                    titleStyle={titleStyle}
                    subtitleStyle={subtitleStyle}
                    textStyle={textStyle}
                    index={index}
                    pageData={pageData}
                    currentPageValue={currentPageValue}
                    totalPages={pages?.length}
                    goToNextPage={goToNextPage}
                    goToPreviousPage={goToPreviousPage}
                    textAlign={textAlign}
                    containerWidth={containerWidth}
                    maxTextHeight={maxTextHeight}
                    setMaxTextHeight={updateMaxTextHeight}
                    customVariables={customVariables}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    onSaveData={onSaveData}
                    setCanContinue={setCanContinueValue}
                    canContinue={canContinueValue}
                    uploadImageFunction={uploadImageFunction}
                    getAssetsPublicUrl={getAssetsPublicUrl}
                    setScrollEnabled={setScrollEnabled}
                    scrollEnabled={scrollEnabled}
                  />
                )
              })}
            </PagerView>
          </View>
          <FooterComponent
            paginationSelectedColor={paginationSelectedColor}
            paginationColor={paginationColor}
            goToPreviousPage={goToPreviousPage}
            pages={pages}
            style={[styles.footer, !showFooter ? { opacity: 0.0 } : null]}
            Components={components}
            currentPage={currentPageValue}
            goToNextPage={goToNextPage}
            canContinue={canContinueValue}
            setCanContinue={setCanContinueValue}
            showFooter={showFooter}
            primaryButtonStyle={primaryButtonStyle}
            primaryButtonTextStyle={primaryButtonTextStyle}
          />
          <Toast topOffset={top > 0 ? top : 20} />
        </SafeAreaView>
      </ImageBackground>
    </ImageCropContextProvider>
  )
  if (fullscreenModal === true || type === "fullscreen") {
    return (
      <Modal hardwareAccelerated visible={modalVisible}>
        {content}
      </Modal>
    )
  }

  if (type === "bottom-sheet") {
    return (
      <BottomSheet height={windowHeight * 0.8} ref={bottomSheetRef}>
        {content}
      </BottomSheet>
    )
  }

  return content
}

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING_DEFAULT,
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  button: {
    backgroundColor: "#000",
    width: "100%",
    borderRadius: 32,
    marginTop: VERTICAL_PADDING_DEFAULT,
    marginBottom: VERTICAL_PADDING_DEFAULT,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: VERTICAL_PADDING_DEFAULT,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    alignContent: "space-between",
  },
  content: {
    flex: 1,
    flexGrow: 4,
  },
  backgroundImage: {
    flex: 1,
  },
  buttonBackgroundImage: {
    borderRadius: 32,
    marginHorizontal: 32,
  },
  dismissIcon: {
    fontSize: 22,
    width: 30,
    height: 30,
    textAlign: "center",
    lineHeight: 30,
    backgroundColor: "transparent",
  },
  dismissIconContainer: {
    position: "absolute",
    flex: 1,
    top: VERTICAL_PADDING_DEFAULT * 2,
    right: HORIZONTAL_PADDING_DEFAULT,
    zIndex: 1000,
  },
  header: {
    height: 64,
    paddingHorizontal: HORIZONTAL_PADDING_DEFAULT,
    width: "100%",
  },
})
