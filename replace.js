const fs = require('fs');
const path = require('path');

const files = [
    'app/regristrasi/page.js',
    'app/countdown/page.js',
    'app/daftar-kehadiran/page.js',
    'app/page.js'
];

files.forEach(file => {
    const filePath = path.resolve('c:/Users/ILHAM SAPUTRA/Documents/dkm-events', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace text-primary, bg-primary, border-primary, ring-primary, from-primary, etc.
        content = content.replace(/(text|bg|border|ring|from)-primary(\/[0-9]+)?/g, '$1-brand-primary$2');

        // Replace cyan-400
        content = content.replace(/cyan-[0-9]+/g, 'brand-accent');

        fs.writeFileSync(filePath, content);
        console.log('Updated ' + file);
    } else {
        console.log('Not found: ' + file);
    }
});
