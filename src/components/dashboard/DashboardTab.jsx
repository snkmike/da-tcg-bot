// src/components/DashboardTab.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function DashboardTab({ portfolio }) {
  const totalValue = portfolio.reduce((sum, card) => sum + card.price, 0);

  const performanceData = [
    { period: 'Dernier mois', change: '+5.2%', value: '+152€' },
    { period: '3 derniers mois', change: '+12.4%', value: '+320€' },
    { period: '6 derniers mois', change: '+18.7%', value: '+480€' },
    { period: '1 an', change: '+28.3%', value: '+680€' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Valeur du portfolio" value={`${totalValue}€`} />
        <StatCard title="Cartes suivies" value={portfolio.length} />
        <StatCard title="Alertes actives" value={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceTable performanceData={performanceData} />
        <TopCards portfolio={portfolio} />
        <Recommendations />
        <GameDistribution />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function PerformanceTable({ performanceData }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium mb-4">Performance</h3>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Période</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Variation</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Valeur</th>
          </tr>
        </thead>
        <tbody>
          {performanceData.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="px-4 py-3">{item.period}</td>
              <td className="px-4 py-3 text-green-600">{item.change}</td>
              <td className="px-4 py-3 text-green-600">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopCards({ portfolio }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium mb-4">Top cartes</h3>
      <div className="space-y-3">
        {portfolio.map(card => (
          <div key={card.id} className="border border-gray-200 rounded-md p-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{card.name}</h4>
                <p className="text-sm text-gray-600">{card.game} - {card.set}</p>
              </div>
              <div className="flex items-center">
                <span className="font-bold mr-2">{card.price}€</span>
                {card.trend === 'up' && <ArrowUpRight className="text-green-600" size={16} />}
                {card.trend === 'down' && <ArrowDownRight className="text-red-600" size={16} />}
                {card.trend === 'stable' && <Minus className="text-gray-600" size={16} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recommendations() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium mb-4">Recommandations</h3>
      <div className="space-y-3">
        <RecommendationCard name="Charizard" game="Pokémon" set="Base Set" type="Call to Go" description="Prix en hausse constante depuis 3 mois. Bon moment pour acheter." />
        <RecommendationCard name="Black Lotus" game="Magic" set="Alpha" type="Hold" description="Prix stable avec forte demande saisonnière à venir." />
        <RecommendationCard name="Dark Magician" game="Yu-Gi-Oh!" set="LOB" type="Bad Call" description="Prix en baisse constante. Envisagez de vendre." />
      </div>
    </div>
  );
}

function RecommendationCard({ name, game, set, type, description }) {
  const typeColors = {
    'Call to Go': 'border-green-200 bg-green-50 text-green-600',
    'Hold': 'border-yellow-200 bg-yellow-50 text-yellow-600',
    'Bad Call': 'border-red-200 bg-red-50 text-red-600'
  };

  const colors = typeColors[type] || 'border-gray-200 bg-gray-50 text-gray-600';

  return (
    <div className={`border ${colors.split(' ')[0]} ${colors.split(' ')[1]} rounded-md p-3`}>
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-600">{game} - {set}</p>
        </div>
        <span className={`${colors.split(' ')[2]} font-medium`}>{type}</span>
      </div>
      <p className="text-sm mt-2">{description}</p>
    </div>
  );
}

function GameDistribution() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium mb-4">Répartition par jeu</h3>
      <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-40 h-40 rounded-full overflow-hidden relative">
            <div
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(#4f46e5 0% 50%, #10b981 50% 80%, #ef4444 80% 100%)',
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white w-20 h-20 rounded-full"></div>
            </div>
          </div>
          <div className="absolute right-4 top-4 space-y-2">
            <Legend color="bg-indigo-600" label="Magic (50%)" />
            <Legend color="bg-green-500" label="Pokémon (30%)" />
            <Legend color="bg-red-500" label="Yu-Gi-Oh! (20%)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 ${color} rounded-full`}></div>
      <span className="text-xs">{label}</span>
    </div>
  );
}
