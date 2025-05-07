// src/components/utils/importCollection.js
import Papa from 'papaparse';

export function importCollectionFromCSV(file, callback) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const cards = results.data.map((row, index) => {
        const rowNorm = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v])
        );

        const cleanPrice = parseFloat(rowNorm['price bought'] || rowNorm.price || 0);
        const validConditions = ['NM', 'EX', 'GD', 'PL', 'HP', 'DMG'];

        return {
          id: rowNorm.id || `${Date.now()}-${index}`,
          name: rowNorm['card name'] || rowNorm.name || '',
          game: rowNorm.game || '',
          set: rowNorm['set name'] || rowNorm.set || '',
          setCode: rowNorm['set code'] || '',
          quantity: parseInt(rowNorm.quantity || 1, 10),
          condition: validConditions.includes(rowNorm.condition?.toUpperCase()) ? rowNorm.condition.toUpperCase() : 'NM',
          language: rowNorm.language || 'FR',
          printing: rowNorm.printing || '',
          rarity: rowNorm.rarity || '',
          edition: rowNorm.edition || '',
          priceBought: cleanPrice,
          avg: parseFloat(rowNorm.avg || 0),
          low: parseFloat(rowNorm.low || 0),
          trend: parseFloat(rowNorm.trend || 0)
        };
      });
      callback(cards);
    },
    error: (error) => {
      console.error('Erreur de parsing CSV:', error);
      callback([]);
    }
  });
}

export function getRangeSelection(startId, endId, list) {
  const startIndex = list.findIndex(card => card.id === startId);
  const endIndex = list.findIndex(card => card.id === endId);
  if (startIndex === -1 || endIndex === -1) return [];

  const [min, max] = [startIndex, endIndex].sort((a, b) => a - b);
  return list.slice(min, max + 1).map(card => card.id);
} 
