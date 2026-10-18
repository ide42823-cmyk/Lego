import { AudioSession, registerGlobals } from '@livekit/react-native';
import { ConnectionState, Room, RoomEvent, type Participant } from 'livekit-client';

import type {
  Unsubscribe,
  VoiceConnectionState,
  VoiceJoinInput,
  VoiceParticipant,
  VoiceRoomAdapter,
} from '../types';

/**
 * Maps the vendor's connection states onto our own vocabulary so feature code
 * never branches on LiveKit-specific enums.
 */
const CONNECTION_STATE_MAP: Record<ConnectionState, VoiceConnectionState> = {
  [ConnectionState.Disconnected]: 'disconnected',
  [ConnectionState.Connecting]: 'connecting',
  [ConnectionState.Connected]: 'connected',
  [ConnectionState.Reconnecting]: 'reconnecting',
  [ConnectionState.SignalReconnecting]: 'reconnecting',
};

function toVoiceParticipant(
  participant: Participant,
  localIdentity: string | null,
): VoiceParticipant {
  return {
    id: participant.identity,
    isLocal: participant.identity === localIdentity,
    isSpeaking: participant.isSpeaking,
    isMicrophoneEnabled: participant.isMicrophoneEnabled,
  };
}

/**
 * LiveKit implementation of {@link VoiceRoomAdapter}.
 *
 * Requires a development build — `@livekit/react-native-webrtc` ships native
 * code and is not available in Expo Go. Verified only at the JS/type level so
 * far; on-device audio is still untested (see docs/decisions/0002).
 */
export class LiveKitVoiceRoomAdapter implements VoiceRoomAdapter {
  private room: Room | null = null;
  private globalsRegistered = false;

  private readonly participantListeners = new Set<(participant: VoiceParticipant) => void>();
  private readonly stateListeners = new Set<(state: VoiceConnectionState) => void>();

  async initialize(): Promise<void> {
    if (this.globalsRegistered) {
      return;
    }
    // Must run before any LiveKit usage; it wires WebRTC globals into the JS runtime.
    registerGlobals();
    this.globalsRegistered = true;
  }

  async join({ url, token }: VoiceJoinInput): Promise<void> {
    await this.initialize();

    const room = new Room();
    this.room = room;

    room
      .on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        this.emitState(CONNECTION_STATE_MAP[state] ?? 'failed');
      })
      .on(RoomEvent.ParticipantConnected, () => this.emitParticipants())
      .on(RoomEvent.ParticipantDisconnected, () => this.emitParticipants())
      .on(RoomEvent.ActiveSpeakersChanged, () => this.emitParticipants())
      .on(RoomEvent.TrackMuted, () => this.emitParticipants())
      .on(RoomEvent.TrackUnmuted, () => this.emitParticipants());

    this.emitState('connecting');

    // iPhone/Android audio session must be active before publishing a mic track.
    await AudioSession.startAudioSession();
    await room.connect(url, token);
    await room.localParticipant.setMicrophoneEnabled(true);

    this.emitState('connected');
    this.emitParticipants();
  }

  async leave(): Promise<void> {
    const room = this.room;
    if (!room) {
      return;
    }
    this.room = null;
    this.emitState('disconnected');
    await room.disconnect();
    await AudioSession.stopAudioSession();
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (!this.room) {
      return;
    }
    await this.room.localParticipant.setMicrophoneEnabled(enabled);
    this.emitParticipants();
  }

  onParticipantChanged(listener: (participant: VoiceParticipant) => void): Unsubscribe {
    this.participantListeners.add(listener);
    return () => {
      this.participantListeners.delete(listener);
    };
  }

  onConnectionStateChanged(listener: (state: VoiceConnectionState) => void): Unsubscribe {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  async dispose(): Promise<void> {
    await this.leave();
    this.participantListeners.clear();
    this.stateListeners.clear();
  }

  private emitState(state: VoiceConnectionState): void {
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  private emitParticipants(): void {
    const room = this.room;
    if (!room) {
      return;
    }
    const localIdentity = room.localParticipant.identity;
    const participants: Participant[] = [
      room.localParticipant,
      ...room.remoteParticipants.values(),
    ];
    for (const participant of participants) {
      const value = toVoiceParticipant(participant, localIdentity);
      for (const listener of this.participantListeners) {
        listener(value);
      }
    }
  }
}
