import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CONSTANTS } from "../constants";
import List from "./List";
import "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const listData = new Array(5).fill(0);
const maxHeight = 4 * CONSTANTS.height + 10;

export default function Card() {
  const Offset = useSharedValue(0);
  const ctx = useSharedValue(0);
  const start = useSharedValue(0);
  const scaleY = useSharedValue(1);
  const timeoutRef = useSharedValue<NodeJS.Timeout | null>(null);

  const scaleX = useDerivedValue(() => {
    return interpolate(scaleY.value, [1, 1.15], [1, 0.95], Extrapolate.CLAMP);
  }, [scaleY]);

  const translateY = useDerivedValue(() => {
    const isDown = 10 > Math.abs(Offset.value);
    return interpolate(
      scaleY.value,
      [1, 1.15],
      [0, isDown ? 50 : -50],
      Extrapolate.CLAMP
    );
  }, [scaleY]);

  const scheduleActivation = () => {
    timeoutRef.value = setTimeout(() => {
      if (start.value == 0) start.value = withTiming(1);
    }, 150);
  };

  const reset = () => {
    start.value = withTiming(0);
    Offset.value = withTiming(0);
    scaleY.value = withTiming(1);
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(scheduleActivation)();
      ctx.value = Offset.value;
      console.log(Offset.value);
    })
    .onUpdate((e) => {
      const newTranslationValue = ctx.value + e.translationY;
      const isBelowTopLimit = maxHeight > Math.abs(newTranslationValue);
      const isAboveBottomLimit = 10 > newTranslationValue;
      if (start.value === 1) {
        if (isBelowTopLimit && isAboveBottomLimit) {
          console.log(newTranslationValue);
          Offset.value = ctx.value + -e.translationY;
          scaleY.value = 1;
        }

        if (maxHeight < Math.abs(newTranslationValue)) {
          scaleY.value = interpolate(
            Math.abs(newTranslationValue) - maxHeight,
            [0, 300],
            [1, 1.15],
            Extrapolate.CLAMP
          );
        }
        if (10 < newTranslationValue) {
          scaleY.value = interpolate(
            Math.abs(newTranslationValue) - 10,
            [0, 300],
            [1, 1.15],
            Extrapolate.CLAMP
          );
        }
      }
    })
    .onEnd(() => {})
    .onFinalize(() => {
      runOnJS(clearTimeout)(timeoutRef.value);
      runOnJS(reset)();
    });

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -Offset.value }, { scaleX: 1.15 }],
  }));
  const gestureContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(start.value, [0, 1], [0.2, 1]) },
      { translateY: translateY.value },
      { scaleY: scaleY.value },
      { scaleX: scaleX.value },
    ],
    opacity: interpolate(start.value, [0, 1], [0, 1]),
  }));

  const animatedButtonText = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scaleY.value, [1, 1.05], [1, 0], Extrapolate.CLAMP),
      },
    ],
  }));

  return (
    <LinearGradient
      colors={["#efb7ad", "#e867a2", "#8f91e5"]}
      style={styles.container}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ width: "70%" }}>
          <Animated.View style={[styles.card, gestureContainerStyle]}>
            <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
            {listData.map((_, i) => (
              <List index={i} key={i} offset={Offset} />
            ))}
          </Animated.View>
          <Animated.View style={[styles.longPress, animatedButtonText]} />
        </Animated.View>
      </GestureDetector>
      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 1)",
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255, 0.5)",
    position: "relative",
  },
  indicator: {
    borderRadius: 10,
    position: "absolute",
    width: "100%",
    height: CONSTANTS.height,
    backgroundColor: "white",
    bottom: 0,
  },
  longPress: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "white",
    alignSelf: "center",
    marginTop: 20,
  },
});
