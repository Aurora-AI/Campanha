// lib/elysian-lex/types.ts

// Define modes of operation
export type ElysianMode = 'analysis' | 'drafting' | 'chat';

// Define the chunk structure for the vector store
export interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    page: number;
    chunkId: string;
  };
}

// Define the response structure from RAG
export interface RagResponse {
  answer: string;
  sources: {
    page: number;
    text: string;
  }[];
}

// Define structure for analysis result
export interface AnalysisResult {
  risks: {
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    evidence: { page: number; text: string }[];
  }[];
  opportunities: {
    description: string;
    impact: string;
    evidence: { page: number; text: string }[];
  }[];
}
