/**
 * Script pour démarrer l'application en HTTPS avec un nom de domaine personnalisé
 * 
 * Ce script vérifie les certificats SSL et démarre ensuite l'application avec Vite
 * en mode HTTPS. Il est conçu pour être utilisé avec la commande:
 * node scripts/start-https.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const domainName = 'dev.tcgbot.local';
const certFile = path.resolve(__dirname, '..', `${domainName}.pem`);
const keyFile = path.resolve(__dirname, '..', `${domainName}-key.pem`);

// Vérifier si les certificats existent
if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
  console.log('⚠️ Certificats SSL non trouvés. Génération des certificats...');
  
  try {
    // Vérifier si mkcert est installé
    execSync('mkcert -version', { stdio: 'ignore' });
    
    // Générer les certificats
    console.log(`🔒 Génération des certificats pour ${domainName}...`);
    execSync(`mkcert ${domainName}`, { stdio: 'inherit' });
    
    console.log('✅ Certificats générés avec succès!');
  } catch (error) {
    console.error('❌ Erreur: mkcert n\'est pas installé ou n\'a pas pu générer les certificats.');
    console.log('📌 Installez mkcert avec: npm install -g mkcert');
    process.exit(1);
  }
}

// Vérifier si l'entrée DNS existe (sur Windows)
if (process.platform === 'win32') {
  try {
    const hostsContent = fs.readFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts', 'utf-8');
    if (!hostsContent.includes(domainName)) {
      console.log(`⚠️ L'entrée pour ${domainName} n'est pas dans votre fichier hosts.`);
      console.log(`📝 Ajoutez cette ligne à C:\\Windows\\System32\\drivers\\etc\\hosts:`);
      console.log(`127.0.0.1   ${domainName}`);
    }
  } catch (error) {
    console.warn('⚠️ Impossible de vérifier le fichier hosts. Vérifiez-le manuellement.');
  }
}

// Vérifier si le fichier .env contient l'URL
const envFile = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  if (!envContent.includes('VITE_SITE_URL')) {
    console.log('⚠️ VITE_SITE_URL non trouvé dans .env, ajout automatique...');
    fs.appendFileSync(envFile, `\nVITE_SITE_URL=https://${domainName}:3000\n`);
  }
}

// Démarrer l'application avec Vite
console.log('🚀 Démarrage de l\'application en HTTPS...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erreur lors du démarrage de l\'application:', error);
  process.exit(1);
}
