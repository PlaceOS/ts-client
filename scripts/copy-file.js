import { copyFile } from 'fs';

// destination.txt will be created or overwritten by default.
copyFile('./src/oauth-resp.html', './dist/oauth-resp.html', (err) => {
    if (err) throw err;
    console.log('Copied oauth-resp.html to dist');
});
