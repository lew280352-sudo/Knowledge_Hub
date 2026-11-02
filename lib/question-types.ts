export type ChapterId = 'waves' | 'wave-optics' | 'ray-optics' | 'sound';
export type DiagramKind = 'wave' | 'superposition' | 'reflection' | 'refraction' | 'interference' | 'slits' | 'lens' | 'colors' | 'sound' | 'resonance' | 'doppler' | 'shock';
export type Diagram = { kind: DiagramKind; values: Record<string,number>; caption?: string };
export type LessonStep = { title:string; body:string; formula?:string; note?:string };
export type MatchPair = { left:string; right:string };
export type Stage = { id:string; number:number; chapter:ChapterId; title:string; description:string; formula:string; diagram:DiagramKind; minutes:number; steps:LessonStep[]; pairs:MatchPair[]; sourcePages:number[] };
export type SourceQuestion = { id:string; chapter:ChapterId; number:number; page:number; stageId:string; topic:string };
export type PublicQuestion = { id:string; sourceId:string; stageId:string; page:number; prompt:string; choices:string[]; diagram?:Diagram };
export type QuestionSnapshot = PublicQuestion & { answer:string; numericAnswer?:number; explanation:string[]; formula:string; templateVersion:number };
export type Attempt = { id:string; stageId:string|null; chapter:ChapterId|null; status:'active'|'submitted'; revision:number; createdAt:string; submittedAt:string|null; deadline:string|null; currentIndex:number; answers:Record<string,string>; questions:PublicQuestion[]; score?:number; correctCount?:number };
export type ReviewedAttempt = Omit<Attempt,'questions'> & { questions:QuestionSnapshot[] };
export type Progress = { stageId:string; step:number; completed:number[]; updatedAt:string; revision:number };
export type AttemptSummary = Omit<Attempt,'questions'|'answers'> & { questionCount:number; answeredCount:number };
export type LearningState = { lessons:Progress[]; attempts:AttemptSummary[]; games:{id:string; stageId:string; correct:number; total:number; createdAt:string}[]; displayName:string; preferences?:LearningPreferences; review?:ReviewRecommendation[] };

// Optional extensions leave canonical stage/step IDs and historical attempts stable.
export type Difficulty = 'foundation' | 'standard' | 'advanced';
export type LearningGoal = 'understanding' | 'exam-prep' | 'problem-solving';
export type LearningPreferences = {difficulty:Difficulty;goal:LearningGoal;onboardingCompleted:boolean;revision:number;updatedAt:string|null};
export type ReviewRecommendation = {sourceId:string;stageId:string;topic:string;attemptId:string;reviewedAt:string;incorrectCount:number;unansweredCount:number;questionCount:number};
export type Checkpoint = {prompt:string;choices:string[];answer:number;explanation:string};
export type LessonExtension = {intro:string;variables?:{symbol:string;meaning:string;unit:string}[];example?:{prompt:string;steps:string[];formula:string};checkpoint?:Checkpoint;assumption?:string};
export type DifficultyVariant = {label:string;steps:Partial<Record<number,LessonExtension>>};
