export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[]; // e.g. ["FEATURE_NAME", "FILE_PATH"]
  createdAt: number;
  updatedAt: number;
  usageCount: number;
}
