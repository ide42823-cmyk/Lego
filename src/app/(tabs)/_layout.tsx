import AppTabs from '@/components/app-tabs';

/**
 * Tab group. Kept separate from the root layout so that non-tab routes (such as
 * `dev/rtc-spike`) can be pushed onto a stack above the tab bar.
 */
export default function TabsLayout() {
  return <AppTabs />;
}
