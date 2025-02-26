import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';
import { TensorFlowEmbeddings } from '@langchain/community/embeddings/tensorflow';
import { PineconeStore } from '@langchain/pinecone';

let pineconeStore: PineconeStore | null = null;

export async function initVectorStore() {
  if (pineconeStore) return pineconeStore;

  try {
    // Initialize Pinecone with the new API
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });

    // Get the index
    const indexName = process.env.PINECONE_INDEX_NAME!;
    const index = pc.Index(indexName);

    console.log('Initializing Pinecone store...');
    
    // Create vector store with TensorFlow embeddings
    pineconeStore = await PineconeStore.fromExistingIndex(
      new TensorFlowEmbeddings(),
      {
        pineconeIndex: index,
        namespace: 'default'
      }
    );

    console.log('Pinecone store initialized successfully');
    return pineconeStore;
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
}

export async function queryVectorStore(query: string) {
  try {
    const store = await initVectorStore();
    const results = await store.similaritySearch(query, 3);
    return results;
  } catch (error) {
    console.error('Error querying vector store:', error);
    return [];
  }
} 