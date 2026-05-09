import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

// تأكد من وجود المجلد
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readIndex() {
  try { if (fs.existsSync(INDEX_FILE)) return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')); } catch(e) {}
  return [];
}
function saveIndex(data) { fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2)); }

export async function POST(req) {
  try {
    const fd = await req.formData();
    const file = fd.get('pdf');
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    
    const maxSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 30MB.' }, { status: 400 });
    }
    
    const buf = Buffer.from(await file.arrayBuffer());
    
    let text = '';
    let numpages = 0;
    
    try {
      const pdf = (await import('pdf-parse')).default;
      const d = await pdf(buf);
      text = d.text;
      numpages = d.numpages;
    } catch(e) {
      return NextResponse.json({ error: 'PDF parsing failed.' }, { status: 400 });
    }
    
    if (!text || text.length < 100) {
      return NextResponse.json({ error: 'No text extracted.' }, { status: 400 });
    }
    
    const index = readIndex();
    
    // تحقق من عدم وجود الملف مسبقاً
    if (index.find(f => f.name === file.name)) {
      return NextResponse.json({ error: 'File already exists. Delete it first from dashboard.' }, { status: 400 });
    }
    
    // احفظ النص في ملف JSON منفصل
    const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    const textPath = path.join(DATA_DIR, safeName);
    fs.writeFileSync(textPath, JSON.stringify({ name: file.name, text, pages: numpages, words: text.split(/\s+/).length }));
    
    // أضف للمؤشر
    index.push({ name: file.name, file: safeName, pages: numpages, words: text.split(/\s+/).length, sizeMB: (file.size/1024/1024).toFixed(1), date: new Date().toISOString() });
    saveIndex(index);
    
    return NextResponse.json({ success: true, name: file.name, pages: numpages, words: text.split(/\s+/).length });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const index = readIndex();
  return NextResponse.json({ files: index.map(f => ({ name: f.name, pages: f.pages, words: f.words, sizeMB: f.sizeMB, date: f.date })) });
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const name = url.searchParams.get('delete');
  if (!name) return NextResponse.json({ error: 'No name' }, { status: 400 });
  
  const index = readIndex();
  const item = index.find(f => f.name === name);
  if (!item) return NextResponse.json({ error: 'File not found' }, { status: 404 });
  
  // حذف ملف النص
  const textPath = path.join(DATA_DIR, item.file);
  if (fs.existsSync(textPath)) fs.unlinkSync(textPath);
  
  // تحديث المؤشر
  saveIndex(index.filter(f => f.name !== name));
  
  return NextResponse.json({ success: true });
}
