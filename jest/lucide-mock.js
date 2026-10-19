/**
 * Test stand-in for `lucide-react-native`.
 *
 * Lucide ships ESM, and its CommonJS build is ~400 kB, so transforming it on
 * every test run costs more than the icons are worth to a unit test. Component
 * tests assert structure, copy and accessible names — never SVG path data — so
 * the icons resolve to an inert view that still forwards props, which keeps
 * `accessibilityLabel` assertions working.
 *
 * Importing a name that Lucide does not export is caught twice without this
 * file doing anything: TypeScript checks `ICONS` in `src/components/ui/icon.tsx`
 * against the real types, and the production bundle uses the real library.
 */
const React = require('react');
const { View } = require('react-native');

function IconStub(props) {
  return React.createElement(View, props);
}

module.exports = new Proxy(
  {},
  {
    get: (_target, key) => (key === '__esModule' ? true : IconStub),
  },
);
