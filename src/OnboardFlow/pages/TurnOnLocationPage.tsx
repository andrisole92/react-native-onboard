import React, { FC, useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { FormEntryField, InputField } from '../components/InputField'
import { TextStack } from '../components/TextStack'
import { HORIZONTAL_PADDING_DEFAULT } from '../constants'
import { OnboardPageConfigParams } from '../index'
import { PageData } from '../types'

export interface FormEntryPageProps {
  fields: FormEntryField[]
}

export const TurnOnLocationPage: FC<OnboardPageConfigParams<FormEntryPageProps>> = ({
  style,
  titleStyle,
  subtitleStyle,
  textStyle,
  pageData,
  formElementTypes,
  currentPage,
  totalPages,
  goToNextPage,
  goToPreviousPage,
  onSaveData,
  textAlign,
  width,
  primaryColor,
  secondaryColor,
  props,
  canContinue,
  setCanContinue,
  pageIndex,
  setScrollEnabled,
  scrollEnabled,
  ...rest
}) => {
  const [errorFieldIds, setErrorFieldIds] = useState(new Set())
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (currentPage == pageIndex) {
      if (errorFieldIds.size > 0) {
        setCanContinue(false)
      } else {
        setCanContinue(true)
      }
    }
  }, [errorFieldIds, currentPage, pageIndex, setCanContinue])

  return (
    <View
      style={[
        styles.container,
        {
          width: width,
          paddingHorizontal: HORIZONTAL_PADDING_DEFAULT,
        },
        style,
      ]}
    >
      <KeyboardAvoidingView>
        <TextStack
          title={pageData?.title}
          subtitle={pageData?.subtitle}
          textStyle={textStyle}
          textAlign={textAlign}
          titleStyle={titleStyle}
          subtitleStyle={subtitleStyle}
        />
        <ScrollView scrollEnabled={scrollEnabled}></ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
})
