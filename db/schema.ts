import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const lessons=sqliteTable('lesson_progress',{
 userId:text('user_id').notNull(),stageId:text('stage_id').notNull(),step:integer('step').notNull(),completed:text('completed').notNull(),revision:integer('revision').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[primaryKey({columns:[t.userId,t.stageId]})]);
export const games=sqliteTable('game_runs',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),stageId:text('stage_id').notNull(),correct:integer('correct').notNull(),total:integer('total').notNull(),createdAt:text('created_at').notNull(),
});
export const attempts=sqliteTable('exam_attempts',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),stageId:text('stage_id'),chapter:text('chapter'),status:text('status').notNull(),revision:integer('revision').notNull(),questions:text('questions').notNull(),answers:text('answers').notNull(),currentIndex:integer('current_index').notNull(),lastEventId:text('last_event_id'),createdAt:text('created_at').notNull(),submittedAt:text('submitted_at'),deadline:text('deadline'),score:integer('score'),correctCount:integer('correct_count'),
});
export const learnerPreferences=sqliteTable('learner_preferences',{
 userId:text('user_id').primaryKey().notNull(),difficulty:text('difficulty').notNull(),goal:text('goal').notNull(),onboardingCompleted:integer('onboarding_completed').notNull(),revision:integer('revision').notNull(),updatedAt:text('updated_at').notNull(),
});
