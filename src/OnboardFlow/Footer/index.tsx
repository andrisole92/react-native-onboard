import React, { FC, useMemo } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { PRIMARY_BUTTON_TEXT_DEFAULT, PRIMARY_BUTTON_TEXT_LAST_PAGE_DEFAULT } from "../constants"
import { OnboardComponents } from "../index"
import { PageData } from "../types"

export interface FooterProps {
  style?: StyleProp<ViewStyle> | undefined
  Components: OnboardComponents
  paginationSelectedColor?: string
  paginationColor?: string
  currentPage: number
  goToNextPage: () => void
  goToPreviousPage: () => void
  pages?: PageData[]
  canContinue?: boolean
  setCanContinue?: (value: boolean) => void
  showFooter?: boolean
  showHeader?: boolean
  primaryButtonStyle?: StyleProp<ViewStyle>
  primaryButtonTextStyle?: StyleProp<TextStyle>
  props?: any
}

export const Footer: FC<FooterProps> = ({
  style,
  Components,
  paginationSelectedColor,
  paginationColor,
  currentPage,
  goToNextPage,
  pages,
  canContinue,
  setCanContinue,
  showFooter = true,
  primaryButtonStyle,
  primaryButtonTextStyle,
  ...props
}) => {
  const isConditional = useMemo(() => pages?.[currentPage]?.isConditional, [currentPage, pages])
  function getPrimaryButtonTitle() {
    if (pages && pages[currentPage] && pages[currentPage].primaryButtonTitle) {
      return pages[currentPage].primaryButtonTitle
    }
    return pages?.length - 1 === currentPage
      ? PRIMARY_BUTTON_TEXT_LAST_PAGE_DEFAULT
      : PRIMARY_BUTTON_TEXT_DEFAULT
  }

  const totalPages = pages?.length ?? 0

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "position" : "height"}
      style={[style]}
      {...props}
    >
      <Components.PaginationComponent
        paginationColor={paginationColor}
        paginationSelectedColor={paginationSelectedColor}
        currentPage={currentPage}
        totalPages={totalPages}
      />
      <View style={{ display: "flex", flexDirection: "row", width: "100%" }}>
        {isConditional ? (
          <>
            <Components.SecondaryButtonComponent
              text={"No"}
              currentPage={currentPage}
              totalPages={totalPages}
              disabled={!canContinue}
              style={{
                marginBottom: 0,
                width: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={goToNextPage}
            />
            <Components.PrimaryButtonComponent
              text={"Yes"}
              currentPage={currentPage}
              totalPages={totalPages}
              goToNextPage={goToNextPage}
              disabled={!canContinue}
              style={{ ...primaryButtonStyle, width: "50%" }}
              textStyle={primaryButtonTextStyle}
            />
          </>
        ) : (
          <Components.PrimaryButtonComponent
            text={getPrimaryButtonTitle()}
            currentPage={currentPage}
            totalPages={totalPages}
            goToNextPage={goToNextPage}
            disabled={!canContinue}
            style={primaryButtonStyle}
            textStyle={primaryButtonTextStyle}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  )
}
