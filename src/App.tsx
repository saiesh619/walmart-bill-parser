import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

type Item = { name: string; price: number };

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');

  function parseText(text: string) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedItems: Item[] = [];
    let totalPrice = 0;

    for (const line of lines) {
      const priceMatch = line.match(/(.*)\s+(\d+\.\d{2})$/);
      if (priceMatch) {
        const [, name, price] = priceMatch;
        parsedItems.push({ name: name.trim(), price: parseFloat(price) });
      }

      const totalMatch = line.match(/total\s+\$?(\d+\.\d{2})/i);
      if (totalMatch) {
        totalPrice = parseFloat(totalMatch[1]);
      }
    }

    setItems(parsedItems);
    setTotal(totalPrice || null);
    setRawText(text);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Tesseract.recognize(file, 'eng').then(({ data: { text } }) => {
      parseText(text);
      setLoading(false);
    });
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>🧾 Walmart Bill Parser</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {loading && <p>Scanning image...</p>}

      {rawText && (
        <div>
          <h3>Extracted Text (Raw):</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{rawText}</pre>
        </div>
      )}

      {items.length > 0 && (
        <>
          <h3>Parsed Items</h3>
          <ul>
            {items.map((item, i) => (
              <li key={i}>
                {item.name} — ${item.price.toFixed(2)}
              </li>
            ))}
          </ul>
          <p><strong>Total Items:</strong> {items.length}</p>
          <p><strong>Total Price:</strong> ${total?.toFixed(2) || 'N/A'}</p>
        </>
      )}
    </div>
  );
}
