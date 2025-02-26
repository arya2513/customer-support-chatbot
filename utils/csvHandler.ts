import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface QARecord {
  question: string;
  answer: string;
}

let qaCache: QARecord[] | null = null;

export function loadQAData(): QARecord[] {
  if (qaCache) return qaCache;

  const csvPath = path.join(process.cwd(), 'knowledge-base', 'knowledge_base.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  qaCache = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  return qaCache;
}

export function findRelevantContext(query: string): string {
  const qaData = loadQAData();
  const normalizedQuery = query.toLowerCase();
  
  // Find the most relevant QA pairs
  const relevantQAs = qaData.filter(qa => 
    qa.question.toLowerCase().includes(normalizedQuery) ||
    normalizedQuery.includes(qa.question.toLowerCase())
  );

  // Format QA pairs as context
  return relevantQAs.map(qa => 
    `Question: ${qa.question}\nAnswer: ${qa.answer}`
  ).join('\n\n');
} 