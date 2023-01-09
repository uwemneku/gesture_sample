import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CONSTANTS, data } from "../constants";
import List from "./List";
import "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const margin = 8;
const maxHeight = (data.length - 1) * CONSTANTS.height + margin;
const CARD_scaleY_Range = [1, 1.15];
const CARD_scaleX_Range = [1, 0.95];

export default function Card() {
  const Offset = useSharedValue(0); // highlight offset
  const start = useSharedValue(0); // animated value to mount the card
  const ctx = useSharedValue(0); // used to share a context value between gesture state
  const hasGestureStarted = useSharedValue(false);

  const scaleY = useSharedValue(1);
  const timeoutRef = useSharedValue<NodeJS.Timeout | null>(null);

  const scheduleCardAnimation = (t: number) => {
    // a ref value wasn't used to store the timeout because when updated in the JS thread, it is not reflected in the UI thread
    timeoutRef.value = setTimeout(() => {
      if (start.value == 0) start.value = withSpring(1, { mass: 0.67 });
    }, t);
  };

  // reset animation values
  const reset = () => {
    start.value = withSpring(0);
    Offset.value = withTiming(0);
    scaleY.value = withTiming(1);
    hasGestureStarted.value = false;
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(scheduleCardAnimation)(150); // schedule the card to animate in
      ctx.value = Offset.value;
    })
    .onUpdate((e) => {
      const newTranslationValue = ctx.value + e.translationY;
      const isIndicatorBelowTopLimit =
        maxHeight > Math.abs(newTranslationValue); // indicator is below the top of the card container
      const isIndicatorAboveBottomLimit = 10 > newTranslationValue; // indicator is above the top of the card container

      // only allowed gesture animations when the card is completely visible
      if (start.value === 1) {
        hasGestureStarted.value = true;
        if (isIndicatorBelowTopLimit && isIndicatorAboveBottomLimit) {
          Offset.value = ctx.value + -e.translationY;
          scaleY.value = 1;
        }

        // stretch the card when gesture is still active but the indicator is at the top or bottom of the card
        if (!isIndicatorBelowTopLimit || !isIndicatorAboveBottomLimit) {
          const diff = !isIndicatorBelowTopLimit ? maxHeight : margin;
          const interpolatedValue = Math.abs(newTranslationValue) - diff; // additional translation after top/bottom limit
          scaleY.value = interpolate(
            interpolatedValue,
            [0, 300],
            CARD_scaleY_Range,
            Extrapolate.CLAMP
          );
        }
      }
    })
    .onFinalize(() => {
      runOnJS(clearTimeout)(timeoutRef.value); // if user stops gesture before the card is animated in, clear timeout
      runOnJS(reset)();
    });

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -Offset.value }, // the negative value makes it to move in the same direction as the gesture
      { scaleX: 1.15 },
    ],
    opacity: hasGestureStarted.value ? 1 : 0,
  }));
  const animatedGestureContainerStyle = useAnimatedStyle(() => {
    const indicatorIsDown = 10 > Math.abs(Offset.value); //the indicator is close to the bottom of the card
    return {
      transform: [
        { scale: interpolate(start.value, [0, 1], [0.4, 1]) },
        {
          translateY: interpolate(
            scaleY.value,
            CARD_scaleY_Range,
            [0, indicatorIsDown ? 50 : -50],
            Extrapolate.CLAMP
          ),
        },
        { scaleY: scaleY.value },
        {
          scaleX: interpolate(
            scaleY.value,
            CARD_scaleY_Range,
            CARD_scaleX_Range,
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(start.value, [0, 1], [0, 1]),
    };
  });

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
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 1 }}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ width: "75%" }}>
          <Animated.View style={[styles.card, animatedGestureContainerStyle]}>
            <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
            {data.map((_, i) => (
              <List
                color={_.color}
                text={_.text}
                maxIndexOfItems={data.length - 1}
                index={i}
                key={i}
                offset={Offset}
                hasGestureStarted={hasGestureStarted}
              />
            ))}
          </Animated.View>
          <Animated.View style={[styles.button, animatedButtonText]} />
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
  button: {
    width: 50,
    height: 50,
    borderRadius: 50,
    elevation: 1,
    backgroundColor: "white",
    alignSelf: "center",
    marginTop: 20,
  },
});
