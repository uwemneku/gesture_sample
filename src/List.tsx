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
}
const List = ({ offset, index: i }: Props) => {
  const index = 4 - i;
  console.log(i, index, CONSTANTS.height * index);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          offset.value,
          [
            CONSTANTS.height * (index - 1),
            CONSTANTS.height * index,
            CONSTANTS.height * (index + 1),
          ],
          [1, 1.2, 1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.avatar} />
      <Text style={styles.text}>List</Text>
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
    width: 40,
    height: 40,
    marginRight: 30,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "black",
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
