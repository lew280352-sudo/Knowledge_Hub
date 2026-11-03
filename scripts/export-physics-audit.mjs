import {stages,sourceQuestions} from '../lib/curriculum.ts';
import {generateQuestion} from '../lib/questions.ts';
import {teachingContent} from '../lib/teaching-content.ts';
import {firstWaveVariants} from '../lib/lesson-variants.ts';
const seeds=[0,...Array.from({length:256},(_,i)=>Math.floor((i+1)*0xffffffff/256))];
const questions=sourceQuestions.flatMap(source=>seeds.map(seed=>({...generateQuestion(source.id,seed),seed})));
const examples=Object.entries(teachingContent).flatMap(([stage,content])=>['foundation','standard','advanced'].map(level=>({id:`${stage}-${level}`,...content[level].example})));
const firstWave=Object.entries(firstWaveVariants).flatMap(([level,variant])=>Object.entries(variant.steps).filter(([,step])=>step.example).map(([step,content])=>({id:`s01-${level}-${step}`,...content.example})));
process.stdout.write(JSON.stringify({stages:stages.map(s=>({id:s.id,title:s.title,sourcePages:s.sourcePages})),sources:sourceQuestions,questions,examples,firstWave}));
