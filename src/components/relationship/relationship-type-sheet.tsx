import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import type {
  RelationshipOffer,
  RelationshipTypeKey,
} from '@/core/data/types';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { GradientFill } from '../ui/gradient-fill';
import { Icon } from '../ui/icon';

/**
 * The sheet carries its own fixed pastel identity, tinted by the selection —
 * lavender for Friend, pink for Couple — independent of the colour scheme,
 * exactly like the reference. So the palette is fixed here, per kind.
 */
const PALETTES: Record<
  RelationshipTypeKey,
  {
    sheet: string;
    cardTop: string;
    cardBottom: string;
    glyph: 'flower' | 'heart';
    glyphTint: string;
    inviteTile: string;
    inviteTileTint: string;
    cta: string;
    nameShadow: string;
  }
> = {
  couple: {
    sheet: '#FFEDF6',
    cardTop: '#FFDDEC',
    cardBottom: '#FFA9CE',
    glyph: 'heart',
    glyphTint: '#FB6FB0',
    inviteTile: '#FFE7F2',
    inviteTileTint: '#FB6FB0',
    cta: '#F7599F',
    nameShadow: 'rgba(196, 60, 125, 0.45)',
  },
  friend: {
    sheet: '#F5F0FE',
    cardTop: '#EADBFF',
    cardBottom: '#C7A2FB',
    glyph: 'flower',
    glyphTint: '#B084F2',
    inviteTile: '#EFE7FF',
    inviteTileTint: '#B084F2',
    cta: '#9E7BF7',
    nameShadow: 'rgba(110, 70, 190, 0.45)',
  },
};

/** The unselected pill reads quieter on either wash. */
const MUTED = '#918CA4';
const INK = '#1E1B26';

export interface RelationshipTypeSheetProps {
  visible: boolean;
  /** The member issuing the invitation: the signed-in viewer. */
  viewer: { displayName: string; avatarUrl?: string };
  /** The member receiving the invitation: the profile being visited. */
  person: { displayName: string; avatarUrl?: string };
  /** The invitation cards, in display order. Server-priced, display-only. */
  offers: RelationshipOffer[];
  selected: RelationshipTypeKey;
  onSelect: (key: RelationshipTypeKey) => void;
  /**
   * Sending the invitation is a server-owned, two-sided flow — the page owns
   * the gate; the sheet reports the chosen offer out.
   */
  onInvite: (offer: RelationshipOffer) => void;
  /** The help affordance is a backend surface. */
  onHelp: () => void;
  onClose: () => void;
}

/**
 * The relationship chooser (references 016, 017, 020): a pastel sheet over the
 * dimmed profile. The Couple/Friend pills switch the card in place; the card
 * pairs both members under the kind's mark, then the invitation card with its
 * server-configured coin price. The CTA reports out — nothing here can form a
 * relationship, and the 24-hour expiry and refund are server facts.
 */
export function RelationshipTypeSheet({
  visible,
  viewer,
  person,
  offers,
  selected,
  onSelect,
  onInvite,
  onHelp,
  onClose,
}: RelationshipTypeSheetProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { height } = useWindowDimensions();

  if (!visible || offers.length === 0) {
    return null;
  }

  const offer = offers.find((candidate) => candidate.id === selected) ?? offers[0];
  const tint = PALETTES[offer.id];

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.scrim}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: tint.sheet, maxHeight: height * 0.9, paddingBottom: insets.bottom + Spacing.three },
          ]}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onClose}
              style={styles.headerControl}
            >
              <Icon name="back" size={22} color={INK} strokeWidth={2.1} />
            </Pressable>
            <ThemedText style={styles.title}>Choose Relationship Type</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Help"
              onPress={onHelp}
              style={styles.headerControl}
            >
              <Text style={styles.helpMark}>?</Text>
            </Pressable>
          </View>

          <View style={styles.pills}>
            {offers.map((candidate) => {
              const checked = candidate.id === offer.id;
              return (
                <Pressable
                  key={candidate.id}
                  accessibilityRole="radio"
                  accessibilityLabel={candidate.label}
                  accessibilityState={{ checked }}
                  onPress={() => onSelect(candidate.id)}
                  style={({ pressed }) => [
                    styles.pill,
                    checked && styles.pillChecked,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <ThemedText
                    style={checked ? styles.pillCheckedLabel : styles.pillLabel}
                  >
                    {candidate.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View
            key={offer.id}
            style={[styles.card, { backgroundColor: tint.cardBottom }]}
            accessibilityLabel={`${offer.label} invitation card`}
          >
            <GradientFill from={tint.cardTop} to={tint.cardBottom} vertical />
            <View style={styles.cardInner}>
              <View style={styles.crest}>
                <Icon name={tint.glyph} size={36} color={tint.glyphTint} strokeWidth={1.8} />
              </View>
              <View style={styles.pair}>
                <View style={styles.member}>
                  <Avatar
                    id="relationship-viewer"
                    name={viewer.displayName}
                    uri={viewer.avatarUrl}
                    size={92}
                    radius={46}
                  />
                  <ThemedText
                    style={[styles.memberName, { textShadowColor: tint.nameShadow }]}
                    numberOfLines={1}
                  >
                    {viewer.displayName}
                  </ThemedText>
                </View>
                <View style={styles.member}>
                  <Avatar
                    id="relationship-person"
                    name={person.displayName}
                    uri={person.avatarUrl}
                    size={92}
                    radius={46}
                  />
                  <ThemedText
                    style={[styles.memberName, { textShadowColor: tint.nameShadow }]}
                    numberOfLines={1}
                  >
                    {person.displayName}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.offerCard}>
                <View style={styles.offerCopy}>
                  <View style={styles.offerTitle}>
                    <ThemedText style={styles.offerTitleText}>
                      {offer.label} Invitation Card
                    </ThemedText>
                    <Icon name="coin" size={17} color="#F5A700" />
                    <ThemedText style={styles.offerCoins}>{offer.coins}</ThemedText>
                  </View>
                  <ThemedText style={styles.offerHint}>
                    Send an invitation card to invite the other member. The
                    relationship exists once they accept.
                  </ThemedText>
                </View>
                <View style={[styles.inviteTile, { backgroundColor: tint.inviteTile }]}>
                  <Icon
                    name={tint.glyph}
                    size={30}
                    color={tint.inviteTileTint}
                    strokeWidth={1.8}
                  />
                </View>
              </View>
            </View>
          </View>

          <ThemedText style={styles.disclaimer}>
            {`If your invitation is not accepted within ${offer.validityHours} hours it expires, and the coins are returned by the server.`}
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Invite to Form a Relationship"
            onPress={() => onInvite(offer)}
            style={({ pressed }) => [styles.cta, { backgroundColor: tint.cta }, pressed && { opacity: 0.88 }]}
          >
            <ThemedText style={styles.ctaLabel}>Invite to Form a Relationship</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(24, 18, 34, 0.55)',
  },
  sheet: {
    borderTopStartRadius: 28,
    borderTopEndRadius: 28,
    paddingTop: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    height: 44,
  },
  headerControl: {
    padding: Spacing.one,
  },
  /** The reference centres its title between the two controls. */
  title: {
    color: INK,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  helpMark: {
    color: INK,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  pills: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },
  pill: {
    borderRadius: Radius.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    backgroundColor: 'rgba(146, 132, 190, 0.16)',
  },
  pillChecked: {
    backgroundColor: '#FFFFFF',
  },
  pillLabel: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  pillCheckedLabel: {
    color: INK,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  /** Paints above `GradientFill`: see the me-wallet-card web stacking note. */
  cardInner: {
    position: 'relative',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  crest: {
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  pair: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  member: {
    alignItems: 'center',
    gap: Spacing.one,
    flex: 1,
    maxWidth: 150,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.three,
  },
  offerCopy: {
    flex: 1,
    gap: 3,
  },
  offerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offerTitleText: {
    color: INK,
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: '700',
  },
  offerCoins: {
    color: INK,
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: '700',
  },
  offerHint: {
    color: '#8B8694',
    fontSize: 13,
    lineHeight: 18,
  },
  inviteTile: {
    width: 56,
    height: 56,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    color: '#8B8694',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  cta: {
    borderRadius: Radius.pill,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
});
