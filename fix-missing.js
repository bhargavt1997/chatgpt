const https = require('https');
const fs = require('fs');
const path = require('path');

const UNSPLASH_API_KEY = process.argv[2];
const apiUrl = new URL('https://api.unsplash.com/photos/random');
apiUrl.searchParams.append('query', 'backpack travel');
apiUrl.searchParams.append('client_id', UNSPLASH_API_KEY);
apiUrl.searchParams.append('w', '400');
apiUrl.searchParams.append('h', '500');

https.get(apiUrl.toString(), (response) => {
  let data = '';
  response.on('data', chunk => data += chunk);
  response.on('end', () => {
    try {
      const json = JSON.parse(data);
      const imageUrl = json.urls.regular;
      
      const filepath = path.join(__dirname, 'public', 'demo-images', 'bags', 'canvas-backpack.jpg');
      const file = fs.createWriteStream(filepath);
      
      https.get(imageUrl, (res) => {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('✓ Downloaded bags/canvas-backpack.jpg');
        });
      });
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});
