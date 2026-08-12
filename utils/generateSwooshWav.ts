function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;

    result += chars[a >> 2];
    result += chars[((a & 3) << 4) | (b >> 4)];
    result += i + 1 < bytes.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
    result += i + 2 < bytes.length ? chars[c & 63] : '=';
  }

  return result;
}

interface SwooshOptions {
  startFreq: number;
  endFreq: number;
  durationMs: number;
  volume?: number;
  seed?: number;
}

function seededNoise(seed: number, index: number): number {
  const value = Math.sin(seed * 9999 + index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function smoothEnvelope(progress: number): number {
  const attack = Math.min(1, progress / 0.22);
  const release = 1 - Math.pow(Math.max(0, progress - 0.5) / 0.5, 1.8);
  return attack * release;
}

export function createSwooshWavBytes({
  startFreq,
  endFreq,
  durationMs,
  volume = 0.26,
  seed = 1,
}: SwooshOptions): Uint8Array {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const bytes = new Uint8Array(44 + numSamples);
  const view = new DataView(bytes.buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples, true);

  let noiseState = 0;
  let softState = 0;
  let phase = 0;

  for (let i = 0; i < numSamples; i += 1) {
    const progress = i / Math.max(1, numSamples - 1);
    const envelope = smoothEnvelope(progress);
    const freq = startFreq + (endFreq - startFreq) * progress;

    const white = seededNoise(seed, i) * 2 - 1;
    noiseState = noiseState * 0.94 + white * 0.06;
    softState = softState * 0.97 + noiseState * 0.03;

    phase += (2 * Math.PI * freq) / sampleRate;
    const breeze = Math.sin(phase) * 0.06;

    const sample = (softState * 0.7 + breeze) * envelope * volume;

    bytes[44 + i] = Math.max(0, Math.min(255, Math.floor((sample + 1) * 127.5)));
  }

  return bytes;
}

export function createKeepSwooshBase64(): string {
  return bytesToBase64(
    createSwooshWavBytes({
      startFreq: 480,
      endFreq: 1450,
      durationMs: 320,
      volume: 0.22,
      seed: 17,
    }),
  );
}

export function createDeleteSwooshBase64(): string {
  return bytesToBase64(
    createSwooshWavBytes({
      startFreq: 720,
      endFreq: 260,
      durationMs: 340,
      volume: 0.24,
      seed: 41,
    }),
  );
}
