/** expo-file-system モック */

// インメモリのファイルシステムをシミュレート
const fileStore: Map<string, { content: string; name: string }> = new Map();
const dirStore: Set<string> = new Set();

/** モック用: ストアをリセットする */
export function __resetStore(): void {
  fileStore.clear();
  dirStore.clear();
}

/** モック用: ストアの中身を取得する */
export function __getFileContent(uri: string): string | undefined {
  return fileStore.get(uri)?.content;
}

export class File {
  uri: string;
  name: string;

  constructor(...args: unknown[]) {
    if (args.length === 1 && typeof args[0] === 'string') {
      // new File(uri)
      this.uri = args[0];
      this.name = args[0].split('/').pop() ?? '';
    } else if (args.length === 2) {
      // new File(directory, fileName)
      const dir = args[0] as { uri: string };
      const fileName = args[1] as string;
      this.uri = `${dir.uri}/${fileName}`;
      this.name = fileName;
    } else {
      this.uri = '';
      this.name = '';
    }
  }

  get exists(): boolean {
    return fileStore.has(this.uri);
  }

  get size(): number {
    const entry = fileStore.get(this.uri);
    return entry ? new TextEncoder().encode(entry.content).length : 0;
  }

  create(): void {
    if (!fileStore.has(this.uri)) {
      fileStore.set(this.uri, { content: '', name: this.name });
    }
  }

  write(content: string): void {
    fileStore.set(this.uri, { content, name: this.name });
  }

  textSync(): string {
    return fileStore.get(this.uri)?.content ?? '';
  }

  delete(): void {
    fileStore.delete(this.uri);
  }

  open(): MockFileHandle {
    return new MockFileHandle(this.uri);
  }
}

class MockFileHandle {
  private uri: string;
  offset: number = 0;

  constructor(uri: string) {
    this.uri = uri;
  }

  get size(): number {
    const entry = fileStore.get(this.uri);
    return entry ? new TextEncoder().encode(entry.content).length : 0;
  }

  writeBytes(bytes: Uint8Array): void {
    const existing = fileStore.get(this.uri);
    const newText = new TextDecoder().decode(bytes);
    if (existing) {
      existing.content = existing.content + newText;
      fileStore.set(this.uri, existing);
    }
  }

  close(): void {
    // noop
  }
}

export class Directory {
  uri: string;

  constructor(...args: unknown[]) {
    if (args.length === 2) {
      const base = args[0] as { uri: string };
      const name = args[1] as string;
      this.uri = `${base.uri}/${name}`;
    } else if (args.length === 1 && typeof args[0] === 'string') {
      this.uri = args[0];
    } else {
      this.uri = '';
    }
  }

  get exists(): boolean {
    return dirStore.has(this.uri);
  }

  create(): void {
    dirStore.add(this.uri);
  }

  list(): File[] {
    const files: File[] = [];
    for (const [uri, entry] of fileStore.entries()) {
      if (uri.startsWith(this.uri + '/')) {
        const file = new File(uri);
        file.name = entry.name;
        // nameをFile(uri)構築時にも付与
        Object.defineProperty(file, 'name', { value: entry.name, writable: true });
        files.push(file);
      }
    }
    return files;
  }
}

export const Paths = {
  document: { uri: 'file:///document' },
};
