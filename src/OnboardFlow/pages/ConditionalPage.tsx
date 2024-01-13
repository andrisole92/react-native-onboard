import React, { FC, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { TextStack } from '../components/TextStack'
import {
  COLOR_TEXT_DEFAULT,
  HORIZONTAL_PADDING_DEFAULT,
  VERTICAL_PADDING_DEFAULT,
} from '../constants'
import { OnboardPageConfigParams } from '../index'

export interface MultipleChoicePageProps {
  fields: MultipleChoiceField[]
  minChoices?: number
  maxChoices?: number
  onOptionsUpdated?: (options: MultipleChoiceField[]) => void
}

export interface MultipleChoiceField {
  id?: string
  title?: string
  subtitle?: string
  onUpdated?: (selected: boolean) => void
}

const multipleChoiceElement = 'multipleChoiceElement'

export const ConditionalPage: FC<OnboardPageConfigParams<MultipleChoicePageProps>> = ({
  style,
  titleStyle,
  subtitleStyle,
  textStyle,
  pageData,
  currentPage,
  totalPages,
  goToNextPage,
  goToPreviousPage,
  onSaveData,
  textAlign,
  width,
  props,
  pageIndex,
  primaryColor,
  secondaryColor,
  formElementTypes,
  canContinue,
  setCanContinue,
}) => {
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
        <ScrollView
          style={{ marginTop: VERTICAL_PADDING_DEFAULT }}
          contentContainerStyle={{ paddingBottom: 140 }}
        ></ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  optionTitle: {
    fontSize: 18,
    color: COLOR_TEXT_DEFAULT,
    width: '100%',
  },
  option: {
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    fontSize: 18,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
})
