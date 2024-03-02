import { ImageResult } from "expo-image-manipulator"
import React, { FC, useCallback, useEffect, useState } from "react"
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native"
import { FormEntryField, InputField } from "../../components/InputField"
import { TextStack } from "../../components/TextStack"
import { HORIZONTAL_PADDING_DEFAULT } from "../../constants"
import { OnboardPageConfigParams } from "../../index"
import { PageData } from "../../types"

export interface FormEntryPageProps {
  fields: FormEntryField[]
}

type FieldWrapperProps = {
  input: any
  index: any
  errorFieldIds: any
  setErrorFieldIds: any
  formData: any
  setFormData: any
  onSaveData: any
  pageData: PageData
  currentPage: any
  pageIndex: any
  formElementTypes: any
  primaryColor: string
  secondaryColor: string
  canContinue: boolean
  setCanContinue: (value: boolean) => void
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>
  totalPages: number
  style: any
  textStyle: any

  customVariables?: object
  maxTextHeight?: number
  setMaxTextHeight?: (height: number) => void
  deleteImage?: (string) => void
  getAssetsPublicUrl?: (string) => string
  uploadImageFunction?: (
    imageResult: ImageResult,
    imageExtension?: string,
    pathname?: string,
  ) => Promise<{ path: string }>
}

const FieldWrapper = ({
  input,
  index,
  errorFieldIds,
  setErrorFieldIds,
  formData,
  setFormData,
  onSaveData,
  pageData,
  currentPage,
  pageIndex,
  formElementTypes,
  primaryColor,
  secondaryColor,
  canContinue,
  setCanContinue,
  totalPages,
  style,
  textStyle,
  setScrollEnabled,
  deleteImage,
  ...rest
}: FieldWrapperProps) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (hasError) {
      const set = errorFieldIds
      set.add(input.id ?? index)
      setErrorFieldIds(new Set(set))
    } else {
      const set = errorFieldIds
      set.delete(input.id ?? index)
      setErrorFieldIds(new Set(set))
    }
  }, [hasError, index, input.id])

  const handleSaveData = useCallback(
    (data) => {
      formData[input.id ?? index + ""] = data
      setFormData(formData)
      onSaveData?.({
        source: pageData,
        data,
      })
    },
    [formData, index, input.id, onSaveData, pageData, setFormData],
  )

  const autoFocus = index == 0 && currentPage == pageIndex

  return (
    <View key={index}>
      {input.type && formElementTypes[input.type] ? (
        formElementTypes[input.type]({
          onSetText: (text: string) => {
            if (onSaveData) {
              onSaveData({
                source: pageData,
                data: {
                  id: input.id,
                  value: text,
                },
              })
            }
            if (input.onSetText) {
              input.onSetText(text)
            }
          },
          onSaveData: handleSaveData,
          label: input.label,
          placeHolder: input.placeHolder,
          type: input.type,
          getErrorMessage: input.getErrorMessage,
          isRequired: input.isRequired,
          prefill: input.prefill,
          id: input.id,
          initialValue: input.initialValue,
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          canContinue: canContinue,
          setCanContinue: setCanContinue,
          backgroundColor: style ? StyleSheet.flatten(style)?.backgroundColor : "#FFFFFF",
          hasError,
          setHasError,
          autoFocus: autoFocus,
          autoCapitalize: input?.autoCapitalize,
          currentPage: currentPage,
          totalPages: totalPages,
          pageIndex: pageIndex,
          props: input.props,
          setScrollEnabled,
          deleteImage,
          ...rest,
        })
      ) : (
        <InputField
          onSetText={(text: string) => {
            if (onSaveData) {
              onSaveData({
                source: pageData,
                data: {
                  id: input.id,
                  value: text,
                },
              })
            }
            if (input.onSetText) {
              input.onSetText(text)
            }
          }}
          initialValue={input?.initialValue}
          onSaveData={handleSaveData}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          textStyle={textStyle}
          canContinue={canContinue}
          setCanContinue={setCanContinue}
          hasError={hasError}
          setHasError={setHasError}
          backgroundColor={style ? StyleSheet.flatten(style)?.backgroundColor : "#FFFFFF"}
          autoFocus={autoFocus}
          currentPage={currentPage}
          pageIndex={pageIndex}
          totalPages={totalPages}
          setScrollEnabled={setScrollEnabled}
          {...input}
        />
      )}
    </View>
  )
}

export const FormEntryPage: FC<OnboardPageConfigParams<FormEntryPageProps>> = ({
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
        setCanContinue?.(false)
      } else {
        setCanContinue?.(true)
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
        <ScrollView scrollEnabled={scrollEnabled}>
          {props.fields?.map((input, index) => {
            return (
              <FieldWrapper
                setScrollEnabled={setScrollEnabled}
                key={input?.id}
                input={input}
                index={index}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                textStyle={textStyle}
                canContinue={canContinue}
                setCanContinue={setCanContinue}
                style={style}
                currentPage={currentPage}
                pageIndex={pageIndex}
                totalPages={totalPages}
                errorFieldIds={errorFieldIds}
                setErrorFieldIds={setErrorFieldIds}
                formData={formData}
                setFormData={setFormData}
                pageData={pageData}
                formElementTypes={formElementTypes}
                onSaveData={onSaveData}
                {...rest}
              />
            )
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
})
