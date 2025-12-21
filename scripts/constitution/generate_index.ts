import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

type CanonicalDoc = {
  id: string;
  filename: string;
};

type IndexDoc = {
  id: string;
  title: string;
  path: string;
  sha256: string;
};

type ConstitutionIndex = {
  schemaVersion: 1;
  documents: IndexDoc[];
};

const REQUIRED_DOCS: CanonicalDoc[] = [
  { id: 'CRITERIO_FORMAL_DE_ACEITE_DE_INTERFACE', filename: 'CRITERIO_FORMAL_DE_ACEITE_DE_INTERFACE.md' },
  { id: 'MANUAL_DE_CONSTRUCAO_MYCELIUM_FRONTEND_v1.0', filename: 'MANUAL_DE_CONSTRUCAO_MYCELIUM_FRONTEND_v1.0.md' },
  { id: 'ADR-001-Instituicao-Manual-Frontend-Mycelium', filename: 'ADR-001-Instituicao-Manual-Frontend-Mycelium.md' },
  { id: 'GUIA_COMPLEMENTAR_COGNITIVE_PUZZLE', filename: 'GUIA_COMPLEMENTAR_COGNITIVE_PUZZLE.md' },
];

const ROOT = process.cwd();
const CONSTITUTION_DIR = path.join(ROOT, 'CONSTITUICAO');
const INDEX_PATH = path.join(CONSTITUTION_DIR, 'index.json');

function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function titleFromMarkdown(content: string, fallback: string): string {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.replace(/^#\s+/, '').trim();
    }
  }
  return fallback;
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function main() {
  if (!fs.existsSync(CONSTITUTION_DIR)) {
    console.error('[CONSTITUTION] Pasta CONSTITUICAO/ nao encontrada.');
    process.exit(1);
  }

  const missing: string[] = [];
  const documents: IndexDoc[] = [];

  for (const doc of REQUIRED_DOCS) {
    const absPath = path.join(CONSTITUTION_DIR, doc.filename);
    if (!fs.existsSync(absPath)) {
      missing.push(doc.filename);
      continue;
    }

    const buffer = fs.readFileSync(absPath);
    const content = buffer.toString('utf8');
    const title = titleFromMarkdown(content, doc.id);

    documents.push({
      id: doc.id,
      title,
      path: toPosix(path.join('CONSTITUICAO', doc.filename)),
      sha256: sha256(buffer),
    });
  }

  if (missing.length > 0) {
    console.error('[CONSTITUTION] Arquivos canonicos ausentes:', missing.join(', '));
    process.exit(1);
  }

  const index: ConstitutionIndex = {
    schemaVersion: 1,
    documents,
  };

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log('[CONSTITUTION] index.json atualizado.');
}

main();
