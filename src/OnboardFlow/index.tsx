import React, { FC, useEffect, useRef, useState } from 'react'

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
} from 'react-native'
import { BottomSheet, BottomSheetRef } from './BottomSheet'
import { Footer } from './Footer'
import { Page, PageProps } from './Page'
import { DotPagination } from './Pagination/components/Dot'
import { SwiperFlatList } from './Swiper'
import { SwiperFlatListRefProps } from './Swiper/SwiperProps'
import { FormEntryField } from './components/InputField'
import { PrimaryButton, PrimaryButtonProps } from './components/PrimaryButton'
import { SecondaryButton, SecondaryButtonProps } from './components/SecondaryButton'
import {
  COLOR_PRIMARY_DEFAULT,
  COLOR_SECONDARY_DEFAULT,
  DEFAULT_FORM_ENTRY_TYPES,
  DEFAULT_PAGE_TYPES,
  HORIZONTAL_PADDING_DEFAULT,
  VERTICAL_PADDING_DEFAULT,
} from './constants'
import { OnboardFlowProps, PageData, PaginationProps, TextStyles } from './types'

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
  pages,
  paginationColor = COLOR_SECONDARY_DEFAULT,
  paginationSelectedColor = COLOR_PRIMARY_DEFAULT,
  showDismissButton = false,
  enableScroll = true,
  style,
  subtitleStyle,
  textAlign = 'center',
  titleStyle,
  type = 'fullscreen',
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
  ...props
}) => {
  const pagesMerged = { ...DEFAULT_PAGE_TYPES, ...pageTypes }
  const formElementsMerged = { ...DEFAULT_FORM_ENTRY_TYPES, ...formElementTypes }
  const [currentPageInternal, setCurrentPageInternal] = useState(0)
  const [modalVisible, setModalVisible] = useState(true)
  const [canContinueInternal, setCanContinueInternal] = useState(true)
  const swiperRef = useRef<SwiperFlatListRefProps>()
  const [containerWidth, setContainerWidth] = useState<number>(Dimensions.get('window').width ?? 0)
  const windowHeight = Dimensions.get('window').height
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

  const onLayout = (event) => {
    setContainerWidth(event.nativeEvent.layout.width)
  }

  function getPageId(pageData: PageData, index: number) {
    return pageData?.id ?? index + ''
  }

  function handleIndexChange(item: { index: number; prevIndex: number }) {
    if (item.index != currentPageValue) {
      setCurrentPageValue(item.index)
    }
    if (item.index > item.prevIndex) {
      onNext && onNext()
      return
    }
    if (item.index < item.prevIndex) {
      onBack && onBack()
      return
    }
  }

  function handleDone() {
    setModalVisible(false)
    bottomSheetRef.current?.close()
    onDone && onDone()
  }

  function goToNextPage() {
    if (currentPageValue >= pages?.length - 1) {
      handleDone()
      return
    }
    const nextIndex = swiperRef.current?.getCurrentIndex() + 1
    setCurrentPageValue(nextIndex)
    swiperRef.current?.scrollToIndex({ index: nextIndex })
  }

  function goToPreviousPage() {
    const nextIndex = swiperRef.current?.getCurrentIndex() - 1
    if (nextIndex < 0) {
      return
    }
    setCurrentPageValue(nextIndex)
    swiperRef.current?.scrollToIndex({ index: nextIndex })
  }

  function DismissButton() {
    return (
      <View style={[styles.dismissIconContainer]}>
        <TouchableOpacity onPress={handleDone}>
          <Text style={[styles.dismissIcon, dismissButtonStyle]}>✕</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function updateMaxTextHeight(height: number) {
    if (height > maxTextHeight) {
      setMaxTextHeight(height)
    }
  }

  const content = (
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
          <SwiperFlatList
            disableGesture={!enableScroll ? true : !canContinueValue}
            onChangeIndex={handleIndexChange}
            ref={swiperRef}
            index={currentPageValue}
            autoplay={autoPlay}
          >
            {pages?.map((pageData, index) => {
              if (pageData?.type === 'custom' && pageData) return null

              useEffect(() => {
                if (index === currentPageValue && pageData?.dismissKeyboard) Keyboard.dismiss()
              }, [index, currentPageValue])

              return pageData.type && pagesMerged[pageData.type] ? (
                <View key={index} style={{ width: containerWidth }}>
                  {pagesMerged[pageData.type]({
                    formElementTypes: formElementTypes,
                    style: [
                      pageStyle,
                      pageData.style ? (pageData.style as StyleProp<ViewStyle>) : null,
                    ],
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
                      pageData.subtitleStyle
                        ? (pageData.subtitleStyle as StyleProp<TextStyle>)
                        : null,
                    ],
                    pageData,
                    pageIndex: index,
                    currentPage: currentPageValue,
                    totalPages: pages?.length,
                    goToNextPage,
                    goToPreviousPage,
                    textAlign,
                    width: containerWidth,
                    props: pageData.props,
                    customVariables,
                    primaryColor,
                    secondaryColor,
                    onSaveData: (data) => {
                      if (onSaveData) {
                        onSaveData(
                          data.data && data.source ? data : { data: data, source: pageData },
                          getPageId(pageData, index)
                        )
                      }
                    },
                    setCanContinue: setCanContinueValue,
                    canContinue: canContinueValue,
                    uploadImageFunction,
                  })}
                </View>
              ) : (
                <View key={index} style={{ width: containerWidth }}>
                  <Page
                    formElementTypes={formElementTypes}
                    style={[
                      pageStyle,
                      pageData.style ? (pageData.style as StyleProp<ViewStyle>) : null,
                    ]}
                    titleStyle={[
                      titleStyle,
                      pageData.titleStyle ? (pageData.titleStyle as StyleProp<TextStyle>) : null,
                    ]}
                    subtitleStyle={[
                      subtitleStyle,
                      pageData.subtitleStyle
                        ? (pageData.subtitleStyle as StyleProp<TextStyle>)
                        : null,
                    ]}
                    textStyle={[
                      textStyle,
                      pageData.textStyle ? (pageData.textStyle as StyleProp<TextStyle>) : null,
                    ]}
                    pageData={pageData}
                    pageIndex={index}
                    currentPage={currentPageValue}
                    totalPages={pages?.length}
                    goToNextPage={goToNextPage}
                    goToPreviousPage={goToPreviousPage}
                    textAlign={textAlign}
                    width={containerWidth}
                    maxTextHeight={maxTextHeight}
                    setMaxTextHeight={updateMaxTextHeight}
                    customVariables={customVariables}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    onSaveData={(data) => {
                      if (onSaveData) {
                        onSaveData(
                          data.data && data.source ? data : { data: data, source: pageData },
                          getPageId(pageData, index)
                        )
                      }
                    }}
                    setCanContinue={setCanContinueValue}
                    canContinue={canContinueValue}
                    uploadImageFunction={uploadImageFunction}
                  />
                </View>
              )
            })}
          </SwiperFlatList>
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
      </SafeAreaView>
    </ImageBackground>
  )

  if (fullscreenModal === true || type === 'fullscreen') {
    return <Modal visible={modalVisible}>{content}</Modal>
  }

  if (type === 'bottom-sheet') {
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
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#000',
    width: '100%',
    borderRadius: 32,
    marginTop: VERTICAL_PADDING_DEFAULT,
    marginBottom: VERTICAL_PADDING_DEFAULT,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: VERTICAL_PADDING_DEFAULT,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    alignContent: 'space-between',
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
    textAlign: 'center',
    lineHeight: 30,
    backgroundColor: 'transparent',
  },
  dismissIconContainer: {
    position: 'absolute',
    flex: 1,
    top: VERTICAL_PADDING_DEFAULT * 2,
    right: HORIZONTAL_PADDING_DEFAULT,
    zIndex: 1000,
  },
  header: {
    height: 64,
    paddingHorizontal: HORIZONTAL_PADDING_DEFAULT,
    width: '100%',
  },
})
