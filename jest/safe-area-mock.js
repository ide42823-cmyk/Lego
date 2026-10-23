/* eslint-env jest */
const { View } = require('react-native');

// Everything the app touches from `react-native-safe-area-context` resolves
// synchronously here. The real provider measures the window on layout, and
// under the Jest web renderer that measurement never lands, so children of a
// real `SafeAreaProvider` (including Modal subtrees) never mount. Unit tests
// render against flat zero insets instead — geometry is not the unit under
// test; the layout logic consumers attach to the insets is.
const zeroInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const zeroFrame = { x: 0, y: 0, width: 0, height: 0 };

module.exports = {
  SafeAreaProvider: ({ children }) => children ?? null,
  SafeAreaConsumer: ({ children }) => children({ insets: zeroInsets, frame: zeroFrame }),
  SafeAreaView: View,
  SafeAreaFrameContext: { _currentValue: zeroFrame },
  SafeAreaInsetsContext: { _currentValue: zeroInsets },
  useSafeAreaInsets: () => zeroInsets,
  useSafeAreaFrame: () => zeroFrame,
  useSafeArea: () => zeroInsets,
  initialWindowMetrics: { frame: zeroFrame, insets: zeroInsets },
};
