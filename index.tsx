import React, { Component } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  ViewabilityConfig,
  ViewPagerAndroid,
  ViewPagerAndroidOnPageScrollEventData,
} from 'react-native';

export interface IScrollEvent {
  offset: number;
  index: number;
}

export interface IProps {
  data: Array<any>;
  renderItem: (item: any, index: number) => React.ReactNode;
  marginHorizontal: number;
  distanceBetweenItems: number;
  initialItemToRenderIndex?: number;
  onPageSelected?: (index: number) => void;
  onScroll?: (event: IScrollEvent) => void;
  onViewableItemsChanged?: (info: {
    viewableItems: Array<any>;
    changed: Array<any>;
  }) => void;
  viewabilityConfig?: ViewabilityConfig;
  animated?: boolean;
  timeBetweenScroll?: number;
}

const width = Dimensions.get('window').width;

export  class Pager extends Component<IProps> {
  scrollView: { current: null | FlatList };
  viewPager: { current: null | ViewPagerAndroid };

  initialItemToRenderIndex: number;

  lastContentOffsetX = 0;

  lastIndex = 0;
  maxIndex = 0;

  scrollingState = 'idle';
  scrollDirection: 'leftToRight' | 'rightToLeft';

  lastIndexWhenIdle = 0;

  onViewableItemsChanged: any;
  viewabilityConfig: any;

  constructor(props: IProps) {
    super(props);
    this.scrollView = React.createRef();
    this.viewPager = React.createRef();
    this.initialItemToRenderIndex = Math.min(
      this.props.initialItemToRenderIndex || 0,
      this.props.data.length - 1
    );
    this.lastContentOffsetX = this.indexToOffset(this.initialItemToRenderIndex);
    this.lastIndex = this.lastIndexWhenIdle = this.initialItemToRenderIndex;
    this.onViewableItemsChanged = props.onViewableItemsChanged;
    this.viewabilityConfig = props.viewabilityConfig;
    this.maxIndex = this.props.data.length - 1;
    this.scrollDirection = 'leftToRight';
  }

  _automaticScrolling = (): number => {
    let nextIndex = this.lastIndex;
    if (this.scrollDirection === 'leftToRight') {
      if (this.lastIndex < this.maxIndex) {
        nextIndex += 1;
      } else {
        this.scrollDirection = 'rightToLeft';
        nextIndex -= 1;
      }
    } else if (this.scrollDirection === 'rightToLeft') {
      if (this.lastIndex > 0) {
        nextIndex -= 1;
      } else {
        this.scrollDirection = 'leftToRight';
        nextIndex += 1;
      }
    }
    this.scrollToOffset(nextIndex);
    return nextIndex;
  };

  componentDidMount() {
    if (Platform.OS === 'ios') {
      this.iosInit();
    }
    if (this.props.animated) {
      const { timeBetweenScroll = 3000 } = this.props;
      setInterval(this._automaticScrolling, timeBetweenScroll);
    }
  }

  iosInit(): void {
    this.scrollToOffset(this.initialItemToRenderIndex);
  }

  scrollToOffset = (index: number) => {
    if (Platform.OS === 'ios') {
      if (this.scrollView.current) {
        this.scrollView.current.scrollToOffset({
          animated: true,
          offset: this.indexToOffset(index),
        });
      }
    }
    if (Platform.OS === 'android') {
      if (this.viewPager.current) {
        // OnPageSelected is not called when using setPage, so we assign manually the new index
        this.lastIndex = index;
        this.viewPager.current.setPage(index);
      }
    }
  };

  offsetToIndex = (offset: number): number =>
    Math.ceil(
      (offset + this.props.marginHorizontal) /
        (width - this.props.marginHorizontal * 2)
    );

  indexToOffset = (index: number): number =>
    -this.props.marginHorizontal +
    index * (width - this.props.marginHorizontal * 2);

  _onMomentumScrollEnd = (event: any) => {
    if (this.props.onPageSelected) {
      this.lastIndex = this.offsetToIndex(event.nativeEvent.contentOffset.x);
      this.props.onPageSelected(this.lastIndex);
    }
    this.lastContentOffsetX = event.nativeEvent.contentOffset.x;
  };

  _onFlatListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (this.props.onScroll) {
      const deltaX =
        event.nativeEvent.contentOffset.x - this.lastContentOffsetX;
      this.props.onScroll({
        index: this.lastIndex,
        offset: deltaX / this._itemWidth(),
      });
    }
  };

  renderIos = (): React.ReactNode => (
    <FlatList
      ref={this.scrollView}
      data={this.props.data}
      horizontal={true}
      decelerationRate={0}
      snapToInterval={width - 2 * this.props.marginHorizontal}
      snapToAlignment={'center'}
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={this._onMomentumScrollEnd}
      contentInset={{
        bottom: 0,
        left: this.props.marginHorizontal,
        right: this.props.marginHorizontal,
        top: 0,
      }}
      renderItem={this.renderIosItem}
      onViewableItemsChanged={this.onViewableItemsChanged}
      viewabilityConfig={this.viewabilityConfig}
      onScroll={this._onFlatListScroll}
    />
  );

  renderIosItem = ({ index }: { index: number }) => {
    return (
      <View
        key={index}
        style={{
          marginHorizontal: this.props.distanceBetweenItems / 2,
          width: this._itemWidth(),
        }}
      >
        {this.props.renderItem(this.props.data[index], index)}
      </View>
    );
  };

  _itemWidth = () =>
    width - (2 * this.props.marginHorizontal + this.props.distanceBetweenItems);

  _onPageSelected = (event: any) => {
    this.lastIndex = event.nativeEvent.position;
    if (this.props.onPageSelected) {
      this.props.onPageSelected(event.nativeEvent.position);
    }
  };

  _onPageScroll = (
    event: NativeSyntheticEvent<ViewPagerAndroidOnPageScrollEventData>
  ) => {
    if (this.props.onScroll) {
      const dragRight =
        this.lastIndexWhenIdle - 1 === event.nativeEvent.position;
      // Last event emitted is falsy`
      if (event.nativeEvent.position === this.lastIndexWhenIdle + 1) {
        return;
      }
      this.props.onScroll({
        index: this.lastIndexWhenIdle,
        offset: dragRight
          ? -(1 - Math.max(0, event.nativeEvent.offset))
          : event.nativeEvent.offset,
      });
    }
  };

  _onPageScrollStateChanged = (state: any) => {
    this.scrollingState = state;
    if (state === 'idle') {
      this.lastIndexWhenIdle = this.lastIndex;
    }
  };

  renderAndroid = (): React.ReactNode => {
    const { data } = this.props;

    const pageMargin = -(
      this.props.marginHorizontal * 2 -
      this.props.distanceBetweenItems
    );

    return (
      <ViewPagerAndroid
        ref={this.viewPager}
        pageMargin={pageMargin}
        style={styles.viewPager}
        initialPage={this.initialItemToRenderIndex}
        onPageSelected={this._onPageSelected}
        onPageScroll={this._onPageScroll}
        onPageScrollStateChanged={this._onPageScrollStateChanged}
      >
        {data.map((propsData, index) =>
          this.renderAndroidItem(propsData, index)
        )}
      </ViewPagerAndroid>
    );
  };

  renderAndroidItem = (data: any, index: number) => (
    <View key={index} style={styles.outer}>
      <View
        style={[
          styles.item,
          { paddingHorizontal: this.props.marginHorizontal },
        ]}
      >
        {this.props.renderItem(data, index)}
      </View>
    </View>
  );

  render = (): React.ReactNode =>
    Platform.OS === 'ios' ? this.renderIos() : this.renderAndroid();
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
  },
  outer: {
    flex: 1,
  },
  viewPager: {
    flex: 1,
  },
});
