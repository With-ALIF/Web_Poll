import { ChangeEvent } from 'react';
import { PhotoCardData } from '../../types';

export interface EditorProps {
  data: PhotoCardData;
  onChange: (newData: PhotoCardData) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}
