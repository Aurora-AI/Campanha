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

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function fail(message: string) {
  console.error(`[CONSTITUTION] ${message}`);
  process.exitCode = 1;
}

function main() {
  if (!fs.existsSync(CONSTITUTION_DIR)) {
    fail('Pasta CONSTITUICAO/ nao encontrada.');
    return;
  }

  if (!fs.existsSync(INDEX_PATH)) {
    fail('index.json nao encontrado. Rode: npm run constitution:index');
    return;
  }

  const raw = fs.readFileSync(INDEX_PATH, 'utf8');
  const parsed = JSON.parse(raw) as ConstitutionIndex;

  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.documents)) {
    fail('index.json invalido (schemaVersion ou documents).');
    return;
  }

  const requiredById = new Map(REQUIRED_DOCS.map((doc) => [doc.id, doc]));
  const indexById = new Map(parsed.documents.map((doc) => [doc.id, doc]));

  for (const doc of REQUIRED_DOCS) {
    if (!indexById.has(doc.id)) {
      fail(`Documento obrigatorio ausente no index: ${doc.id}`);
    }
  }

  for (const doc of parsed.documents) {
    if (!requiredById.has(doc.id)) {
      fail(`Documento inesperado no index: ${doc.id}`);
    }
  }

  for (const doc of REQUIRED_DOCS) {
    const indexDoc = indexById.get(doc.id);
    const absPath = path.join(CONSTITUTION_DIR, doc.filename);
    if (!fs.existsSync(absPath)) {
      fail(`Documento obrigatorio ausente: ${doc.filename}`);
      continue;
    }

    if (!indexDoc) continue;

    const expectedPath = toPosix(path.join('CONSTITUICAO', doc.filename));
    if (indexDoc.path !== expectedPath) {
      fail(`Path divergente em index.json (${doc.id}): esperado ${expectedPath}, atual ${indexDoc.path}`);
    }

    const buffer = fs.readFileSync(absPath);
    const actualHash = sha256(buffer);
    if (actualHash !== indexDoc.sha256) {
      fail(`Hash divergente em ${doc.filename}: esperado ${indexDoc.sha256}, atual ${actualHash}`);
    }
  }

  const mdFiles = fs.readdirSync(CONSTITUTION_DIR).filter((name) => name.toLowerCase().endsWith('.md'));
  const allowed = new Set(REQUIRED_DOCS.map((doc) => doc.filename).concat('README.md'));
  const extras = mdFiles.filter((name) => !allowed.has(name));
  if (extras.length > 0) {
    fail(`Arquivos extras nao indexados em CONSTITUICAO/: ${extras.join(', ')}`);
  }

  if (process.exitCode) {
    process.exit(1);
  }

  console.log('[CONSTITUTION] PASS - Constituicao consistente.');
}

main();
