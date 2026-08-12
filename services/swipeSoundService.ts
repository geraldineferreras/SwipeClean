import { Audio, type AVPlaybackSource } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import {
  createDeleteSwooshBase64,
  createKeepSwooshBase64,
} from '@/utils/generateSwooshWav';

type SwipeDecisionSound = 'keep' | 'delete';

const KEEP_SOUND_FILE = 'swipeclean-keep-swoosh-v2.wav';
const DELETE_SOUND_FILE = 'swipeclean-delete-swoosh-v2.wav';

let audioModeReady = false;
let keepSource: AVPlaybackSource | null = null;
let deleteSource: AVPlaybackSource | null = null;
let keepSound: Audio.Sound | null = null;
let deleteSound: Audio.Sound | null = null;

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) {
    return;
  }

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
  audioModeReady = true;
}

async function writeCachedWav(filename: string, base64: string): Promise<string> {
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  return uri;
}

async function loadSound(source: AVPlaybackSource): Promise<Audio.Sound> {
  const { sound } = await Audio.Sound.createAsync(source, {
    shouldPlay: false,
    volume: 0.38,
  });
  return sound;
}

export async function preloadSwipeSounds(): Promise<void> {
  await ensureAudioMode();

  if (!keepSource) {
    const keepUri = await writeCachedWav(KEEP_SOUND_FILE, createKeepSwooshBase64());
    keepSource = { uri: keepUri };
  }

  if (!deleteSource) {
    const deleteUri = await writeCachedWav(
      DELETE_SOUND_FILE,
      createDeleteSwooshBase64(),
    );
    deleteSource = { uri: deleteUri };
  }

  if (!keepSound && keepSource) {
    keepSound = await loadSound(keepSource);
  }

  if (!deleteSound && deleteSource) {
    deleteSound = await loadSound(deleteSource);
  }
}

export async function playSwipeSound(decision: SwipeDecisionSound): Promise<void> {
  try {
    await preloadSwipeSounds();

    const sound = decision === 'keep' ? keepSound : deleteSound;
    if (!sound) {
      return;
    }

    await sound.setPositionAsync(0);
    await sound.replayAsync();
  } catch {
    // Sound is optional feedback — ignore playback failures.
  }
}

export async function unloadSwipeSounds(): Promise<void> {
  await keepSound?.unloadAsync();
  await deleteSound?.unloadAsync();
  keepSound = null;
  deleteSound = null;
}
