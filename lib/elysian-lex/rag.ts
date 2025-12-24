// lib/elysian-lex/rag.ts
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

// Custom Simple Vector Store for MVP Isolation
class SimpleVectorStore {
  documents: Document[];
  embeddings: OpenAIEmbeddings;
  vectors: number[][] = [];

  constructor(documents: Document[], embeddings: OpenAIEmbeddings) {
    this.documents = documents;
    this.embeddings = embeddings;
  }

  static async fromDocuments(docs: Document[], embeddings: OpenAIEmbeddings) {
    const store = new SimpleVectorStore(docs, embeddings);
    await store.index();
    return store;
  }

  async index() {
    const texts = this.documents.map(d => d.pageContent);
    // Batch embed if needed, but for MVP 50 pages is fine
    this.vectors = await this.embeddings.embedDocuments(texts);
  }

  async similaritySearch(query: string, k: number = 4) {
    const queryVector = await this.embeddings.embedQuery(query);

    // Cosine similarity
    const scores = this.vectors.map((vec, idx) => ({
      idx,
      score: this.cosineSimilarity(queryVector, vec)
    }));

    // Sort descending
    scores.sort((a, b) => b.score - a.score);

    // Take top k
    return scores.slice(0, k).map(s => this.documents[s.idx]);
  }

  private cosineSimilarity(a: number[], b: number[]) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}

// Session Store to ensure isolation
// We use a Map keyed by sessionId to store specific vector stores
declare global {
  var _elysianSessions: Map<string, { store: SimpleVectorStore; docs: Document[] }> | undefined;
}

if (!global._elysianSessions) {
  global._elysianSessions = new Map();
}

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
});

export async function processPdf(blob: Blob, sessionId: string) {
  const loader = new PDFLoader(blob, {
    splitPages: true,
  });

  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  const formattedDocs = splitDocs.map((doc: Document) => {
    return {
      ...doc,
      metadata: {
        ...doc.metadata,
        page: (doc.metadata.loc?.pageNumber || 0) + 1,
      }
    };
  });

  const store = await SimpleVectorStore.fromDocuments(
    formattedDocs,
    embeddings
  );

  // Store in session map
  global._elysianSessions?.set(sessionId, { store, docs: formattedDocs });

  return {
    pageCount: docs.length,
    chunkCount: formattedDocs.length
  };
}

export async function searchContext(query: string, sessionId: string, k: number = 5) {
  const session = global._elysianSessions?.get(sessionId);
  if (!session) {
    return [];
  }

  const results = await session.store.similaritySearch(query, k);

  return results.map((doc: Document) => ({
    content: doc.pageContent,
    page: doc.metadata.page,
    source: doc.metadata.source
  }));
}
