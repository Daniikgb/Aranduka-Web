const fs = require('fs');
const path = require('path');

// Usar ruta relativa para evitar errores entre computadoras
const filePath = path.join(__dirname, 'index.html');

try {
    if (!fs.existsSync(filePath)) {
        console.error("El archivo no existe en:", filePath);
        process.exit(1);
    }

    let content = fs.readFileSync(filePath, 'utf8');

    const replacements = [
        { search: /content:\s*['"]â†’['"];/g, replace: "content: '\\\\2192';" },
        { search: /Ã‘/g, replace: 'Ñ' },
        { search: /Ãš/g, replace: 'Ú' },
        { search: /RÃ PIDA/g, replace: 'RÁPIDA' },
        { search: /Â¡/g, replace: '¡' },
        { search: /Ã‘/g, replace: 'Ñ' }, // Añadido para PESTAÑAS
        { search: /Ã /g, replace: 'Á' },  // Añadido para CUADRÍCULAS
        { search: /ðŸŽˆ/g, replace: '🎈' },
        { search: /ðŸŒ±/g, replace: '🌱' },
        { search: /ðŸš€/g, replace: '🚀' },
        { search: /ðŸŽ“/g, replace: '🎓' }
    ];

    let modifiedContent = content;
    let totalChanges = 0;

    replacements.forEach(({ search, replace }) => {
        const matches = (modifiedContent.match(search) || []).length;
        if (matches > 0) {
            modifiedContent = modifiedContent.replace(search, replace);
            console.log(`Cambiados ${matches} de: ${search}`);
            totalChanges += matches;
        }
    });

    if (totalChanges > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`✅ Éxito. Total de cambios: ${totalChanges}`);
    } else {
        console.log("[!] No se encontraron errores de codificación.");
    }

} catch (err) {
    console.error("Error crítico:", err);
}
