export function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

export async function readUploadText(blob: Blob): Promise<string> {
  // Never destructure Blob methods; keep `this` bound when calling.
  if (typeof (blob as { text?: unknown }).text === 'function') {
    return await (blob as { text: () => Promise<string> }).text();
  }

  if (typeof (blob as { arrayBuffer?: unknown }).arrayBuffer === 'function') {
    const ab = await (blob as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
    return new TextDecoder().decode(ab);
  }

  if (typeof FileReader !== 'undefined') {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
      reader.readAsText(blob);
    });
  }

  throw new Error('UNSUPPORTED_BLOB_TEXT');
}

export async function readUploadArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  // Never destructure Blob methods; keep `this` bound when calling.
  if (typeof (blob as { arrayBuffer?: unknown }).arrayBuffer === 'function') {
    return await (blob as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
  }

  if (typeof FileReader !== 'undefined') {
    return await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
      reader.readAsArrayBuffer(blob);
    });
  }

  throw new Error('UNSUPPORTED_BLOB_ARRAYBUFFER');
}

export async function readUploadBytes(blob: Blob): Promise<Uint8Array> {
  const ab = await readUploadArrayBuffer(blob);
  return new Uint8Array(ab);
}

export async function readFormDataFileText(value: FormDataEntryValue | null): Promise<string | null> {
  if (typeof value === 'string') return value;
  if (isBlob(value)) return await readUploadText(value);

  if (value && typeof value === 'object') {
    const maybeText = (value as { text?: unknown }).text;
    if (typeof maybeText === 'function') {
      return (await (value as { text: () => Promise<string> }).text()) as string;
    }

    const maybeArrayBuffer = (value as { arrayBuffer?: unknown }).arrayBuffer;
    if (typeof maybeArrayBuffer === 'function') {
      const ab = (await (value as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer()) as ArrayBuffer;
      return new TextDecoder().decode(ab);
    }
  }

  return null;
}

export function getFormDataFileName(value: FormDataEntryValue | null, fallback = 'upload.csv'): string {
  if (value && typeof value === 'object') {
    const maybeName = (value as { name?: unknown }).name;
    if (typeof maybeName === 'string' && maybeName.trim()) return maybeName;
  }
  return fallback;
}
