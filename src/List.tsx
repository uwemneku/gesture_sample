import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { CONSTANTS } from "../constants";
import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface Props {
  offset: SharedValue<number>;
  index: number;
  color: string;
  text: string;
  maxIndexOfItems: number;
  hasGestureStarted: SharedValue<boolean>;
}
const List = ({
  offset,
  index,
  color,
  text,
  maxIndexOfItems,
  hasGestureStarted,
}: Props) => {
  const reversedIndex = maxIndexOfItems - index;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: hasGestureStarted.value
          ? interpolate(
              offset.value,
              [
                CONSTANTS.height * (reversedIndex - 1),
                CONSTANTS.height * reversedIndex,
                CONSTANTS.height * (reversedIndex + 1),
              ],
              [1, 1.2, 1],
              Extrapolate.CLAMP
            )
          : 1,
      },
    ],
  }));
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.avatar, { backgroundColor: color }]} />
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
};

export default List;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: CONSTANTS.padding,
    height: CONSTANTS.height,
  },
  avatar: {
    width: CONSTANTS.height - 25,
    height: CONSTANTS.height - 25,
    marginRight: 20,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "black",
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
