export interface Translation {
  id: string;
  mandarin: string;
  translation: string;
  pinyin?: string;
  correctCount?: number;
  incorrectCount?: number;
}
