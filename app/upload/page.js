'use client';
import { useState } from 'react';

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setMessage('جاري معالجة الملف...');
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setFiles(prev => [...prev, data]);
        setMessage(`✅ تم رفع "${data.name}" بنجاح (${data.pages} صفحات، ${data.words} كلمة)`);
      } else {
        setMessage('❌ فشل الرفع: ' + data.error);
      }
    } catch (err) {
      setMessage('❌ خطأ في الاتصال');
    }
    
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">📚 Upload Medical PDFs</h1>
      
      <div className="bg-slate-800 p-6 rounded-xl mb-6">
        <label className="block mb-4">
          <span className="text-slate-300">اختر ملف PDF طبي:</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="mt-2 block w-full text-white file:bg-cyan-600 file:text-white file:px-4 file:py-2 file:rounded-full file:border-0"
          />
        </label>
        
        {uploading && <p className="text-yellow-300">⏳ {message}</p>}
        {!uploading && message && <p className="text-green-300">{message}</p>}
      </div>
      
      {files.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">📂 الملفات المرفوعة</h2>
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={i} className="bg-slate-700 p-3 rounded-lg">
                <span className="text-white">{f.name}</span>
                <span className="text-slate-400 ml-4">({f.pages} صفحات - {f.words} كلمة)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
