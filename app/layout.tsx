import type {Metadata} from 'next';
import './fonts.css';
import 'katex/dist/katex.min.css';
import './tokens.css';
import './globals.css';
import './dashboard.css';
import './adaptive.css';
export const metadata:Metadata={title:'คลังความรู้ · เรียนรู้ได้ทุกวิชา',description:'พื้นที่เรียนรู้ฟิสิกส์ ปัญญาประดิษฐ์ และวิชาใหม่ในอนาคต เรียนผ่านภาพ เกม และข้อสอบสุ่ม พร้อมเก็บความคืบหน้าข้ามอุปกรณ์',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body>{children}</body></html>;}
