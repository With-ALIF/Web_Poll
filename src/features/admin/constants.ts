import { PageDefinition } from './types';
import { 
  BarChart2, 
  Database, 
  FileEdit, 
  Layout, 
  Table, 
  Camera, 
  Type 
} from 'lucide-react';

export const AVAILABLE_PAGES: PageDefinition[] = [
  { id: 'polls', name: 'Polls', path: '/polls', icon: BarChart2 },
  { id: 'qbs', name: 'QBS', path: '/qbs', icon: Database },
  { id: 'drafts', name: 'Drafts', path: '/drafts', icon: FileEdit },
  { id: 'formats', name: 'Formats', path: '/channel-formats', icon: Layout },
  { id: 'csv-modifier', name: 'CSV Modifier', path: '/csv-modifier', icon: Table },
  { id: 'ocr', name: 'OCR Quiz Scan', path: '/ocr', icon: Camera },
  { id: 'photocard', name: 'PhotoCard', path: '/photocard', icon: Layout },
  { id: 'exam-paper', name: 'Exam Paper', path: '/exam-paper', icon: FileEdit },
  { id: 'suffix-edit', name: 'Can Edit Suffix', path: '#', icon: Type }
];
