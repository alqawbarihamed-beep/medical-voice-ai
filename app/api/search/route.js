import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

// كلمات لا نريدها في النتائج
const skipWords = ['preface', 'contributors', 'abbreviations', 'dedication', 'index', 'video', 'http', 'www', 'taylor', 'francis', 'crcpress', 'isbn'];

function isGoodParagraph(text) {
  const lower = text.toLowerCase();
  // نتخطى الفقرات القصيرة جداً
  if (text.length < 50) return false;
  // نتخطى الفهارس والمحتويات
  for (const w of skipWords) {
    if (lower.startsWith(w)) return false;
  }
  // نتخطى السطور التي تحتوي على روابط فقط
  if (text.includes('http://') || text.includes('https://')) return false;
  // نتخطى قوائم الاختصارات (كلها أحرف كبيرة)
  const words = text.split(/\s+/);
  const capsCount = words.filter(w => w === w.toUpperCase() && w.length > 1).length;
  if (capsCount > words.length * 0.5) return false;
  return true;
}

export async function POST(req) {
  try {
    const { query } = await req.json();
    
    if (!fs.existsSync(INDEX_FILE)) {
      return NextResponse.json({ results: '📚 لم ترفع أي كتب بعد. اذهب إلى Upload PDF أولاً.' });
    }
    
    const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    if (!index.length) return NextResponse.json({ results: '📚 لم ترفع أي كتب بعد.' });
    
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let allResults = [];
    
    for (const item of index) {
      const textPath = path.join(DATA_DIR, item.file);
      if (!fs.existsSync(textPath)) continue;
      
      const content = JSON.parse(fs.readFileSync(textPath, 'utf8'));
      const sentences = content.text.split(/(?<=[.!?])\s+/);
      const chunks = [];
      for (let i = 0; i < sentences.length; i += 3) {
        const chunk = sentences.slice(i, i + 3).join(' ').trim();
        if (isGoodParagraph(chunk)) chunks.push(chunk);
      }
      
      for (const chunk of chunks) {
        let score = 0;
        const lc = chunk.toLowerCase();
        for (const w of keywords) { if (lc.includes(w)) score += 2; }
        if (lc.includes(query.toLowerCase())) score += 5;
        // تفضيل الفقرات التي تحتوي على أرقام (معلومات طبية)
        if (/\d+/.test(chunk)) score += 1;
        
        if (score > 0) allResults.push({ text: chunk, score, source: item.name });
      }
    }
    
    allResults.sort((a, b) => b.score - a.score);
    const top = allResults.slice(0, 3); // 3 نتائج فقط بدل 5
    
    if (!top.length) {
      return NextResponse.json({ 
        results: '❌ لم أجد معلومات عن "' + query + '" في ' + index.length + ' كتب.\n\n💡 جرب كلمات إنجليزية دقيقة أو ارفع كتباً أخرى.' 
      });
    }
    
    const out = top.map((r, i) => {
      const emoji = i === 0 ? '🔍' : '📄';
      return emoji + ' **' + r.source + '**:\n\n' + r.text;
    }).join('\n\n---\n\n');
    
    return NextResponse.json({ results: out });
  } catch(e) {
    return NextResponse.json({ results: 'Error: ' + e.message });
  }
}
