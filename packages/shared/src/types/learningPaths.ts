export interface LearningPathway {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  isPublished: boolean;
  stageCount?: number;
  createdBy?: string;
}

export interface PathwayStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  lessons: { id: string; title: string; completed?: boolean }[];
}

export interface PathwayDetail extends LearningPathway {
  stages: PathwayStage[];
}
