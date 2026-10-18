/**
 * Transport-agnostic voice-room contract (architecture doc §9.4).
 *
 * Feature code and the room session controller depend on this interface only.
 * Vendor SDKs (LiveKit today, Agora as the documented alternative) live behind
 * `src/core/rtc/providers/*` and must never be imported by feature components.
 */

export type VoiceConnectionState =
  'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

export interface VoiceJoinInput {
  /** WebSocket URL of the RTC backend (e.g. a LiveKit server `wss://` URL). */
  url: string;
  /** Short-lived, room- and role-scoped token issued by our backend — never a long-lived key. */
  token: string;
  /** Logical room id, used for logging/telemetry. */
  channelId: string;
  /** Stable user id. */
  userId: string;
}

export interface VoiceParticipant {
  id: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isMicrophoneEnabled: boolean;
}

export type Unsubscribe = () => void;

export interface VoiceRoomAdapter {
  /** Prepare the provider once (registers WebRTC globals, audio session, etc.). */
  initialize(): Promise<void>;
  join(input: VoiceJoinInput): Promise<void>;
  leave(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  onParticipantChanged(listener: (participant: VoiceParticipant) => void): Unsubscribe;
  onConnectionStateChanged(listener: (state: VoiceConnectionState) => void): Unsubscribe;
  dispose(): Promise<void>;
}
