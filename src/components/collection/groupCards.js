// groupCards.js - Regroupe les cartes identiques avec quantité
export default function groupCards(cards) {
  return cards.reduce((acc, card) => {
    const key = `${card.name}_${card.set_name}_${card.collector_number}_${card.isFoil ? 'foil' : 'nonfoil'}`;
    if (!acc[key]) {
      acc[key] = { ...card, quantity: 1 };
    } else {
      acc[key].quantity += 1;
    }
    return acc;
  }, {});
}
