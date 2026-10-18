import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { env } from '@/core/config/env';
import {
  createVoiceRoomAdapter,
  type VoiceConnectionState,
  type VoiceParticipant,
  type VoiceRoomAdapter,
} from '@/core/rtc';

/**
 * DEVELOPMENT SPIKE ONLY (P2).
 *
 * A throwaway harness for exercising the LiveKit adapter on a real device. It is
 * not part of the product UI and will be deleted once P5 builds the real room.
 * Paste a short-lived token from a LiveKit server; never paste a long-lived key.
 *
 * For automation, `url` and `token` may also be supplied as deep-link query
 * parameters so a device harness can be driven without typing a JWT on-device:
 *   adb shell am start -a android.intent.action.VIEW \
 *     -d "letgo://dev/rtc-spike?token=<jwt>"
 */

async function ensureMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS/macOS prompt is triggered by WebRTC when capture starts.
    return true;
  }
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export default function RtcSpikeScreen() {
  const params = useLocalSearchParams<{ url?: string; token?: string }>();
  const adapterRef = useRef<VoiceRoomAdapter | null>(null);
  const [url, setUrl] = useState(params.url ?? env.livekitUrl ?? '');
  const [token, setToken] = useState(params.token ?? '');
  const [connectionState, setConnectionState] = useState<VoiceConnectionState>('idle');
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      void adapterRef.current?.dispose();
    };
  }, []);

  const getAdapter = useCallback(async (): Promise<VoiceRoomAdapter> => {
    if (adapterRef.current) {
      return adapterRef.current;
    }
    const adapter = await createVoiceRoomAdapter('livekit');
    adapter.onConnectionStateChanged(setConnectionState);
    adapter.onParticipantChanged((participant) => {
      setParticipants((previous) => [
        ...previous.filter((item) => item.id !== participant.id),
        participant,
      ]);
    });
    adapterRef.current = adapter;
    return adapter;
  }, []);

  const handleConnect = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      if (!url.trim() || !token.trim()) {
        throw new Error('A LiveKit URL and a short-lived token are required.');
      }
      const granted = await ensureMicrophonePermission();
      if (!granted) {
        throw new Error('Microphone permission denied.');
      }
      const adapter = await getAdapter();
      await adapter.join({
        url: url.trim(),
        token: token.trim(),
        channelId: 'spike',
        userId: 'spike-user',
      });
      setMicEnabled(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setConnectionState('failed');
    } finally {
      setBusy(false);
    }
  }, [getAdapter, token, url]);

  const handleLeave = useCallback(async () => {
    setBusy(true);
    try {
      await adapterRef.current?.leave();
      setParticipants([]);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleToggleMic = useCallback(async () => {
    if (!adapterRef.current) {
      return;
    }
    setBusy(true);
    try {
      await adapterRef.current.setMicrophoneEnabled(!micEnabled);
      setMicEnabled((value) => !value);
    } finally {
      setBusy(false);
    }
  }, [micEnabled]);

  const connected = connectionState === 'connected';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>RTC spike (dev only)</Text>
        <Text style={styles.caption}>LiveKit adapter smoke test. Not product UI.</Text>

        <Text style={styles.label}>LiveKit URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="ws://192.168.3.16:7880"
          placeholderTextColor="#8A8A8E"
        />

        <Text style={styles.label}>Access token</Text>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          placeholder="short-lived JWT"
          placeholderTextColor="#8A8A8E"
        />

        <Text style={styles.status}>state: {connectionState}</Text>
        <Text style={styles.status}>participants: {participants.length}</Text>
        {participants.map((participant) => (
          <Text key={participant.id} style={styles.status}>
            • {participant.id}
            {participant.isLocal ? ' (you)' : ''} {participant.isSpeaking ? '🔊' : ''}{' '}
            {participant.isMicrophoneEnabled ? 'mic on' : 'muted'}
          </Text>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          disabled={busy}
          onPress={connected ? handleLeave : handleConnect}
        >
          <Text style={styles.buttonLabel}>{connected ? 'Leave' : 'Connect'}</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondary, (!connected || busy) && styles.buttonDisabled]}
          disabled={!connected || busy}
          onPress={handleToggleMic}
        >
          <Text style={styles.buttonLabel}>{micEnabled ? 'Mute' : 'Unmute'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 20, gap: 10 },
  heading: { fontSize: 22, fontWeight: '700' },
  caption: { fontSize: 13, color: '#6B6B70' },
  label: { marginTop: 8, fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#D6D6DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  status: { fontSize: 14 },
  error: { color: '#D64550', fontSize: 14 },
  button: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  secondary: { backgroundColor: '#3F3F46' },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
