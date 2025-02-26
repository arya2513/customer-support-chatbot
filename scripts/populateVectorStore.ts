import { initVectorStore } from '../utils/vectorStore';
import { Document } from 'langchain/document';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function loadDocuments() {
  try {
    const csvPath = path.join(process.cwd(), 'knowledge-base', 'knowledge_base.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Parse CSV content
    const records = parse(csvContent, {
      columns: true, // Treat first row as headers
      skip_empty_lines: true
    });

    // Convert CSV records to documents
    const documents = records.map((record: any) => {
      // Create a document with question and answer
      return new Document({
        pageContent: `Question: ${record.question}\nAnswer: ${record.answer}`,
        metadata: { 
          source: 'knowledge_base.csv',
          question: record.question,
          answer: record.answer
        }
      });
    });

    console.log(`Loaded ${documents.length} documents from CSV`);
    return documents;
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting vector store population...');
    const store = await initVectorStore();
    console.log('Loading documents...');
    const documents = await loadDocuments();
    console.log(`Found ${documents.length} documents to process`);
    await store.addDocuments(documents);
    console.log('Successfully populated vector store');
  } catch (error) {
    console.error('Error populating vector store:', error);
    process.exit(1);
  }
}

main(); 