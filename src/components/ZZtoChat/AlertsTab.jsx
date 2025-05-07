// src/components/AlertsTab.jsx
import React, { useState } from 'react';

export default function AlertsTab() {
  const [activeSection, setActiveSection] = useState('active');

  const alerts = [
    { id: 1, cardName: "Charizard", game: "Pokémon", target: "below", price: 1200, source: "cardmarket", createdAt: "2023-10-15" },
    { id: 2, cardName: "Black Lotus", game: "Magic", target: "above", price: 31000, source: "all", createdAt: "2023-10-12" },
    { id: 3, cardName: "Dark Magician", game: "Yu-Gi-Oh!", target: "below", price: 110, source: "amazon", createdAt: "2023-10-10" }
  ];

  const anomalies = [
    { id: 1, cardName: "Jace, the Mind Sculptor", game: "Magic", normalPrice: 85, anomalyPrice: 45, source: "cdiscount", detectedAt: "2023-10-16" },
    { id: 2, cardName: "Pikachu", game: "Pokémon", normalPrice: 45, anomalyPrice: 15, source: "amazon", detectedAt: "2023-10-14" }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Alertes & Monitoring</h2>
      <div className="flex space-x-4 mb-4">
        <button className={`px-4 py-2 rounded-md ${activeSection === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveSection('active')}>Alertes actives</button>
        <button className={`px-4 py-2 rounded-md ${activeSection === 'anomalies' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveSection('anomalies')}>Anomalies détectées</button>
        <button className={`px-4 py-2 rounded-md ${activeSection === 'notifications' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveSection('notifications')}>Paramètres</button>
      </div>

      {activeSection === 'active' && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Alertes actives</h3>
            <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm">Nouvelle alerte</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Carte</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Jeu</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Condition</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Source</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Créée le</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert.id} className="border-b border-gray-200">
                    <td className="px-4 py-3">{alert.cardName}</td>
                    <td className="px-4 py-3">{alert.game}</td>
                    <td className="px-4 py-3">{alert.target === 'below' ? <span className="text-red-600">En dessous de {alert.price}€</span> : <span className="text-green-600">Au dessus de {alert.price}€</span>}</td>
                    <td className="px-4 py-3">{alert.source}</td>
                    <td className="px-4 py-3">{alert.createdAt}</td>
                    <td className="px-4 py-3"><button className="text-red-600 hover:text-red-800">Supprimer</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'anomalies' && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium mb-4">Anomalies détectées</h3>
          <div className="space-y-4">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="border border-yellow-200 bg-yellow-50 rounded-md p-3">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{anomaly.cardName}</h4>
                    <p className="text-sm text-gray-600">{anomaly.game}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Prix normal: <span className="font-medium">{anomaly.normalPrice}€</span></p>
                    <p className="text-sm text-red-600">Prix anormal: <span className="font-medium">{anomaly.anomalyPrice}€</span></p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Détecté le {anomaly.detectedAt} sur {anomaly.source}</span>
                  <div className="flex space-x-2">
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm">Voir</button>
                    <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">Ignorer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium mb-4">Paramètres de notification</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="h-4 w-4 text-indigo-600" defaultChecked />
                <span>Notifications par email</span>
              </label>
              <input type="email" className="mt-2 p-2 border border-gray-300 rounded-md w-full" placeholder="adresse@email.com" defaultValue="utilisateur@example.com" />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="h-4 w-4 text-indigo-600" defaultChecked />
                <span>Notifications in-app</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="h-4 w-4 text-indigo-600" />
                <span>Webhook Discord</span>
              </label>
              <input type="text" className="mt-2 p-2 border border-gray-300 rounded-md w-full" placeholder="URL du webhook Discord" />
            </div>
            <div className="pt-4">
              <h4 className="font-medium mb-2">Fréquence de vérification</h4>
              <select className="p-2 border border-gray-300 rounded-md w-full">
                <option value="realtime">Temps réel (push)</option>
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
              </select>
            </div>
            <div className="pt-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md">Enregistrer les paramètres</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
