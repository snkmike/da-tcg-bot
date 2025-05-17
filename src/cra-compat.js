// Pont de compatibilité entre Create React App et Vite
// Ce fichier fait en sorte que les fonctionnalités de CRA continuent de fonctionner avec Vite

// Support pour process.env
window.process = window.process || {};
window.process.env = window.process.env || {};

// Convertir les variables VITE_ en REACT_APP_
Object.keys(import.meta.env).forEach(key => {
  if (key.startsWith('VITE_')) {
    const reactKey = key.replace('VITE_', 'REACT_APP_');
    window.process.env[reactKey] = import.meta.env[key];
  }
  
  // Conserver les variables VITE_ originales
  window.process.env[key] = import.meta.env[key];
});

// Support pour process.env.NODE_ENV
window.process.env.NODE_ENV = import.meta.env.MODE;

// Support pour %PUBLIC_URL%
window.process.env.PUBLIC_URL = '';

// Support pour les raccourcis de chemins CRA standards
window.process.env.BASE_URL = '/';

// Support pour vérifier si on est en prod ou en dev
window.process.env.PROD = import.meta.env.PROD;
window.process.env.DEV = import.meta.env.DEV;

// Support pour le hot module replacement (HMR)
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Ajouter les clés API qui sont dans le .env
if (import.meta.env.VITE_SITE_URL) {
  console.log('HTTPS setup detected with URL:', import.meta.env.VITE_SITE_URL);
}

console.log('CRA Compatibility Layer initialized in', import.meta.env.MODE, 'mode');

// Exporter un objet vide pour permettre les imports standards
export default {};
