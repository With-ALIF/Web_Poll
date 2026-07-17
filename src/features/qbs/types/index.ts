export interface MCQData {
  question: string;
  question_image: string;
  option_1: string;
  option_1_image: string;
  option_2: string;
  option_2_image: string;
  option_3: string;
  option_3_image: string;
  option_4: string;
  option_4_image: string;
  option_5: string;
  option_5_image: string;
  correct_options: string;
  explanation: string;
  explanation_image: string;
  type_id: string;
  paper_id: string;
  chapter_id: string;
  topic_id: string;
  sequence_order?: string;
}
