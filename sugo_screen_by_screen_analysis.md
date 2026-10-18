# SUGO-Inspired Mobile App — Screen-by-Screen Reference Analysis

## Report purpose

This document analyzes the 100 screenshots supplied in `WhatsApp Unknown 2026-10-18 at 14.51.18.zip` as design references for an original social / voice-room mobile app built with React Native. It is intended to support product discovery, screen architecture, reusable UI design, and implementation planning—not to reproduce SUGO branding or assets verbatim.

## Source and confidence notes

- **Screens reviewed:** 100 JPEG images.
- **Image size:** 720 × 1600 pixels each (portrait, 9:20 aspect ratio).
- **Ordering:** screen IDs follow the captured timestamp and numbered suffix ordering, with the original filename recorded under each entry.
- **Evidence standard:** descriptions focus on visible UI. Behaviors not directly demonstrated by a still screenshot are marked as likely/inferred. Some small labels are hard to read in the montage; where the exact label or tier is uncertain, the report says so rather than asserting a transcription.
- **Implementation intent:** React Native notes recommend component boundaries and state handling. They are proposed implementation choices, not claims about SUGO’s internal technology.

## Executive summary

The archive is not a single linear onboarding flow. It covers several connected product areas:

1. **Live voice rooms and virtual gifting** — persistent ten-seat room canvas, room metadata, chat overlay, gift categories, room tools, interactive gifts, Lucky/jackpot merchandising and exit actions.
2. **Profiles and relationships** — public profile tabs (Profile, Honor, Moments, Relationships), personal tags/information, couple/friend invitation cards, guardian state, and relationship intimacy tasks.
3. **Membership and status progression** — Aristocracy rank ladder plus VIP/SVIP levels, benefits grids, progress indicators, gated perks, recharge/activation CTAs, and premium catalog items.
4. **Store and inventory** — wallet exchange, backpack empty state, catalog categories for frames, vehicles, tokens, room backgrounds, bullet comments and fragments.
5. **Social and messaging** — inbox, contacts, message threads, conversation context menu, system notices, room invitations and family discovery.
6. **Room discovery and social feeds** — recommended/new/joined/global room lists, video-style discovery cards, Moments posts, and people discovery by recommendation/newness/proximity/featured state.
7. **Utility surfaces** — tasks, visitors (VIP-gated), settings, wealth/charm levels, event center and the Me dashboard.

A core design pattern is the use of **persistent screen shells with changing content state**: one live-room screen is reused across gift categories; one store shell is reused across product filters; one membership template is reused across tiers; and one discovery list is reused across recommendation modes. That pattern should be reflected in the React Native architecture rather than implementing every screenshot as an isolated page.

## High-level navigation model inferred from the screens

The five primary bottom-navigation destinations visible in the archive are **Home**, **Moments**, **Rooms**, **Messages**, and **Me**. Secondary destinations include public profiles, room detail/live room, family directory, membership hubs, Store, Backpack, Tasks, Visitors, My Level, Settings, and Event Center. Many secondary pages use a back header; modal sheets are used for contextual choices and actions.

Likely user journeys represented by this sample:

- Discover a room → inspect Room Details → join a live room → browse gifts/tools → send a gift or open a game → exit/keep the room.
- Open a user profile → review tabs and Moments → send a greeting or message → form a Friend/Couple relationship → track intimacy tasks.
- Visit Me → recharge or enter VIP/SVIP/Aristocracy → compare tiers and privileges → activate/upgrade → access premium assets in Store.
- Open Messages → filter inbox/contacts → read a direct conversation or system notice → use media, gift, call, or context-menu actions.
- Open Rooms → switch among Recommend/Video/New/Me or Global views → enter a room.
- Open Home/people discovery → browse Recommend/Nearby/New users/Featured → open a profile or tap HI.

## Cross-screen visual system

### Color and surface treatment

- **Light social surfaces:** white backgrounds, soft lavender/pink accents, rounded cards, grey supporting text, purple Join/Accept buttons, and pink greeting/intimacy controls.
- **Live room:** full-bleed illustrated/photo background, translucent overlays, circular seat controls, dark navy/black gift panel, purple selection borders, gold coin icons, and high-saturation promotional banners.
- **Premium/membership:** black or dark geometric backdrops with gold, red, green, or jewel-like rank emblems; a mix of ornate imagery and compact privilege grids.
- **Store:** purple-black gradient, square dark product cards, bright product artwork, price/duration labels and sticky balance/recharge controls.
- **Actions:** wide pill-shaped primary CTAs; small circular icon controls; subtle active-tab underlines; red notification dots/badges for unread/new content.

### Reusable component candidates

- `AppBottomTabs`, `ScreenHeader`, `BackHeader`, `SegmentedTabs`, `FilterChips`
- `Avatar`, `ProfileIdentity`, `BadgePill`, `StatusTag`, `InfoRow`, `ProfileTagCloud`
- `RoomCanvas`, `SeatGrid`, `RoomChatOverlay`, `RoomComposer`, `RoomDetailsSheet`, `GiftPanel`, `GiftCategoryTabs`, `GiftCard`, `QuantityStepper`
- `MembershipTierHeader`, `TierSelector`, `PrivilegeGrid`, `PrivilegeTile`, `RechargeButton`, `ActivationSheet`
- `StoreCategoryBar`, `StoreFilterChips`, `StoreProductCard`, `WalletBalanceBar`, `InventoryGrid`, `EmptyState`
- `ConversationRow`, `ContactRow`, `MessageBubble`, `SystemNoticeCard`, `MomentCard`, `RoomDiscoveryCard`, `UserDiscoveryRow`, `FamilyCard`, `TaskRow`
- `BottomSheet`, `ConfirmDialog`, `ActionSheet`, `LoadingSkeleton`, `ErrorState`, `EmptyState`

### Functional requirements to keep separate from visual implementation

- Coin/diamond balances, activation fees, tier entitlements, gift eligibility, randomized Lucky outcomes, intimacy progress, and paid actions must be validated by a backend. A screenshot shows presentation, not the transaction rules.
- Real-time voice/chat state should not rerender the whole page. Separate room state, seats, chat, gift sheet and animations.
- Gift, product, room and user lists are data-backed; use stable IDs and pagination/virtualization instead of embedding assets in screen code.
- Relationship and invitation flows are two-sided. Model pending, accepted, rejected and expired states explicitly.
- Support Arabic and mixed right-to-left / Latin text. Layouts with usernames, badges and tags need to tolerate unpredictable content lengths.
- Provide safe-area support, keyboard-aware chat composers, loading/error/empty states, and accessible labels for icon-only buttons.

---

## Screen-by-screen analysis

### 001. Profile overview — Profile tab

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.50.jpeg`

**Visible structure and purpose:** A member profile for Rajae is shown over a large photographic cover. The header pairs back/navigation and share-like controls with an avatar, display name, ID, and decorative status/level badges. A four-tab strip separates Profile, Honor, Moment(s), and Relationships. The body uses a 'Her room' tile, 'Her family' tile, profile-tag chips, and a structured Information section; call/message-style circular actions lead into a wide pink 'Say hi' CTA.

**Interaction and state clues:** The persistent bottom action area suggests visiting users can initiate contact without scrolling back to the top. Tabs switch profile subpages; the room/family tiles likely deep-link to those entities. The tags and personal fields are read-only metadata.

**React Native implementation notes:** Build as a scrollable ProfileScreen with a cover/header overlay, reusable profile summary, horizontal tab bar, tag chips, info rows, and safe-area-aware sticky CTA. Load cover/avatar independently and preserve image aspect ratios.

### 002. Voice-room exit/keep overlay

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.50 (1).jpeg`

**Visible structure and purpose:** A live voice room is dimmed beneath a centered two-choice overlay: a green circular 'Keep' control above a red power/exit control. The room art and seat grid remain visible behind the dim layer, making this a decision overlay rather than a page replacement.

**Interaction and state clues:** The contrast and icon-only buttons signal a reversible keep/stay action and a destructive leave action. The overlay probably closes after selection or after tapping outside, but that latter behavior is not proven by the still image.

**React Native implementation notes:** Use a transparent Modal/portal above the room screen with a dark scrim, two large accessible actions, and an explicit leave confirmation path. Keep the underlying room mounted so audio and seat state do not reset while the overlay is open.

### 003. Room Details bottom sheet

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.50 (2).jpeg`

**Visible structure and purpose:** A white rounded-top sheet titled 'Room Details' sits over the live room. It contains the room owner's avatar/name/ID and level, a Room Achievements row with medal-style metrics, a compact row of member avatars, and a Room Info row. A footer groups share/favorite-like circular controls with a large Join button.

**Interaction and state clues:** This exposes room metadata before entering. Each row looks navigable to a deeper achievement/member/info view; the footer offers actions without hiding the source room entirely.

**React Native implementation notes:** Implement as a bottom sheet with snap points and scrollable body. Use data-driven rows and avatar stacks, keep the Join CTA anchored above the device inset, and expose modal semantics for screen readers.

### 004. Room gift picker — Members category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.50 (3).jpeg`

**Visible structure and purpose:** The upper half is a ten-seat voice-room canvas over a full-bleed room background. Each seat has a plus/lock affordance, seat number, and small contribution counter. Below, a dark bottom sheet contains room-upgrade progress, the 'No one else on the seat' empty message, gift-category tabs, and a four-column gift grid; 'Members' is selected and member-themed gifts show level gates and coin prices.

**Interaction and state clues:** A selected gift card receives a colored outline; tapping a gift and adjusting the quantity/send control are the implied primary flow. Room and gift catalog remain visible together.

**React Native implementation notes:** Model this as one persistent RoomScreen plus a resizable GiftPanel. Make category tabs horizontal-scrollable, gift cards virtualized, selected state explicit, and send disabled when the selected gift or balance does not satisfy constraints.

### 005. Room gift picker — Customized gifts

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.50 (4).jpeg`

**Visible structure and purpose:** The same room-plus-gift-panel composition is shown with 'Customized' selected. The gift grid emphasizes personalized frames/avatars/names, several 'NEW' badges, and coin prices. A large event/countdown strip appears between the seat canvas and gift categories; the seat and room banners continue to animate independently.

**Interaction and state clues:** This is a catalog-filter state, not a new page. The visible custom gifts suggest the recipient or member label is part of the asset; the selected card is outlined and the quantity/send footer persists.

**React Native implementation notes:** Reuse the GiftPanel and switch only catalog data and the selected category. Store customized gift assets as remote thumbnails with stable IDs; do not use hardcoded index-based selection.

### 006. Room gift picker — Countries category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51.jpeg`

**Visible structure and purpose:** The same room screen is paired with the 'Countries' gift category. The grid uses scenic country/place images and a consistent coin price; the first tile is selected. Seat layout, room owner, participant count, room-level progress, and a send footer remain unchanged.

**Interaction and state clues:** Country gifts behave like purchasable catalog items. The selected category and selected item are separate states and should survive scrolling within the gift panel.

**React Native implementation notes:** Represent these as localized catalog entries with image, label, price, and eligibility. Use a four-column FlatList with tuned row heights and avoid loading all large gift assets at once.

### 007. Room gift picker — Interactive gifts

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (1).jpeg`

**Visible structure and purpose:** The room is visible behind a dark catalog panel with 'Interactive' highlighted. A vivid purple horizontal banner advertises a video/interactive gift experience; the gift grid mixes large interactive animations with partner/couple/friend badges and prices.

**Interaction and state clues:** The banner is a promotion/deep link, while gift tiles are selectable items. The live room overlay means any interactive gift animation should appear in the room after sending, not replace the catalog page.

**React Native implementation notes:** Separate catalog selection from playback: select/confirm gift, emit a send event to the room service, then render an animation overlay for participants. Make animation assets lazy-loaded and support reduced-motion preferences.

### 008. Room gift picker — Tokens category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (2).jpeg`

**Visible structure and purpose:** The Tokens tab is selected and a prominent pink banner explains a limited-duration intimacy benefit for a couple. The grid displays jewelry-like token assets, NEW/Couple/Friend labels, and high coin values. The currently selected item has a purple border; the seat canvas and purchase/send controls remain visible.

**Interaction and state clues:** The banner indicates some token gifts are relationship-restricted. The UI also communicates item duration/value before sending, so eligibility and validity must be shown before confirmation.

**React Native implementation notes:** Add product metadata for audience/relationship eligibility, duration, and value. The Send handler should validate recipient relationship, coin balance, and quantity server-side, and show a clear rejection message if invalid.

### 009. Room gift picker — Privilege category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (3).jpeg`

**Visible structure and purpose:** A dark room gift sheet has 'Privilege' selected. A small room-upgrade progress bar remains visible above the catalog. Gift art is gold-toned and branded with VIP-tier tags such as VIP6, VIP7, and higher; item names and coin prices are shown beneath each illustration.

**Interaction and state clues:** The catalog appears to sell status-linked gifts. VIP labels act as eligibility/product metadata, while the selected outlined tile previews which gift will be sent.

**React Native implementation notes:** Use the same GiftCard primitive as other categories and show tier labels as compact badges. Keep gift price and action controls visually distinct from promotional banners.

### 010. Room gift picker — Event category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (4).jpeg`

**Visible structure and purpose:** The Event tab is active. A wide illustrated event banner occupies the space under the seat grid, followed by the gift catalog with NEW labels and themed items such as cosmic/event rewards. The same room seats, tabs, selected tile, Offer entry, Aristocracy shortcut, quantity stepper, and Send button are preserved.

**Interaction and state clues:** The banner may route to an event landing page. Event catalog data should be refreshed independently of the live room session, and limited-time items may have availability/expiry states.

**React Native implementation notes:** Drive event banners and gift listings from remote configuration. Preserve panel scroll position on tab change only if the product behavior calls for it; use skeleton placeholders for image loading.

### 011. Room gift picker — Lucky / jackpot category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (5).jpeg`

**Visible structure and purpose:** A 'Lucky' category is selected. Above the standard dark gift catalog is a large orange-gold Lucky panel with a jackpot total and multiplier choices, and beneath it are small lucky gifts such as stars, bells, clover, and pearl. The selected item is outlined, and the quantity/send controls are still anchored at the bottom.

**Interaction and state clues:** This state combines a chance-based promotional surface with normal gifting. The multiplier choices should be treated as distinct selections, and the jackpot total is dynamic data rather than static artwork.

**React Native implementation notes:** Implement odds/reward rules only in the backend and expose transparent confirmation text before any paid randomized action. Animate the jackpot as a visual layer without blocking core accessibility controls.

### 012. Room gift picker — General gifts

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (6).jpeg`

**Visible structure and purpose:** The standard Gift category is open, with everyday gift items such as lipstick, a small orb, a helmet, a bag, a feather, and stickers. Event and Lucky tabs show notification dots, suggesting new or active content. The first tile is selected; the bottom bar retains Offer, Aristocracy, quantity, and Send.

**Interaction and state clues:** This is the baseline catalog state, useful as the reference for tab geometry and gift-card behavior. Notification dots should clear only after the underlying event is viewed, not merely on app launch.

**React Native implementation notes:** Define one catalog schema for everyday, event, token, country, and privilege items, with category-specific rendering only where necessary. Use a stable shared GiftPanel to avoid duplicating layout code.

### 013. Room utility drawer

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (7).jpeg`

**Visible structure and purpose:** A translucent black overlay exposes a vertical set of tool groups over the room: interactive games, basic tools (sharing/audio/mute/beauty), and special-effect or room utilities. Each action is represented by a circular or square icon and a short label; the dimmed room and bottom navigation remain underneath.

**Interaction and state clues:** This is a secondary action surface intended for quick in-room tasks. Controls such as mute/beauty are stateful toggles; share and game launches are actions. Avoid making all controls look identical if their consequences differ.

**React Native implementation notes:** Model entries as typed actions (`toggle`, `navigate`, `invoke`) so stateful items can display their current status. Use a bottom sheet or drawer that scrolls on smaller devices and closes after navigation.

### 014. Messages inbox opened from room context

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (8).jpeg`

**Visible structure and purpose:** A white/light inbox page titled 'Messages' includes a Messages/Contacts switch, search and menu controls, an enable-notifications banner, filter chips, a family/community prompt, system entries such as interaction notifications and Moments, and a vertical conversation list with avatars, snippets, timestamps, and unread badges.

**Interaction and state clues:** The notification banner can be dismissed; filters narrow the inbox; tapping a row opens a conversation or system notice. Small red count badges need a single source of truth to stay consistent with the global tab badge.

**React Native implementation notes:** Build an InboxScreen with a segmented header, dismissible notice, horizontally scrollable filters, and FlashList/FlatList conversation rows. Treat unread counts as server state and support pagination and optimistic read updates.

### 015. Live room conversation state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (9).jpeg`

**Visible structure and purpose:** The live room fills the screen with ten audio-seat slots over a dramatic background. A semitransparent chat layer shows room-introduction and participant messages, and a composer at the bottom reads 'Say something'. Room-level quick actions and the participant count remain visible; the gift panel is closed or reduced.

**Interaction and state clues:** This screen demonstrates the persistent chat stream coexisting with voice seats. The composer should remain reachable while messages scroll, and room introduction messages should be system-styled rather than indistinguishable from member text.

**React Native implementation notes:** Separate the room canvas, message overlay, seat grid, and composer into independent components. Subscribe to room events through a real-time channel, virtualize chat, and avoid rerendering the full background on every message.

### 016. Relationship-type selection — Couple / Friend

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (10).jpeg`

**Visible structure and purpose:** A profile-backed page is dimmed by a pale lavender chooser titled 'Choose Relationship Type'. Pill-like Couple and Friend options sit above a large illustrated invitation card. The card displays both profile photos/names, relationship type, coin price, and an explanation; a broad pink/purple button invites the user to form the relationship.

**Interaction and state clues:** The selected relationship type changes the card art and cost. The overlay has a help icon, close/back control, and a primary invitation action; the background profile context identifies the target person.

**React Native implementation notes:** Make the type switch a controlled segmented selector and drive price/copy/art from configuration. Before purchase, show recipient eligibility and confirmation; don't infer successful relationship creation until the server confirms acceptance.

### 017. Couple invitation card state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (11).jpeg`

**Visible structure and purpose:** The Couple variant of 'Choose Relationship Type' is emphasized with pink gradients and a romantic couple illustration. The card names both participants, shows a coin cost, and explains that an invitation is sent to the other party. The bottom full-width CTA is the most visually prominent control.

**Interaction and state clues:** This is the high-intimacy variant of the selector. The product flow is two-sided: sender issues the invitation; the recipient must accept within the stated validity window, as explained in related screenshots.

**React Native implementation notes:** Keep the card component shared with the Friend option while theming the couple state. Handle pending/accepted/declined/expired states explicitly and refresh both users' relationship lists after a response.

### 018. Profile Relationships tab — relationship summary

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (12).jpeg`

**Visible structure and purpose:** The profile page is on the Relationships tab. A compact pink relationship card contains two participants and an invite/add control; a separate invite tile appears below. The global profile header, tab strip, photo cover, bottom contact icons, and wide 'Say hi' CTA are still present.

**Interaction and state clues:** The page surfaces existing or potential relationship links without leaving the member profile. Selecting the relationship card likely opens more detail; Invite begins the relationship-creation flow.

**React Native implementation notes:** Treat relationships as their own data model and show loading/empty states. Reuse the profile shell and render a relationships-specific body based on the selected profile tab.

### 019. Her Guardian page — empty state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (13).jpeg`

**Visible structure and purpose:** A dedicated pale-pink page titled 'Her guardian' shows a decorative pair of circular portraits/hearts at the top, a centered empty-state message stating the user has not been guarded, and a single pink Guard button. A back arrow and help icon sit in the header.

**Interaction and state clues:** The action likely establishes a guardian relationship or opens a purchase/confirmation flow. The empty state should transition to a relationship summary when a guardian exists.

**React Native implementation notes:** Create an explicit empty state with illustration, explanatory text, and primary CTA. Require server validation, prevent self-guarding if unsupported, and include a loading/result state after tapping Guard.

### 020. Friend invitation card state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (14).jpeg`

**Visible structure and purpose:** The relationship chooser is shown in its Friend state. A purple friend-oriented card presents two profile photos, a gift-like badge, invitation wording, and a coin price lower than the Couple variant visible elsewhere. The CTA and Couple/Friend selector remain fixed in the sheet.

**Interaction and state clues:** The state illustrates that relationship options have distinct prices and visual themes. Changing selection should update content in place rather than navigate to a new screen.

**React Native implementation notes:** Parameterize the invitation card by relationship kind; never hardcode price in the view. Make dynamic price, availability, and acceptance terms accessible text, not only text baked into the card image.

### 021. Profile Relationships tab — tier cards

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.51 (15).jpeg`

**Visible structure and purpose:** A relationship-focused profile view shows separate Friend and Couple sections with member portraits, duration/level badges, horizontal progress bars, and token/reward areas; one section is visually selected with a purple or pink treatment. The standard profile footer remains at the bottom.

**Interaction and state clues:** The bars communicate relationship progression and the token area can be empty or contain a reward. Tabs or cards switch which relationship record is shown.

**React Native implementation notes:** Render tier cards from relationship records with normalized progress values. Provide semantics for progress bars and avoid using color alone to distinguish Friend from Couple; label each type explicitly.

### 022. Profile Relationships tab — invite/relationship state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52.jpeg`

**Visible structure and purpose:** The tab shows a pink relationship banner with two users, a circular relationship emblem, and an invitation affordance. Smaller lower tiles include invite or related relationship records. The header retains profile navigation and the Say hi/action footer.

**Interaction and state clues:** This appears to be a slightly different loaded relationship state from the previous screenshot, emphasizing the relationship summary rather than all tier details.

**React Native implementation notes:** Use the same component tree as the Relationships summary screen, but vary empty, pending, and active states based on backend status. Cache relationship data to avoid flicker when opening profile tabs.

### 023. Profile Relationships page — friend/couple sections

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52 (1).jpeg`

**Visible structure and purpose:** A relationship-tab capture shows several relationship tiles together: a pink Couple panel, a purple Friend panel, member portraits, level/duration markers, and an Invite tile. One tier panel is emphasized while the profile's tab strip and bottom call/message/Say hi controls remain visible. This state differs from a single invitation card because it summarizes multiple relationship records or available relationship types.

**Interaction and state clues:** The cards likely open each relationship record or start a new invitation. Keep current/expired/pending relationship states distinct and avoid assuming an invite has been accepted simply because a tile is present.

**React Native implementation notes:** Use a shared RelationshipCard and a list/grid that adapts to the number of relationships. Drive visibility, status, and levels from API data and retain the sticky profile contact actions.

### 024. Profile Moments feed

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52 (2).jpeg`

**Visible structure and purpose:** The profile is on the Moments tab. The body is a chronological, vertical media feed with post authors/metadata, image or video thumbnails, heart/like counts, comment counts, and large gaps between content cards. The profile header/tabs and sticky Say hi footer stay visible.

**Interaction and state clues:** Post interactions include opening media, liking, commenting, and likely viewing post detail. The screenshot also shows a black-and-white image post and a second media card further down.

**React Native implementation notes:** Use a virtualized feed within the profile shell and a separate full-screen media viewer. Optimistically update likes, but persist only confirmed post IDs and counts from the API.

### 025. Profile Honor tab — honor walls

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52 (3).jpeg`

**Visible structure and purpose:** A member honor page is arranged as three decorative horizontal collections: Badges Wall, Titles Wall, and Gifts Honor Wall. Each wall contains ornate reward art and a small count/chevron for opening the full collection. The bottom profile action bar persists.

**Interaction and state clues:** Each wall is a deep link into a collection of achievements or received gifts. Empty/low-count states should still preserve the wall's visual framing.

**React Native implementation notes:** Create reusable HonorWall cards with a title, preview grid, count, and navigation callback. Keep badge/trophy art as image assets and descriptions as text so collection items remain accessible.

### 026. Profile Information tab

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52 (4).jpeg`

**Visible structure and purpose:** A profile information view lists personal attributes in a left-aligned stack with small line icons: mutual followers, ID, height, weight, occupation, nationality, current address, birthday, constellation sign, and registration time. The content is on a white canvas under the profile tabs and above the sticky contact footer.

**Interaction and state clues:** Rows are informational and may expose copy/share actions for IDs. Some details are sensitive and should be selectively hidden according to privacy settings.

**React Native implementation notes:** Represent fields as label/value rows and render only data allowed by privacy policy. Use localized values, proper date/measurement formats, and a privacy-safe default for sensitive attributes.

### 027. Profile — full header and profile tags

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52 (5).jpeg`

**Visible structure and purpose:** The full profile summary reappears, showing a photographic avatar/header, name and ID, decorative status chips, two large room/family shortcut cards, profile-tag pills (interests/hobbies), and the Information section. Compared with image 001, this instance visibly contains a different tag set and personal values.

**Interaction and state clues:** The screen is a data-rich profile state rather than a modal. Tag chips are likely display-only here; room/family cards navigate to the corresponding community entities.

**React Native implementation notes:** Use data-driven tags and optional profile fields. Keep a shared layout with image 001 and don't fork the design just because the profile data differs.

### 028. Profile media viewer

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52 (6).jpeg`

**Visible structure and purpose:** A large full-height photo/video still of a woman occupies most of the display; a close/back affordance and share-like icon sit over the media. The profile identity, decorative level badge, and profile tab strip appear below the media in the visible lower region, followed by contact actions.

**Interaction and state clues:** This may be a profile media preview embedded in the profile page rather than a standalone gallery. The image is the visual focus; identity/navigation stays available beneath it.

**React Native implementation notes:** Support portrait media with contained/cropped aspect handling and overlays with sufficient contrast. If it is video, lazy-load playback and stop/pause it when the screen loses focus.

### 029. Aristocracy rank selector / benefit catalogue

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.52 (7).jpeg`

**Visible structure and purpose:** The Aristocracy screen uses a dark-and-ivory split presentation. A horizontal tier selector names ranks such as Viscount, Count, Marquis, Duke, and King. The benefit side lists small illustrated perks in a multi-column matrix; a large selected-rank badge occupies a dark panel, with a seven-day coin price and gold Activate button anchored at the bottom.

**Interaction and state clues:** Tier selection changes the badge, unlocked perk count, price, and selected benefit state. The activation CTA is a paid membership action and should not be treated as a normal navigation button.

**React Native implementation notes:** Build a reusable MembershipTierScreen driven by rank definitions and perk metadata. Show a clear purchase confirmation with duration, renew/cancel terms, and server-confirmed activation state.

### 030. Aristocracy — King tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53.jpeg`

**Visible structure and purpose:** A large ornate King emblem is centered on a dark triangular background. Beneath it, 'King' and an exclusive-privileges progress statement indicate full unlock status (20/20); below that is a grid of perk icons and a footer showing the seven-day price and Activate CTA.

**Interaction and state clues:** This is the visual detail state of the highest Aristocracy tier. The crest is the focal point, while the benefit grid gives an itemized reason to activate.

**React Native implementation notes:** Use high-resolution crest art with a fixed aspect box; dynamic progress and price should be real text. Keep a fallback for long localized labels and implement tier transitions with a subtle crossfade.

### 031. Aristocracy — Marquis tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (1).jpeg`

**Visible structure and purpose:** A purple/gold Marquis crest is centered over the same dark geometric background. The visible privilege count is partial (around 14/20), and the cream-colored lower area contains a multi-row matrix of benefits; the footer presents the matching coin cost and Activate action.

**Interaction and state clues:** Compared with King, fewer perks appear unlocked, reinforcing a tier ladder. Disabled/locked perks are muted, while available benefits use stronger contrast.

**React Native implementation notes:** Represent perk unlocks as booleans from tier configuration and preserve the same icon positions across tiers for comparison. Add accessibility labels describing whether each perk is included or locked.

### 032. Aristocracy — Duke tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (2).jpeg`

**Visible structure and purpose:** A blue/gold Duke crest appears in the dark upper panel with a partial exclusive-privileges count (approximately 16/20 visible in one state). A grid of icons and labels fills the light lower area; a price-per-seven-days line and Activate button remain pinned at the bottom.

**Interaction and state clues:** The tier art and progress count are the major differences from adjacent ranks; the rest of the structure is consistent with the membership comparison pattern.

**React Native implementation notes:** Reuse the membership detail template; only tier image, title, unlock count, perk access, price, and CTA state should vary.

### 033. Aristocracy — intermediate rank benefits

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (3).jpeg`

**Visible structure and purpose:** A further Aristocracy state shows a large rank crest above the same exclusive-privilege grid and a seven-day activation price. The exact rank title is small in the source montage, but the visual hierarchy and tier progression are consistent with neighboring rank screens.

**Interaction and state clues:** This screen is best treated as another tier selection state rather than a separate feature. Preserve the source screenshot for final verification of the exact title/price label before copying text into production.

**React Native implementation notes:** Avoid screen-specific implementations for each rank. Use one tier data model, verify low-resolution labels against the full source image, and unit-test tier-to-price mappings.

### 034. Aristocracy — Marquis/Count benefit state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (4).jpeg`

**Visible structure and purpose:** This state places an ornate mid-tier emblem in the dark header, with a privilege count under the title and an extensive matrix of perks below. The lower price/footer and muted locked perks communicate a lower tier than King.

**Interaction and state clues:** The tier selector and Activate CTA create a compare-and-buy flow. Perk count and price should update atomically when the selected rank changes.

**React Native implementation notes:** Store tier metadata centrally and derive display from a single selectedTier ID to avoid mismatching an emblem and its pricing. Include loading/error states if tier data is fetched.

### 035. Aristocracy — Count privilege selector state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (5).jpeg`

**Visible structure and purpose:** A rank-selection state emphasizes the Aristocracy benefit matrix, with the Count tier selected and a matching badge preview/price area. The light perk catalog and dark rank-emblem panel use the same split layout as adjacent tier captures; this is an additional state for the Count tier rather than a distinct membership system.

**Interaction and state clues:** Switching the selected rank should update the crest, benefit availability, progress count, and seven-day activation price together. Small tier labels should be transcribed from the full-resolution source before being used as product copy.

**React Native implementation notes:** Keep tier selection and selected perk data normalized. Reuse the rank-detail template and test that Count pricing and entitlements cannot be paired accidentally with another tier's crest.

### 036. Aristocracy — Count tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (6).jpeg`

**Visible structure and purpose:** A blue/silver Count emblem appears over the same dark geometric stage. The screen shows an approximately 11/20 privilege count and repeats the compact grid of available/locked benefits above the paid activation footer.

**Interaction and state clues:** This reinforces the same comparison format while showing fewer available benefits. The exact numerical text should be checked from the full image when transcribing production copy.

**React Native implementation notes:** Use shared tier and perk components; use textual unlock states for accessibility and do not rely exclusively on faded color to imply an unavailable feature.

### 037. Aristocracy — Viscount tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (7).jpeg`

**Visible structure and purpose:** A pale blue crest labels the Viscount tier; the screen reports about 10/20 exclusive privileges. The two/three-column perk grid mixes labels such as room lock, exclusive gifts, badges, frames, and entry effects, with unavailable features visibly subdued.

**Interaction and state clues:** This is a lower paid tier in the same rank ladder. The price and progress indicator must remain linked to the selected Viscount state.

**React Native implementation notes:** Implement tier selection as route state or screen state rather than a separate component per tier. Confirm the correct price/period before activation.

### 038. Aristocracy — Viscount benefit catalogue state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (8).jpeg`

**Visible structure and purpose:** The left/light catalog view foregrounds a matrix of Aristocracy perks, with the Viscount rank highlighted in the top tier navigation and a selected badge preview to the side. The bottom bar repeats the coin balance/cost and activation control.

**Interaction and state clues:** The benefit list can be explored before purchasing. Tapping a perk may reveal its meaning, but that deeper behavior is inferred rather than guaranteed by this screenshot.

**React Native implementation notes:** Make each perk tile an accessible button only if it actually opens detail; otherwise keep it descriptive. Use a horizontal tier tab bar that scrolls on compact devices.

### 039. Aristocracy — Knight tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (9).jpeg`

**Visible structure and purpose:** A green/blue Knight emblem is centered on the dark upper panel, followed by 'Knight' and a lower privilege count (around 7/20). The familiar benefit matrix sits below with a relatively low seven-day cost and Activate CTA.

**Interaction and state clues:** Knight represents the entry tier in this rank sequence. Keep the unlocked/locked comparison consistent so users can understand what upgrading changes.

**React Native implementation notes:** Reuse the same template, with tier hierarchy handled in data. The activation request should be idempotent and refresh membership entitlements after success.

### 040. SVIP benefits overview

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (10).jpeg`

**Visible structure and purpose:** A near-black/gold SVIP page uses VIP and SVIP tabs across the top. SVIP level badges (including SVIP6/SVIP7) sit above rows of luxury red/gold benefit tiles such as broadcast gift privilege, alphabetic unique ID, effects, custom gifts, and store access. The premium visual style differs from the white Aristocracy screens.

**Interaction and state clues:** The top tabs switch membership families; the grid is a set of benefit shortcuts, and SVIP level milestones likely gate some tiles. A store section lower on the screen surfaces purchasable premium assets.

**React Native implementation notes:** Treat VIP/SVIP as a dedicated membership hub with shared data but a distinct theme. Separate perks, store products, current level, and upgrade CTA into testable components.

### 041. SVIP catalog — premium benefits, upper section

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (11).jpeg`

**Visible structure and purpose:** A black/red premium catalogue displays a dense grid of red-gold cards with icons and labels for custom nicknames, level-up packs, renewal packs, room bullet comments, gifts, and other exclusive effects. The top VIP/SVIP selector remains fixed while the content is scrollable.

**Interaction and state clues:** Tiles are product shortcuts or benefit detail links. Some items may be gated by the member's current level, and the store section lower on the page is a separate shopping area.

**React Native implementation notes:** Use a two/three-column responsive grid with explicit locked/unlocked labels. Avoid embedding copy in the art; keep titles and availability text as normal components.

### 042. SVIP catalog — premium benefits, continuation

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.53 (12).jpeg`

**Visible structure and purpose:** A continuation of the red-gold SVIP catalogue shows additional exclusive items such as animated gifts, frames, customized tiles, mini-cards, and anniversary/birthday gift packs. The same dark background, gold iconography, and packed card rhythm are used.

**Interaction and state clues:** The page likely scrolls vertically through the benefit inventory; repeated design allows users to scan without learning a new layout.

**React Native implementation notes:** Use one catalog data array and FlatList/FlashList with a stable two-column layout. Lazy-load images below the fold and keep item press targets at least 44 points.

### 043. SVIP catalog — lower section / more effects

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54.jpeg`

**Visible structure and purpose:** Another scroll position displays more premium effect tiles, including entrance effects, vehicles, room bubbles, privilege gifts, and other animated/identity assets. The red-gold palette and dense grid remain consistent; content is lower in the same catalog rather than a wholly new screen.

**Interaction and state clues:** The repeated page state indicates vertical scroll in a long catalog. Some tiles look like exclusive benefits and others like items available to buy, so product and entitlement status should be distinct.

**React Native implementation notes:** Track whether a tile is a benefit, entitlement, or purchasable item in the model. Use explicit section headers where product behavior permits, and don't force all tiles into one ambiguous action.

### 044. SVIP7 tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (1).jpeg`

**Visible structure and purpose:** A fiery red SVIP7 crest sits at the top of a dark premium detail page beside a member name and experience/upgrade line. A Recharge CTA appears near the top; below are the SVIP7 benefits with a progress count, and a small SVIP level selector runs across the bottom/upper benefit area.

**Interaction and state clues:** This screen combines membership identity, current progress, recharge, and included benefits. Locked indicators imply the user can inspect higher tiers even when they are not active.

**React Native implementation notes:** Create a MembershipLevelDetail component showing current level, points, recharge, and perk count. Keep recharge and tier purchase logic separate and reconcile experience after payment.

### 045. SVIP tier navigation / locked benefits state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (2).jpeg`

**Visible structure and purpose:** A dark SVIP view shows multiple level tabs across the top and a matrix of gold benefit tiles. Several items are dimmed with small SVIP-level badges, indicating that they require a higher level. The page is denser than the per-level hero view and focuses on scanning available features.

**Interaction and state clues:** The user can browse levels or compare unlock requirements. Disabled items should still be explorable for explanation instead of appearing broken.

**React Native implementation notes:** Use explicit `requiredLevel` metadata and display a tooltip/detail panel for locked perks. Ensure horizontal tier navigation has a visible selected indicator.

### 046. SVIP16 tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (3).jpeg`

**Visible structure and purpose:** A green/gold SVIP16 membership detail screen emphasizes an ornate SVIP16 crest and high experience threshold. Recharge appears as a prominent button; a large progress statement and unlocked benefit count sit over a dark green backdrop with exclusive frame, badge, entry-effect, vehicle, and bubble perks.

**Interaction and state clues:** This is a higher tier in a family of SVIP-level detail pages. Entitlements and experience progress differ from the SVIP7 page while the component structure remains similar.

**React Native implementation notes:** Reuse the SVIP detail template with tier-specific art and colors, but keep accessibility contrast and the content structure stable. Test large numeric progress values and localization.

### 047. SVIP1 tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (4).jpeg`

**Visible structure and purpose:** A green/gold SVIP1 detail page shows a simpler member crest, name, experience-to-upgrade figure, Recharge CTA, a count of unlocked benefits (about 12/32), and a benefit tile grid. A level selector lets the user move among SVIP levels.

**Interaction and state clues:** The lowest SVIP level exposes a subset of features, demonstrating the progression model. Recharge should not imply a guaranteed level change unless the actual product rules confirm it.

**React Native implementation notes:** Use a progress model shared by all SVIP tiers; compute progress from server data and label whether numbers are level points or currency.

### 048. VIP benefit catalogue

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (5).jpeg`

**Visible structure and purpose:** A black/gold VIP hub shows VIP-level tabs (VIP1, VIP2, VIP3, etc.) and a dense collection of square feature tiles for room background, points store, language filter, following capacity, effects, profile identity, and other perks. The selected VIP level is indicated by a line/highlight.

**Interaction and state clues:** The user is exploring the standard VIP range and can choose a level to inspect. Feature tiles may be available at different levels; the screenshot is a catalog rather than a purchase confirmation.

**React Native implementation notes:** Make VIP and SVIP share the general tier/perk architecture but retain separate entitlement sets. Provide consistent keyboard/screen-reader focus on the horizontal tier tabs.

### 049. VIP16 tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (6).jpeg`

**Visible structure and purpose:** A gold VIP16 badge fills the upper dark panel with a level title and an unlock count around 17/17. A Recharge CTA, current experience figure, and benefit grid sit below, using gold-on-black tile treatments.

**Interaction and state clues:** The screenshot represents an active or inspectable high VIP level with all listed benefits unlocked. Locked state versus current ownership needs an explicit server field, not visual inference alone.

**React Native implementation notes:** Use membership state to select active/preview styling, and make the Recharge CTA text reflect the exact action available to the current user.

### 050. VIP3 tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (7).jpeg`

**Visible structure and purpose:** A gold VIP3 crest and a partial benefit count (around 14/17) appear over a dark premium background. The page includes a recharge action, progress/experience line, level selector, and a grid of benefits such as viewing visitors, room creation, effects, and points/store features.

**Interaction and state clues:** The state shows a lower tier with fewer available benefits than VIP16. The level selector is likely shared with the detail screen and should preserve selection when the user browses.

**React Native implementation notes:** Drive tier tabs, perk access and progress from a single entitlement object. Consider sticky top membership header while scrolling through perks.

### 051. VIP3 benefits grid / scroll state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (8).jpeg`

**Visible structure and purpose:** A subsequent VIP3 view focuses on the benefit matrix rather than the crest hero. Repeated square tiles show room backgrounds, point store, following counts, language filter, and other features, with some locked/dimmed states. The VIP tier tabs stay visible.

**Interaction and state clues:** This looks like a catalog position or an adjacent state with more of the grid exposed; preserve tab selection when content scrolls.

**React Native implementation notes:** Avoid duplicating the same data between hero and grid. The header and content should respond to safe-area and scroll position without layout jumps.

### 052. VIP2 tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (9).jpeg`

**Visible structure and purpose:** A gold VIP2 crest appears at the top of the membership detail screen. The page shows a modest experience requirement, Recharge control, about 13/17 benefits unlocked, and the common grid of privileges.

**Interaction and state clues:** This is another level-specific view in the same VIP ladder; the value is the ability to compare what the user gets at each level.

**React Native implementation notes:** Make the number of benefits and price/experience dynamically derived. If the product uses paid VIP, add a confirmation step and transaction-result feedback.

### 053. VIP1 tier detail

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (10).jpeg`

**Visible structure and purpose:** A gold VIP1 crest anchors the membership page. Below it are experience progress, a Recharge CTA, a benefit count around 12/32 (depending on the visible benefit set), and the first-level privilege grid. Some tiles are visibly dimmer than the available set.

**Interaction and state clues:** This is an entry-level membership state; users should be able to understand baseline privileges and which items require an upgrade.

**React Native implementation notes:** Treat current membership versus previewed membership as different states. Show explicit upgrade thresholds instead of relying on shade differences.

### 054. Families Square — group discovery

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (11).jpeg`

**Visible structure and purpose:** A white community list titled 'Families Square' displays vertically stacked family cards. Each card has a banner/avatar, family name (some Arabic), member count, colored category/tag chips, a line of member avatars or friends-following context, and a purple Join button. A back arrow and create/add control are visible in the header.

**Interaction and state clues:** Join is the main action; a group card can likely be opened for details. Member counts and tags help users select groups before joining.

**React Native implementation notes:** Use a family directory list with pagination and optimistic join state only after the API responds. Support right-to-left names and mixed Arabic/Latin text without breaking chip layout.

### 055. Daily Tasks screen

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (12).jpeg`

**Visible structure and purpose:** A light lavender task page titled 'Tasks' shows a date/refresh countdown pill, a Daily Tasks section and a vertical list of missions. Each row has a small icon, task name, progress or quota, coin reward, and sometimes a right-side arrow/status. Examples include daily check-in, saying hi, intimacy, sending gifts, joining a chat room, and opening games.

**Interaction and state clues:** Tasks are progress-driven and reward-oriented. Each row should distinguish not started, in progress, completed, claimed, and expired states; the screenshot includes several coin rewards and quotas.

**React Native implementation notes:** Use a task model with progress, reward, deadline, and claim status. Update progress from events where possible and make reward claims idempotent.

### 056. Visitors screen — VIP-gated list

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.54 (13).jpeg`

**Visible structure and purpose:** A 'Visitors' page shows a two-column grid of blurred/obscured visitor cards, each with a brief visit-time label and a small presence/status indicator. A grey notice explains the visitor-history constraint, and a large purple CTA asks the user to activate VIP to unlock the visitors function.

**Interaction and state clues:** The content is deliberately obscured or gated. The call to action is an upsell; the screen should clearly explain what activation changes without falsely implying data is available before purchase.

**React Native implementation notes:** Gate visitor details through entitlement checks and avoid downloading private visitor data for non-VIP users. Use privacy-safe placeholders and an explicit loading/access state after activation.

### 057. My Diamonds — exchange screen

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55.jpeg`

**Visible structure and purpose:** A bright blue-and-white 'My Diamonds' page shows a balance of zero and a Diamonds record shortcut. An Exchange section lists multiple coin-to-diamond conversion tiers with illustrated gold coin piles, coin amounts, and blue diamond amounts in pill buttons.

**Interaction and state clues:** The page presents a wallet exchange rate ladder. Selecting a tier likely starts a conversion confirmation, and balance should update only after the transaction succeeds.

**React Native implementation notes:** Treat exchange rates and limits as server-configured financial values; show confirmation, balance impact, and transaction history. Prevent duplicate taps while a request is pending.

### 058. Settings screen

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (1).jpeg`

**Visible structure and purpose:** A minimalist white settings list groups Account Security, Notifications, Language, Chat, Privacy, General, Clear the cache, About SUGO, Switch Account, and Log Out. Each main row uses a chevron; cache size appears inline; log out is separated in a red text area.

**Interaction and state clues:** Each row opens a settings subpage or performs an action. Log Out and Switch Account are higher-impact actions and should require confirmation; cache clearing should provide completion feedback.

**React Native implementation notes:** Implement a typed settings menu and route each item explicitly. Store language/privacy/notification changes persistently and put destructive actions behind confirm dialogs.

### 059. My Level — Wealth Level

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (2).jpeg`

**Visible structure and purpose:** A dark blue geometric screen titled 'My Level' has a segmented Wealth Level / Charm Level control. A central avatar medallion is ringed by wing-like artwork; below are level/progress numbers and cards describing benefits unlocked at future wealth milestones.

**Interaction and state clues:** The segmented control switches between two progression dimensions. The progress bar and locked future levels invite the user to understand what activity raises the level.

**React Native implementation notes:** Reuse a LevelProgress component for Wealth and Charm, while sourcing metric definitions and reward milestones from the backend. Don't hardcode level point calculations in the UI.

### 060. Backpack — empty state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (3).jpeg`

**Visible structure and purpose:** A white 'Backpack' page shows a horizontal set of categories such as Gifts, Frames, Vehicles, Effects, and related assets. The center uses a faint line-art box and 'Backpack is empty', with a small store/collection action in the top-right area.

**Interaction and state clues:** The page is an inventory view; category tabs switch owned item types. The empty illustration should disappear into a populated grid once the user owns items.

**React Native implementation notes:** Implement category filters on an owned-inventory dataset. Include a clear Store link, pull-to-refresh, empty/loading/error states, and separate owned versus expired items.

### 061. Store — Bullet Comments

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (4).jpeg`

**Visible structure and purpose:** A dark purple store detail page titled 'Bullet Comments' lists premium message/scroll-comment products as large card tiles. Each card includes a VIP label, a banner sample, a product name, a coin price, and a comment-count limit; a small currency/points badge and record shortcut sit near the bottom.

**Interaction and state clues:** The user can buy a limited-use message effect. Product price and allowed comment count must be legible before purchase; a transaction may consume coins or points.

**React Native implementation notes:** Use a reusable StoreProductCard with preview, price, eligibility and quantity/limit. After purchase, update the inventory and show a receipt/toast.

### 062. Store — general catalog / Fragment section

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (5).jpeg`

**Visible structure and purpose:** The Store page uses a purple-black gradient and a top icon row for products such as Frames, Unique IDs, Room backgrounds, Animated Nickname, and Bullet Comments. Below are category tabs (General, VIP Only, SVIP Only, Fragments Section) and filter chips; the product grid includes fragment-like frames/vehicles with counts and durations.

**Interaction and state clues:** This screen is a store navigation hub plus a catalog section. Top icons switch product families, filters refine items, and item cards lead to details or purchase.

**React Native implementation notes:** Split the store into category navigation, filter chips, and a virtualized product grid. Keep filters in screen state, while purchases and inventory updates are server-controlled.

### 063. Store — Tokens category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (6).jpeg`

**Visible structure and purpose:** A product grid shows token items with elaborate crown/animal/jewelry art, labels such as Friend/Couple, coin prices, and a seven-day duration. The category icons and filter strip remain at the top; product cards are dark rounded rectangles with tiny ownership/availability indicators.

**Interaction and state clues:** Token type, recipient relationship, and duration are important product attributes. Cards should explain eligibility before the user attempts a purchase or send.

**React Native implementation notes:** Use the same product card across store and room gift catalog where possible, backed by shared item IDs. Include localization and price formatting for large coin values.

### 064. Store — Vehicles category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (7).jpeg`

**Visible structure and purpose:** The Store catalog is filtered to Vehicles. Four-column or two-column dark cards show ornate vehicle artwork, coin prices, and short validity durations. VIP-only filters appear among the sub-tabs; some cards are marked VIP/SVIP.

**Interaction and state clues:** The filter changes the type of items without changing the page shell. Purchase may add a vehicle effect/asset to the inventory or unlock it for a limited period.

**React Native implementation notes:** Represent product category, required tier, duration and ownership in catalog data. Use image placeholders and avoid loading heavy art until cards approach the viewport.

### 065. Store — Frames / fragment products

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (8).jpeg`

**Visible structure and purpose:** A Store grid displays circular/ornate frame fragments with coin or fragment currency prices and short durations. Some items have a Lucky Points sticker and small badges for availability; a bottom currency bar shows a balance and Recharge affordance.

**Interaction and state clues:** This view is a specific fragment-related catalog state. The currency type is important: purchases may use a non-coin points balance.

**React Native implementation notes:** Model price as `{amount, currency}` rather than a string. Display owned counts and expiry; use a transaction service that validates inventory and currency atomically.

### 066. Store — VIP-only vehicle products

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (9).jpeg`

**Visible structure and purpose:** The VIP Only filter is active, and the grid shows vehicle assets with gold vehicle thumbnails, high coin costs, and seven-day duration labels. Locked or tier-labelled product cards communicate premium eligibility.

**Interaction and state clues:** This state filters the catalog by membership requirements. A product may be viewable even when it cannot be purchased by the current user.

**React Native implementation notes:** Keep filter selection independent from the base product list and return a helpful upgrade prompt for gated products. Preserve the filter when navigating back from a product detail.

### 067. Store — VIP-only frames / related products

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (10).jpeg`

**Visible structure and purpose:** A set of ornate frame products is displayed in the premium-filtered catalog, with circular frame art, high prices, duration text, and small tier labels. Cards align to a two-column product grid while the top navigation remains sticky.

**Interaction and state clues:** This is a membership-filtered inventory view rather than a new screen family. Products need consistent detail and purchase handling regardless of filter.

**React Native implementation notes:** Use a common StoreScreen and pass the chosen category/tier filter. Maintain stable card heights for product titles with different language lengths.

### 068. Store — Room Backgrounds category

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (11).jpeg`

**Visible structure and purpose:** The catalog is filtered to Room Backgrounds. Cards show pastel and scenic room wallpaper previews, coin prices, seven-day terms, and NEW markers. The Store categories and filter chips remain visible at the top, with a sticky balance/Recharge bar below the grid.

**Interaction and state clues:** Selecting a background likely previews or purchases a room appearance item. New labels must reflect catalog metadata and expire when the item is no longer new.

**React Native implementation notes:** Implement a room background preview route and a confirmation purchase flow. Support cropping/cover behavior because room backgrounds are full-screen assets.

### 069. Store — Token item catalog state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (12).jpeg`

**Visible structure and purpose:** A purple-black Store view highlights Token as the product type. A two-column grid pairs shiny fantasy tokens with prices and durations, alongside Friend/Couple labels, small NEW badges, and occasional promotional markers.

**Interaction and state clues:** The screen is a variation of the same store grid for token products. Product detail should preserve the selected filter and scroll location.

**React Native implementation notes:** Use virtualized product cards and stable IDs, and handle price/validity in data instead of putting them into the image asset.

### 070. Store — Vehicles catalog state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (13).jpeg`

**Visible structure and purpose:** A dedicated Vehicles listing shows multiple premium car/horse/vehicle-like effects, prices, and remaining validity. Product imagery occupies most of each card, with category name, coin icon, and duration directly below.

**Interaction and state clues:** The view supports browsing vehicle inventory and buying timed display effects. Owned/active vehicles should be visually distinguishable from available products.

**React Native implementation notes:** Add an owned/active state to catalog cards and an inventory refresh after purchase. Ensure the detail view explains where the vehicle animation appears.

### 071. Store — Frames catalog state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (14).jpeg`

**Visible structure and purpose:** An ornate-frame grid presents circular profile frames in many colors, with price/duration labels and NEW/Lucky Points badges. The top filter shows Frames as selected, with the same dark background and product geometry as the room-background and token pages.

**Interaction and state clues:** Frame purchases modify profile presentation; the product's duration and ownership status should be apparent. Selecting a card likely opens preview or purchase confirmation.

**React Native implementation notes:** Use aspect-ratio-stable frame thumbnails and a user avatar preview in product detail. Track expiration server-side and notify the client when a temporary frame expires.

### 072. Store — Room Backgrounds / catalog state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (15).jpeg`

**Visible structure and purpose:** A room-background grid displays scenic image cards with NEW chips, prices, and a short duration. A mixed row includes other gift/asset cards as the grid reaches different scroll positions, suggesting a filter or horizontal tab transition at capture time.

**Interaction and state clues:** The underlying screen family is the Store product catalog; the key state is selected room-background products and the consistent purchase affordance.

**React Native implementation notes:** Keep category filters and data aligned with the visible tab state. Verify the selected filter in the full source before treating mixed items as intentional catalog behavior.

### 073. Event Center — Official Events / Party Square

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (16).jpeg`

**Visible structure and purpose:** A pale lavender Event Center page uses tabs for Official Events and Party Square. Large full-width illustrated banners stack vertically, each promoting a distinct themed event. A back arrow anchors the header and the page is otherwise focused on artwork.

**Interaction and state clues:** Tapping a banner likely opens an event detail or activity page. This screen functions as a campaign landing page and may change frequently.

**React Native implementation notes:** Serve banners and deep-link routes from remote configuration. Include image loading placeholders, analytics event IDs, and graceful handling for expired events.

### 074. More / General Tools menu

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (17).jpeg`

**Visible structure and purpose:** A white menu screen organizes shortcuts under General Tools (Diamonds, Visitors, Tasks, Family), Games (several game icons), and utility rows including Event Center, Store, Backpack, My Level, Share SUGO, customer service, online service, and Settings. The app's five-tab bottom navigation stays visible.

**Interaction and state clues:** This menu is an app-wide feature directory. Tiles open dedicated pages, while the bottom bar enables switching primary sections without returning to Home.

**React Native implementation notes:** Build sections from typed menu data with permissions/feature flags. Use a responsive grid for shortcuts and standard list rows for secondary actions; keep navigation destinations centralized.

### 075. Me dashboard / account home

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (18).jpeg`

**Visible structure and purpose:** The account home shows a large avatar and name, following/fans/followers metrics, a Recharge banner, VIP/SVIP and Aristocracy membership cards, General Tools, Games, and links to Event Center, Store, Backpack, My Level, sharing/support, and Settings. A five-item bottom bar anchors Home, Moments, Rooms, Messages, and Me.

**Interaction and state clues:** This is a self-profile dashboard rather than a public member profile. Membership shortcuts and wallet actions are prominent, while tools are secondary destinations.

**React Native implementation notes:** Separate account dashboard data from public profile data. Load counters and balances independently, cache stable menu config, and badge the Me tab only for actionable notifications.

### 076. Direct conversation — media and relationship context

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (19).jpeg`

**Visible structure and purpose:** A one-to-one chat screen in Arabic contains the conversation header and identity, a strip of shared photos/media near the top, alternating text bubbles, system/relationship notices, and a bottom composer. Icon buttons support media, gifts, calls, emojis, and text entry; small floating heart/relationship decoration sits near the header.

**Interaction and state clues:** The conversation blends direct messages with relationship-intimacy features. Media thumbnails open a viewer; the composer supports text and likely attachments, and call controls start an audio/video flow.

**React Native implementation notes:** Use a real-time chat list with stable message IDs and delivery/read states. Separate message types (text, media, system, gift) and provide RTL layout support based on the conversation locale.

### 077. Intimacy panel — Chat Streak and tasks

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (20).jpeg`

**Visible structure and purpose:** A pink/lilac bottom sheet titled 'Intimacy' overlays the conversation. It includes a Chat Streak card with a fire/flame empty state, a Relationship Privileges card, then Tasks & Achievements with gift and action milestones and prominent GO buttons. The conversation remains dimmed behind the sheet.

**Interaction and state clues:** The panel makes intimacy progression actionable. GO links guide users to the exact chat/gift action needed; completed progress should update after the action is confirmed.

**React Native implementation notes:** Build as a scrollable modal sheet with re-usable progress/task cards. Use explicit progress values, handle empty streak states, and update via chat/gift events rather than local assumptions.

### 078. Intimacy panel — Relationship Privileges

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (21).jpeg`

**Visible structure and purpose:** The same pink relationship sheet emphasizes a Relationship Privileges section, describing exclusive benefits unlocked by forming a relationship. It shows a row of benefit icons, a wide Invite button, a Chat Streak card, and a list of tasks/achievements with GO actions.

**Interaction and state clues:** The Invite CTA starts the couple/friend relationship flow; tasks below act as shortcuts into actions that increase intimacy. The sheet is contextual to the open conversation.

**React Native implementation notes:** Reuse the IntimacySheet components and pass conversation user ID. Avoid nesting several modal stacks; coordinate sheet closure and navigation to an invitation route.

### 079. Direct conversation — message thread

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (22).jpeg`

**Visible structure and purpose:** A chat thread is shown at a longer scroll position with many alternating lavender outgoing bubbles and light-grey incoming/system bubbles. Small avatars align with message groups; translated Arabic text, emoji reactions, and short system messages appear between regular messages. The composer remains fixed at the bottom.

**Interaction and state clues:** This screen primarily demonstrates message history and scrolling behavior, including different message styles and repeated messages. The keyboard should not cover the composer when typing.

**React Native implementation notes:** Virtualize long message histories, group consecutive messages by sender/time, and support RTL text alignment per message. Maintain scroll position while appending new real-time messages.

### 080. Direct conversation — thread and media continuation

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (23).jpeg`

**Visible structure and purpose:** A further conversation state shows several short outgoing messages, a media strip/thumbnails, a user profile thumbnail at the bottom, and the persistent composer with attachment, gift, call, and emoji actions. The message thread occupies the majority of the screen.

**Interaction and state clues:** The visible history suggests the screen is captured at a different scroll position, not a different chat mode. Media and relationship system notices must be distinguishable from ordinary text.

**React Native implementation notes:** Use a discriminated message renderer and a keyboard-aware composer. Ensure attachment/gift menus open as sheets that do not reset chat scroll.

### 081. Conversation context menu

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.55 (24).jpeg`

**Visible structure and purpose:** The Messages list is dimmed by a white rounded action sheet at the bottom, with choices such as Delete conversations only, Delete conversation and chat, Unpin, Block, and Cancel. Background rows and unread badges remain visible.

**Interaction and state clues:** This is a destructive/context menu triggered from a conversation row. The two delete choices have different scope, and Block should require clear wording and confirmation.

**React Native implementation notes:** Use a platform-appropriate ActionSheet/Modal with destructive styling and per-action confirmation where needed. Make the menu available to screen readers and avoid executing any action on row long-press without a second selection.

### 082. Messages inbox — all conversations

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56.jpeg`

**Visible structure and purpose:** A light 'Messages' page has Messages/Contacts tabs, search and overflow controls, a dismissible notification prompt, filters such as All/Online/Most Chatted/Unread, a family-join promotional card, and conversations with avatar, name, snippet, time and unread count. The bottom navigation highlights Messages.

**Interaction and state clues:** Rows open individual chats; filter chips update which rows are visible; the promotional family card navigates to discovery. The red 99+ badge indicates unread activity at app level.

**React Native implementation notes:** Keep the inbox header and bottom navigation persistent. Use one query/state model for filters, debounce search, and paginate the list to avoid loading the full conversation history.

### 083. Contacts list

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (1).jpeg`

**Visible structure and purpose:** The Contacts tab is active and a white page lists user rows with circular profile pictures, display names, online/status chips, activity/level metadata, and last active time. A row of filters includes Following, Friends, Followers and group-related categories; a search bar sits above the list.

**Interaction and state clues:** The top chips select different relationship lists and search narrows contacts. Tapping a user opens their profile; presence indicators update over time.

**React Native implementation notes:** Use a shared ContactRow component and server-backed list filters. Handle empty results, offline state, privacy restrictions, and right-to-left names.

### 084. Families Square — alternate list state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (2).jpeg`

**Visible structure and purpose:** A second Families Square capture shows the same vertical family cards but with different groups, member counts, promotional tag chips and Join buttons. Some cards display a following/friend context beneath the family description.

**Interaction and state clues:** This is a different scroll/data state of the same community discovery feature. Joining should update the row label or move the family into a joined area after confirmation.

**React Native implementation notes:** Reuse the Families list screen and model all tags/counts. Add pagination/infinite scrolling and a debounced search/filter if available elsewhere in the product.

### 085. Moments feed — social posts

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (3).jpeg`

**Visible structure and purpose:** A white Moments feed displays user posts in a vertical stream: user avatar/name, tiny badges/status, text, photo/video content, a timestamp, and bottom-row like/comment counters. A pink 'HI' button floats near post authors or cards as a lightweight way to start contact.

**Interaction and state clues:** Likes and comments are post interactions; the HI action likely opens a greeting or chat. The feed should preserve its scroll position as new posts arrive.

**React Native implementation notes:** Build a reusable MomentCard with optional media and action row. Use optimistic likes with rollback, and open media in a dedicated viewer.

### 086. SUGO TEAM — system notice / welcome room

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (4).jpeg`

**Visible structure and purpose:** A conversation-like system page titled 'SUGO TEAM' offers tabs such as System Notice and Event Update. Large illustrated 'Welcome room' banners head messages with explanatory Arabic text and expandable copy; an online-customer-service button anchors the bottom.

**Interaction and state clues:** System notices can be read/expanded, and event updates may link to a destination. The customer-service action is a dedicated help entry point, not a regular person-to-person chat.

**React Native implementation notes:** Treat system notices as a distinct message stream backed by announcement IDs. Track read status and deep-link events; make long notice text expandable and localizable.

### 087. My chat room directory

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (5).jpeg`

**Visible structure and purpose:** A page titled 'My chat room' begins with a create-my-room tile, then a horizontal row of followed or active room avatars, tabs such as Joined/Following/Recents, and a vertical list of rooms with square artwork, room name, host metadata, activity/participant count and a small audio/equalizer indicator.

**Interaction and state clues:** The top tile opens room creation; tabs filter existing room relationships; a room card opens the live room. The audio indicators are status cues, not merely decorative icons.

**React Native implementation notes:** Model room discovery as a reusable room card list. Keep room creation and joining flows separate, subscribe to occupancy updates, and use cached room art for faster scrolling.

### 088. All Messages — room invitation requests

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (6).jpeg`

**Visible structure and purpose:** An 'All Messages' screen has a list of invitations to become a room member, each with a sender profile, short invitation text, room thumbnail and timestamp. A prominent purple Accept button appears on the actionable invitation; older or already-handled items appear disabled/greyed out.

**Interaction and state clues:** The invitation can be accepted or declined, and each request has a state such as pending, accepted, declined or expired. Avoid presenting a disabled historical invite as if it were actionable.

**React Native implementation notes:** Use server-confirmed invitation state and disable actions while requests are pending. Provide a visible success/error result and deep-link into the room after a successful acceptance.

### 089. Messages inbox — system entries and conversations

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (7).jpeg`

**Visible structure and purpose:** The inbox shows a compact list of special rows (Interaction notifications, My chat room, SUGO TEAM, Moments, Family invite) followed by personal chats. Each system row has a distinctive colored icon/avatar and sometimes an unread counter; normal chats use profile photos and short snippets.

**Interaction and state clues:** The list mixes notification categories and ordinary conversations. The row style communicates the destination type and should remain distinct when unread.

**React Native implementation notes:** Represent system destinations as typed inbox items and normal chats as conversation items, rendered by a shared list framework but separate row components.

### 090. Global room discovery list

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (8).jpeg`

**Visible structure and purpose:** A 'Global' room directory shows country/region chips with small flags across the top, followed by a vertical list of live rooms. Cards include room cover art, host names, badges/levels, language or group labels, and current participant counts; the Rooms bottom tab is active.

**Interaction and state clues:** Flag chips likely filter rooms by locale; room cards open a live room. Participant counts and activity are time-sensitive and may update while scrolling.

**React Native implementation notes:** Use a room-search service with country/language filters, a virtualized list, and polling or push updates for occupancy. Store locale-specific names as Unicode-safe text.

### 091. Rooms tab — joined rooms

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (9).jpeg`

**Visible structure and purpose:** The Rooms tab is open on a pale gradient background, with sub-tabs Recommend, Video, New, and Me; 'Me' is selected. Circular room/user shortcuts appear near the top, followed by Joined/Following/Recents filters and a single joined room card with thumbnail, name, description, and activity count.

**Interaction and state clues:** The screen filters to rooms associated with the current user. Tabs and filters are independent: top-level discovery mode versus room relationship state.

**React Native implementation notes:** Use one Rooms screen with subroute/query state instead of separate page components. Persist selected tab where appropriate and make room-card previews resilient to unavailable thumbnails.

### 092. Rooms tab — New rooms list

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (10).jpeg`

**Visible structure and purpose:** The 'New' sub-tab is selected. A long list of newly created rooms is displayed as white rounded cards with square thumbnails, host/room names, descriptions, Chat/Families labels, and participant/activity counts on the far right. The same top category bar, search, global/region, create-room, and trophy icons remain visible.

**Interaction and state clues:** This is a feed of recently created rooms; tapping a card enters the room. Category badges classify room type (Chat versus Families) and should be filterable if the interface offers it.

**React Native implementation notes:** Reuse the room card and paginate by creation time. Keep the sub-tab highlight and header fixed during scroll.

### 093. Rooms tab — Video discovery

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (11).jpeg`

**Visible structure and purpose:** The 'Video' sub-tab is selected. A large promotional carousel banner sits above a two-column grid of room/video cards using portrait thumbnails, overlays with room names, relationship/community tags, member counts, and level badges. The Rooms bottom tab stays highlighted.

**Interaction and state clues:** This is a visual discovery surface rather than a text-only room list. The banner and cards likely open campaign or room details, and member counts are dynamic.

**React Native implementation notes:** Use a paged banner plus a two-column FlatList. Preload the first viewport images, defer offscreen thumbnails, and maintain a minimum contrast overlay for room labels.

### 094. Rooms tab — Recommended room list

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (12).jpeg`

**Visible structure and purpose:** The Recommend sub-tab presents an event banner followed by vertically stacked room recommendations. Each card has a small square cover, name/description, category chip, host/level data and right-aligned participant count. The light pink/white visual system contrasts with the dark live-room screen.

**Interaction and state clues:** The recommendations likely rank rooms by relevance/popularity. The banner is a promotion; card taps enter rooms. Keep banner clicks and room clicks analytically distinct.

**React Native implementation notes:** Use a recommendation endpoint with paginated cards, a cache of room previews, and a remote-config banner carousel. Clearly display loading and empty recommendation states.

### 095. Moments feed — post detail/scroll state

**Source file:** `WhatsApp Image 2026-10-18 at 14.46.56 (13).jpeg`

**Visible structure and purpose:** A Moments-style feed shows user-generated text and photo posts with author identity, profile badges, timestamps, and like/comment actions. Some content is monochrome photography and other content is portrait media; the top switches between Recommended and New users.

**Interaction and state clues:** The tab switch changes the feed source while preserving the same post component. Post interactions should open comments or toggle likes without taking the user to a different primary tab.

**React Native implementation notes:** Use a unified feed schema for all Moments surfaces. Preserve scroll per tab if the intended navigation calls for it, and ensure media is loaded responsively.

### 096. Moments feed — recommended/new users mixed content

**Source file:** `WhatsApp Image 2026-10-18 at 14.47.22.jpeg`

**Visible structure and purpose:** Another feed state displays user posts, a prominent media block, text/emoji, and a visible count row. Header tabs include Recommend and New users, with icons for search or content filtering nearby.

**Interaction and state clues:** This may represent a different feed response or scroll position. The same author/post/action pattern applies; counts and post content vary.

**React Native implementation notes:** Drive the feed via API data and keep the UI stable across content types. Use accessibility labels for like/comment buttons and a fallback for deleted media.

### 097. Home/people discovery — Featured

**Source file:** `WhatsApp Image 2026-10-18 at 14.47.22 (1).jpeg`

**Visible structure and purpose:** A people-discovery list has top tabs Recommend, Nearby, New users, and Featured; Featured is selected. Each row shows a circular avatar, display name with badges/level and locale hints, short status/location line, and a pink 'HI' contact CTA; promotional banner cards may interrupt the list.

**Interaction and state clues:** The page is optimized for initiating social contact. HI should open a greeting/chat workflow and the selected directory tab should have a strong underline/highlight.

**React Native implementation notes:** Build a reusable user discovery row and a tabbed directory screen. Apply age/safety/privacy rules to whom can be shown and avoid disclosing precise location details in UI unless the product permits it.

### 098. Home/people discovery — New users

**Source file:** `WhatsApp Image 2026-10-18 at 14.47.22 (2).jpeg`

**Visible structure and purpose:** The New users tab is selected and the people list uses the same avatar/name/status/level layout and pink HI button. A small promoted banner appears mid-list, and the density favors rapid browsing through multiple profiles.

**Interaction and state clues:** This is a feed filter on account age/newness rather than a separate page. User cards can open profiles; the HI CTA is a quick-contact action.

**React Native implementation notes:** Share the people-list row component with Nearby, Featured and Recommend. Fetch data on tab change, cache the previous tab, and make the promotional insertion data-driven.

### 099. Home/people discovery — Nearby

**Source file:** `WhatsApp Image 2026-10-18 at 14.47.22 (3).jpeg`

**Visible structure and purpose:** The Nearby tab shows people with distance-style metadata (short values in km) beside their names and badges. Portrait avatars, status snippets and pink HI actions form a repeated vertical row; the bottom navigation remains visible.

**Interaction and state clues:** This view depends on location permission or approximate-location ranking, and it should remain useful when location access is unavailable. Distance should not reveal more precision than the product intends.

**React Native implementation notes:** Request only the location precision needed, handle permission denial gracefully, and consider approximate distance bucketing. Never make precise location text a mandatory prerequisite for discovering people.

### 100. Home/people discovery — Recommend

**Source file:** `WhatsApp Image 2026-10-18 at 14.47.23.jpeg`

**Visible structure and purpose:** The Recommend tab shows a stream of user profiles with avatars, names, level/status chips, short bios and a pink HI button. The same top-level discovery controls—search, filters/globe and trophy-like shortcut—remain available for other discovery modes.

**Interaction and state clues:** Recommendation ranking is a backend concern; the client should preserve a consistent row hierarchy and support opening a profile, greeting the user, and scrolling for more results.

**React Native implementation notes:** Use a single profile-directory screen with a `mode` parameter, paginated API results and analytics for profile opens/HI actions. Make tab and button hit targets accessible and localize all labels.


---

## Consolidated React Native implementation recommendations

### 1. Suggested application layers

- **Navigation:** React Navigation with a bottom-tab navigator for Home, Moments, Rooms, Messages and Me, plus nested stack navigators for profile, room, store, membership, settings and utility routes. Use modal presentation for invitation selectors, room details, context menus and intimacy sheets.
- **UI primitives:** a single design-token source for colors, typography, spacing, radii, gradients and elevation. Define light/social, live-room and premium/store themes without scattering values across screens.
- **Server state:** TanStack Query (or an equivalent server-state layer) for profiles, room lists, inboxes, store catalogs, tasks, memberships and family data. Use optimistic updates selectively for likes/read state, but not for financial transactions.
- **Local UI state:** small screen-level state for selected tabs, selected gift, quantity, open sheets, search text and filters. Keep durable data such as balances and entitlements server-authoritative.
- **Real-time:** a WebSocket-based event layer for room occupancy, live chat, private messages, gift notifications and presence. If voice is required, choose a dedicated real-time audio provider/stack and validate its current React Native support before implementation.
- **Media and animation:** image caching and a deliberate animation layer for gifts/room effects. Lazy-load large decorative assets and include reduced-motion behavior where feasible.
- **Backend domains:** users/profiles, rooms/seats, chat/messages, relationships/invitations, gifts/wallet/transactions, memberships/entitlements, store/inventory, tasks/rewards, moderation and notifications.

### 2. Build reusable shells before individual pages

Prioritize common shells in this order:

1. **Primary navigation and screen headers** — establish safe areas, tab badges, back navigation, search and consistent loading/error handling.
2. **Profile shell** — cover/identity, profile tabs, tag/info rows, sticky contact footer. It appears in multiple distinct screenshots and will reduce duplication immediately.
3. **Room shell and GiftPanel** — one room canvas with seat grid, chat overlay and bottom panel; category data changes without rebuilding the room. Add room actions and details as independent sheets.
4. **Catalog shell** — shared gift/store cards, category tabs, filters, price/duration/eligibility metadata and purchase confirmation.
5. **Membership shell** — common tier selector, hero emblem, progress line, privilege grid and upgrade/recharge CTA; rank/tier differences belong in data.
6. **Message and social primitives** — conversation rows, message bubbles, Moment cards, discovery user rows, room cards and family cards.

### 3. Data contracts worth defining early

- **User:** `id`, display name, avatar, cover, locale, status/level badges, profile tags, visibility flags, counters and optional attributes.
- **Room:** `id`, title, host, cover/background, language/region, category, seat list, occupancy, activity count, chat permissions and room rules.
- **Gift/product:** `id`, title, category, image/animation, currency/price, duration, required level, eligibility constraints, novelty/availability state, inventory state and optional random-reward metadata.
- **Relationship:** `id`, participants, kind, status, created/expiry timestamps, progress/intimacy points, level, and unlocked rewards.
- **Membership tier:** `id`, family (VIP/SVIP/Aristocracy), level/rank, activation period, price/currency, progress thresholds, perks, current/preview/locked status.
- **Task:** `id`, title, progress, target, reward/currency, expiration, completion and claim state.
- **Message:** `id`, conversation/room ID, sender, timestamp, type, payload, delivery/read state, and optional moderation metadata.

### 4. Quality and risk checklist

- Confirm exact user-facing prices and tier labels against the original high-resolution assets before entering final copy; small labels are not all legible in the montage.
- Keep payment, wallet exchange, gift send, Lucky/jackpot and membership activation server-validated and auditable.
- Add report/block/mute controls and moderation-friendly states wherever live rooms, messages and user discovery are present.
- Support Arabic, RTL layout, emoji, decorative names and long user-generated text without clipping or overlapping badges.
- Test narrow/large screens, safe areas, keyboard presentation, slow image loading, empty inventory, no network, rejected invitations and failed payments.
- Use accessibility labels for icon-only controls and don't convey selection, premium access or unread status by color alone.

## Limitations and next step

This is a **visual and structural reference analysis** based on the supplied still images. It cannot confirm hidden interactions, API semantics, exact animation timing, server transaction rules, or behavior that is not visible in the captures. Before implementation, validate uncertain labels/prices from the original images and make a small clickable prototype of the main flows (room → gifts; profile → relationship; inbox → chat; membership → store) to confirm the screen architecture.
