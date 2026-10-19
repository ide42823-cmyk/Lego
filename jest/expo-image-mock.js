/**
 * `expo-image` in a plain Jest environment is native module glue: it kicks off
 * asynchronous work that lands outside React's `act()` window and leaks between
 * tests. The app renders images through it for caching and `contentFit`, but
 * nothing in the unit tests asserts on image internals — they assert on the
 * accessible names and text the images sit behind — so the mock swaps in React
 * Native's own `Image`, which mounts synchronously and accepts the same
 * `source` shapes (`{ uri }` and bundled asset ids).
 */
module.exports = {
  Image: require('react-native').Image,
};
