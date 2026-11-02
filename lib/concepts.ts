import {sourceQuestions} from './curriculum.ts';
import type {ErrorCategory} from './question-types.ts';
/** Concept identity and error cause are separate. Existing source IDs remain authoritative. */
export const conceptTaxonomy=Object.fromEntries(sourceQuestions.map(source=>[source.id,{id:source.id,stageId:source.stageId,label:source.topic}]));
export const errorCategories:Record<ErrorCategory,{label:string;guidance:string}>={
 conceptual:{label:'ความเข้าใจแนวคิด',guidance:'วาดภาพและอธิบายปรากฏการณ์ด้วยคำของตัวเองก่อนแทนตัวเลข เปรียบเทียบกับคำอธิบายในบทเรียน'},
 'formula-selection':{label:'การเลือกสูตร',guidance:'เขียนสิ่งที่รู้และสิ่งที่ต้องหา แล้วตรวจว่าเงื่อนไขของสูตรตรงกับโจทย์ก่อนแทนค่า'},
 'unit-conversion':{label:'การแปลงหน่วย',guidance:'เขียนหน่วยทุกค่า แปลงให้สอดคล้องกันก่อนแทนสูตร และตรวจหน่วยของผลลัพธ์'},
 calculation:{label:'การคำนวณ',guidance:'จัดรูปสมการก่อนแทนค่า เก็บหลักคำนวณระหว่างทาง แล้วประมาณขนาดเพื่อตรวจคำตอบ'},
 assumptions:{label:'สมมติฐานทางฟิสิกส์',guidance:'ระบุขอบเขตของแบบจำลอง ตรวจทิศทาง เครื่องหมาย เงื่อนไขขอบเขต และข้อประมาณที่ใช้'},
 unclassified:{label:'ยังไม่จัดประเภท',guidance:'ลองทำใหม่โดยเขียนวิธีคิด แล้วเทียบกับเฉลยทีละขั้น ตัวเลือกคำตอบอย่างเดียวไม่บอกสาเหตุของข้อผิดพลาด'},
};
/** Current formal snapshots contain answers, not diagnostic reasoning. Never guess a cause. */
export function classifyReviewEvidence(incorrect:number,unanswered:number):{category:'unclassified';evidence:'answer-only'|'insufficient'}{
 return {category:'unclassified',evidence:incorrect>0?'answer-only':'insufficient'};
}
