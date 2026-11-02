import type {Metadata} from 'next';
import './fonts.css';
import 'katex/dist/katex.min.css';
import './tokens.css';
import './globals.css';
import './dashboard.css';
import './adaptive.css';
export const metadata:Metadata={title:'Physic Learn · เข้าใจฟิสิกส์ทีละจังหวะ',description:'ห้องแล็บฟิสิกส์ส่วนตัว เรียนผ่านภาพ เกม และข้อสอบสุ่ม พร้อมเก็บความคืบหน้าข้ามอุปกรณ์',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body>{children}</body></html>;}
