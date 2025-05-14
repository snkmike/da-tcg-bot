// CardDetail.jsx
import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CardDetail({ card, onClose }) {
  const [timeframe, setTimeframe] = useState('all');

  if (!card) return null;

  // Filtrer l'historique des prix selon la période
  const filterPriceHistory = (history) => {
    if (!history) return [];
    if (timeframe === 'all') return history;

    const now = new Date();
    const threshold = new Date();
    
    switch(timeframe) {
      case 'month':
        threshold.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        threshold.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        threshold.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        threshold.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return history;
    }

    return history.filter(ph => new Date(ph.date) >= threshold);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">{card.name}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Colonne gauche - Image */}
            <div>
              <div className="relative">
                <img 
                  src={card.image} 
                  alt={card.name}
                  className={`rounded-lg shadow-lg w-full ${card.isFoil ? 'card-foil' : ''}`}
                />
                {card.isFoil && (
                  <div className="absolute top-2 right-2">
                    <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                      <Sparkles size={14} />
                      Foil
                    </span>
                  </div>
                )}
              </div>

              {/* Prix */}
              <div className="mt-6 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Prix normal</div>
                  <div className="text-xl font-bold text-green-600">{card.price}€</div>
                </div>
                {card.foil_price && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Prix foil</div>
                    <div className="text-xl font-bold text-purple-600">{card.foil_price}€</div>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite - Infos */}
            <div className="space-y-6">
              {/* Informations principales */}
              <InfoSection title="Détails de la carte">
                <InfoRow label="Set" value={card.set_name} />
                <InfoRow label="Numéro" value={`#${card.collector_number}`} />
                <InfoRow label="Rareté" value={card.rarity} />
                <InfoRow label="Type" value={card.type} />
                {card.ink_color && <InfoRow label="Couleur d'encre" value={card.ink_color} />}
                {card.cost && <InfoRow label="Coût" value={card.cost} />}
              </InfoSection>

              {/* Stats de combat si applicables */}
              {(card.strength || card.willpower || card.lore) && (
                <InfoSection title="Statistiques">
                  {card.strength && <InfoRow label="Force" value={card.strength} />}
                  {card.willpower && <InfoRow label="Volonté" value={card.willpower} />}
                  {card.lore && <InfoRow label="Points d'Histoire" value={card.lore} />}
                </InfoSection>
              )}

              {/* État dans les collections */}
              {card.collections?.length > 0 && (
                <InfoSection title="Dans vos collections">
                  {card.collections.map((col, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="font-medium">{col.name}</span>
                      <div className="flex gap-3">
                        <span className="text-gray-600">Normal: {col.quantity}x</span>
                        {col.foilQuantity > 0 && (
                          <span className="text-purple-600">Foil: {col.foilQuantity}x</span>
                        )}
                      </div>
                    </div>
                  ))}
                </InfoSection>
              )}

              {/* Texte de la carte */}
              {card.text && (
                <InfoSection title="Texte">
                  <div className="text-gray-700 whitespace-pre-wrap">{card.text}</div>
                </InfoSection>
              )}

              {/* Evolution du prix */}
              <InfoSection title="Evolution du prix">
                <div className="mb-4">
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  >
                    <option value="all">Tout l'historique</option>
                    <option value="month">Dernier mois</option>
                    <option value="3months">3 derniers mois</option>
                    <option value="6months">6 derniers mois</option>
                    <option value="year">Dernière année</option>
                  </select>
                </div>
                <PriceChart priceHistory={filterPriceHistory(card.price_history)} />
              </InfoSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants utilitaires
const InfoSection = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const PriceChart = ({ priceHistory }) => {
  console.log('📊 Historique des prix:', priceHistory);

  if (!priceHistory || priceHistory.length === 0) {
    console.log('❌ Pas de données d\'historique disponibles');
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <span className="text-gray-500">Aucun historique de prix disponible</span>
      </div>
    );
  }

  // Trier par date
  const sortedHistory = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Séparer les prix normaux et foils
  const normalPrices = sortedHistory.filter(ph => !ph.is_foil);
  const foilPrices = sortedHistory.filter(ph => ph.is_foil);

  // Calculer les tendances
  const calculateTrendline = (prices) => {
    if (prices.length < 2) return [];
    
    const xValues = prices.map((_, i) => i);
    const yValues = prices.map(p => p.price);
    
    const n = prices.length;
    const sum_x = xValues.reduce((a, b) => a + b, 0);
    const sum_y = yValues.reduce((a, b) => a + b, 0);
    const sum_xy = xValues.reduce((total, x, i) => total + x * yValues[i], 0);
    const sum_xx = xValues.reduce((total, x) => total + x * x, 0);
    
    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;
    
    return xValues.map(x => slope * x + intercept);
  };

  const normalTrendline = calculateTrendline(normalPrices);
  const foilTrendline = calculateTrendline(foilPrices);

  // Format dates
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const data = {
    labels: normalPrices.map(ph => formatDate(ph.date)),
    datasets: [
      {
        label: 'Prix normal',
        data: normalPrices.map(ph => ph.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        fill: false
      },
      {
        label: 'Tendance normale',
        data: normalTrendline,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
        fill: false
      },
      {
        label: 'Prix foil',
        data: foilPrices.map(ph => ph.price),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        fill: false
      },
      {
        label: 'Tendance foil',
        data: foilTrendline,
        borderColor: 'rgba(147, 51, 234, 0.3)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
        fill: false
      }
    ].filter(dataset => dataset.data.length > 0) // Ne garder que les datasets avec des données
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          filter: (item) => !item.text.includes('Tendance') // Masquer les lignes de tendance dans la légende
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            if (context.dataset.label.includes('Tendance')) return null;
            const price = context.parsed.y;
            const formattedPrice = new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            }).format(price);
            return `${context.dataset.label}: ${formattedPrice}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          callback: value => new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
          }).format(value),
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="h-64">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};
