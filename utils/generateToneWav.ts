function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

export function createToneWavBytes(
  frequency: number,
  durationMs: number,
  volume = 0.28,
): Uint8Array {
  const sampleRate = 22050;
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

  for (let i = 0; i < numSamples; i += 1) {
    const time = i / sampleRate;
    const attack = Math.min(1, i / 60);
    const release = Math.max(0, 1 - Math.max(0, i - numSamples + 120) / 120);
    const envelope = attack * release;
    const sample = Math.sin(2 * Math.PI * frequency * time) * envelope * volume;
    bytes[44 + i] = Math.max(0, Math.min(255, Math.floor((sample + 1) * 127.5)));
  }

  return bytes;
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

export function createToneWavBase64(frequency: number, durationMs: number): string {
  return bytesToBase64(createToneWavBytes(frequency, durationMs));
}
