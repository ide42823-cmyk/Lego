import type { VoiceRoomAdapter } from './types';

export type VoiceProvider = 'livekit';

/**
 * Creates a voice-room adapter for the chosen provider.
 *
 * The provider module is imported lazily so its native-backed code is only
 * loaded when a room is actually joined — important because importing the
 * WebRTC globals has side effects and is unavailable in Expo Go.
 */
export async function createVoiceRoomAdapter(
  provider: VoiceProvider = 'livekit',
): Promise<VoiceRoomAdapter> {
  switch (provider) {
    case 'livekit': {
      const { LiveKitVoiceRoomAdapter } = await import('./providers/livekit');
      return new LiveKitVoiceRoomAdapter();
    }
    default: {
      throw new Error(`Unsupported voice provider: ${String(provider)}`);
    }
  }
}

export type {
  Unsubscribe,
  VoiceConnectionState,
  VoiceJoinInput,
  VoiceParticipant,
  VoiceRoomAdapter,
} from './types';
