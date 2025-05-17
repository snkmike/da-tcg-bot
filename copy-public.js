// copy-public.js
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, 'public');
const targetDir = path.resolve(__dirname, '');

// Liste tous les fichiers du répertoire public
fs.readdir(publicDir, (err, files) => {
  if (err) {
    console.error('Erreur lors de la lecture du répertoire public:', err);
    return;
  }

  // Copie chaque fichier vers la racine (sauf index.html qui est géré différemment)
  files.forEach(file => {
    if (file !== 'index.html') {
      const sourcePath = path.join(publicDir, file);
      const targetPath = path.join(targetDir, file);
      
      fs.copyFile(sourcePath, targetPath, (err) => {
        if (err) {
          console.error(`Erreur lors de la copie de ${file}:`, err);
        } else {
          console.log(`${file} copié vers la racine du projet`);
        }
      });
    }
  });
});
