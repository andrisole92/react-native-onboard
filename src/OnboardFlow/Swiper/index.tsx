import React, { useCallback } from "react"
import {
  Dimensions,
  FlatList,
  FlatListProps,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native"
import PagerView, { PagerViewProps } from "react-native-pager-view"

import { SwiperFlatListProps, SwiperFlatListRefProps } from "./SwiperProps"

const MILLISECONDS = 1000
const FIRST_INDEX = 0
const ITEM_VISIBLE_PERCENT_THRESHOLD = 60

type T1 = any
type ScrollToIndex = { index: number; animated?: boolean }
type ScrollToIndexInternal = { useOnChangeIndex: boolean }

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window")

export const SwiperFlatList = React.forwardRef(
  (
    {
      vertical = false,
      children,
      data = [],
      renderItem,
      renderAll = false,
      index = FIRST_INDEX,
      // Autoplay
      autoplayDelay = 3,
      autoplay = false,
      autoplayLoop = false,
      autoplayLoopKeepAnimation = false,
      autoplayInvertDirection = false,
      // Functions
      onChangeIndex,
      onMomentumScrollEnd,
      onViewableItemsChanged,
      viewabilityConfig = {},
      disableGesture = false,
      e2eID,
      overScrollMode,
      scrollEnabled: scrollEnabledProp = true,
      ...props
    }: SwiperFlatListProps<T1>,
    ref: React.Ref<PagerView>,
  ) => {
    const { width } = useWindowDimensions()
    let _data: unknown[] = []
    let _renderItem: FlatListProps<any>["renderItem"]

    if (children) {
      // github.com/gusgard/react-native-swiper-flatlist/issues/40
      _data = Array.isArray(children) ? children : [children]
      _renderItem = ({ item }) => item
    } else if (data) {
      _data = data
      _renderItem = renderItem
    } else {
      console.error("Invalid props, `data` or `children` is required")
    }
    const size = _data.length
    // Items to render in the initial batch.
    const _initialNumToRender = renderAll ? size : 1
    const [currentIndex, setCurrentIndex] = React.useState(index)
    const [previousIndex, setPreviousIndex] = React.useState(index)

    const [ignoreOnMomentumScrollEnd, setIgnoreOnMomentumScrollEnd] = React.useState(false)
    const flatListElement = React.useRef<PagerView>(null)
    const [scrollEnabled, setScrollEnabled] = React.useState(!disableGesture)
    const [autoPlayDisturbed, setAutoPlayDisturbed] = React.useState(false)
    const [lastIndexChange, setLastIndexChange] = React.useState(-1)

    React.useEffect(() => {
      setScrollEnabled(!disableGesture)
    }, [disableGesture])

    const _onChangeIndex = React.useCallback(
      ({ index: _index, prevIndex: _prevIndex }: { index: number; prevIndex: number }) => {
        if (
          (_index !== _prevIndex && _index != lastIndexChange) ||
          (_index === 1 && _prevIndex && 1)
        ) {
          setLastIndexChange(_index)
          onChangeIndex?.({ index: _index, prevIndex: _prevIndex })
        }
      },
      [lastIndexChange, onChangeIndex],
    )

    const _scrollToIndex = useCallback(
      (params: ScrollToIndex, extra: ScrollToIndexInternal) => {
        const { index: indexToScroll, animated = true } = params
        const newParams = { animated, index: indexToScroll }

        setIgnoreOnMomentumScrollEnd(true)

        const next = {
          index: indexToScroll,
          prevIndex: previousIndex,
        }

        if (currentIndex !== next.index && previousIndex !== next.prevIndex) {
          setCurrentIndex(next.index)
          setPreviousIndex(next.prevIndex)
        } else if (currentIndex !== next.index) {
          setCurrentIndex(next.index)
        } else if (previousIndex !== next.prevIndex) {
          setPreviousIndex(next.prevIndex)
        }

        if (extra.useOnChangeIndex) {
          _onChangeIndex({ index: next.index, prevIndex: next.prevIndex })
        }

        // When execute "scrollToIndex", we ignore the method "onMomentumScrollEnd"
        // because it not working on Android
        // https://github.com/facebook/react-native/issues/21718
        flatListElement?.current?.scrollToIndex(newParams)
      },
      [_onChangeIndex, currentIndex, previousIndex],
    )

    // change the index when the user swipe the items
    React.useEffect(() => {
      if (scrollEnabled) {
        _onChangeIndex({ index: currentIndex, prevIndex: previousIndex })
      }
    }, [_onChangeIndex, currentIndex, previousIndex, scrollEnabled])

    // React.useImperativeHandle(ref, () => ({
    //   scrollToIndex: (item: ScrollToIndex) => {
    //     setScrollEnabled(true)
    //     _scrollToIndex(item, { useOnChangeIndex: true })
    //     setScrollEnabled(!disableGesture)
    //   },
    //   getCurrentIndex: () => currentIndex,
    //   getPrevIndex: () => previousIndex,
    //   goToLastIndex: () => {
    //     setScrollEnabled(true)
    //     _scrollToIndex({ index: size - 1 }, { useOnChangeIndex: false })
    //     setScrollEnabled(!disableGesture)
    //   },
    //   goToFirstIndex: () => {
    //     setScrollEnabled(true)
    //     _scrollToIndex({ index: FIRST_INDEX }, { useOnChangeIndex: false })
    //     setScrollEnabled(!disableGesture)
    //   },
    // }))

    React.useEffect(() => {
      const isLastIndexEnd = autoplayInvertDirection
        ? currentIndex === FIRST_INDEX
        : currentIndex === _data.length - 1
      const shouldContinuoWithAutoplay = autoplay && !isLastIndexEnd
      let autoplayTimer: ReturnType<typeof setTimeout>
      if (shouldContinuoWithAutoplay || autoplayLoop) {
        autoplayTimer = setTimeout(() => {
          if (autoPlayDisturbed) {
            return
          }

          if (_data.length < 1) {
            // avoid nextIndex being set to NaN
            return
          }

          if (!autoplay) {
            // disabled if autoplay is off
            return
          }

          const nextIncrement = autoplayInvertDirection ? -1 : +1

          let nextIndex = (currentIndex + nextIncrement) % _data.length
          if (autoplayInvertDirection && nextIndex < FIRST_INDEX) {
            nextIndex = _data.length - 1
          }

          // Disable end loop animation unless `autoplayLoopKeepAnimation` prop configured
          const animate = !isLastIndexEnd || autoplayLoopKeepAnimation

          _scrollToIndex({ index: nextIndex, animated: animate }, { useOnChangeIndex: true })
        }, autoplayDelay * MILLISECONDS)
      }
      // https://upmostly.com/tutorials/settimeout-in-react-components-using-hooks
      return () => clearTimeout(autoplayTimer)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoplay, currentIndex, _data.length])

    const keyExtractor: FlatListProps<unknown>["keyExtractor"] = useCallback(
      (_item, _index) => _index.toString(),
      [],
    )

    const onScrollToIndexFailed: FlatListProps<unknown>["onScrollToIndexFailed"] = useCallback(
      (info) =>
        setTimeout(() =>
          _scrollToIndex({ index: info.index, animated: false }, { useOnChangeIndex: true }),
        ),
      [_scrollToIndex],
    )

    const onMomentumScrollEndWrapper = useCallback(
      ({
        nativeEvent: {
          contentOffset: { x },
        },
      }) => {
        // if (ignoreOnMomentumScrollEnd) return

        const newIndex = width > 0 ? Math.ceil(x / width) : 0
        if (newIndex !== currentIndex) {
          setPreviousIndex(currentIndex)
          setCurrentIndex(newIndex)
        }
      },
      [currentIndex, width],
    )

    const flatListProps = {
      scrollEnabled: scrollEnabled && scrollEnabledProp,
      ref,
      keyExtractor,
      horizontal: !vertical,
      showsHorizontalScrollIndicator: false,
      showsVerticalScrollIndicator: false,
      pagingEnabled: true,
      overScrollMode,
      ...props,
      onScrollToIndexFailed: onScrollToIndexFailed,
      data: _data,
      renderItem: _renderItem,
      initialNumToRender: _initialNumToRender,
      initialScrollIndex: index, // used with onScrollToIndexFailed
      viewabilityConfig: {
        minimumViewTime: 200,
        itemVisiblePercentThreshold: ITEM_VISIBLE_PERCENT_THRESHOLD,
        ...viewabilityConfig,
      },
      onMomentumScrollEnd: onMomentumScrollEndWrapper,
      testID: e2eID,
    }

    if (Platform.OS === "web") {
      if (props.getItemLayout === undefined) {
        // NOTE: should we pass height/width for getItemLayout?
        const ITEM_DIMENSION = vertical ? HEIGHT : WIDTH
        flatListProps.getItemLayout = (__data, ItemIndex: number) => {
          return {
            length: ITEM_DIMENSION,
            offset: ITEM_DIMENSION * ItemIndex,
            index: ItemIndex,
          }
        }
      }

      ;(flatListProps as any).dataSet = { "paging-enabled-fix": true }
    }

    return (
      <React.Fragment>
        <PagerView
          {...flatListProps}
          style={{ backgroundColor: "red", flex: 1, width: "100%", height: "100%" }}
        />
      </React.Fragment>
    )
  },
)

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
})

// https://gist.github.com/Venryx/7cff24b17867da305fff12c6f8ef6f96
type Handle<T> = T extends React.ForwardRefExoticComponent<React.RefAttributes<infer T2>>
  ? T2
  : never
export type SwiperFlatList = Handle<typeof SwiperFlatList>
