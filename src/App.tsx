// src/App.tsx
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

interface Item {
  name: string;
  price: number;
  quantity: number;
}

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');

  const parseText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const parsedItems: Item[] = [];
    let totalPrice = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/(.+?)\s*\$([\d.]+)/);

      if (match) {
        const name = match[1].replace(/Qty\d+|Multipack Quantity:.*/i, '').trim();
        const price = parseFloat(match[2]);

        let quantity = 1;
        const nextLine = lines[i + 1] || '';
        const qtyMatch = nextLine.match(/Qty\s*(\d+)/i);
        if (qtyMatch) {
          quantity = parseInt(qtyMatch[1]);
          i++; // skip the quantity line
        }

        if (!isNaN(price) && price < 100) {
          parsedItems.push({ name, price, quantity });
        }
      }
    }

    totalPrice = parsedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setItems(parsedItems);
    setTotal(Number(totalPrice.toFixed(2)));
    setRawText(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Tesseract.recognize(file, 'eng')
      .then(({ data: { text } }) => {
        parseText(text);
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧾 Walmart Bill Parser</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {loading && <p>Scanning image...</p>}

      {rawText && (
        <div>
          <h3>Extracted Text</h3>
          <pre>{rawText}</pre>
        </div>
      )}

      {items.length > 0 && (
        <>
          <h3>Parsed Items</h3>
          <ul>
            {items.map((item, i) => (
<li key={i}>
  <strong>{item.name}</strong><br />
  Quantity: {item.quantity}, Price per unit: ${item.price.toFixed(2)}
</li>

            ))}
          </ul>
          <p><strong>Total Items:</strong> {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
          <p><strong>Total Price:</strong> ${total?.toFixed(2)}</p>
        </>
      )}
    </div>
  );
};

export default App;
