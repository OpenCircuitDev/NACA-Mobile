export interface Course {
  id: string;
  name: string;
  description?: string;
}

export interface Unit {
  id: string;
  classId?: string;
  name: string;
  description?: string;
}

export interface Lesson {
  id: string;
  unitId?: string;
  title: string;
  content?: string;
}

export interface LessonItem {
  id: string;
  lessonId: string;
  type: string;
  content: string;
  order: number;
}
