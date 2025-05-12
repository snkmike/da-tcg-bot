// Utilitaires pour Lorcana
export const getCardUniqueKey = (card) =>
  `${card.id}_${String(card.collector_number || '')}_${card.set_name || ''}_${card.version || ''}_${card.isFoil === true ? '1' : '0'}`;
