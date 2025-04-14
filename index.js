
// server.js
const express = require('express');
const cors = require('cors'); // 1. подключаем cors

const app = express();        // 2. создаём express-приложение
app.use(cors());              // 3. активируем cors

app.use(express.json()); 
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = '90DI7UVSJVYM9AEIJ75ZPO4K870U8IZIW0O4FGSTXGV7XQIEZJJGTPMXAFQF2FKMW32GSZXLCDG0FORR'; // вставь сюда свой API ключ

app.use(express.json());

app.post('/extract-pins', async (req, res) => {
  const { pinterestUrl } = req.body;

  try {
    const { data: html } = await axios.get('https://app.scrapingbee.com/api/v1', {
      params: {
        api_key: API_KEY,
        url: pinterestUrl,
        render_js: true
      }
    });

    const jsonMatch = html.match(/<script id="__PWS_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!jsonMatch || !jsonMatch[1]) {
      return res.status(200).json({ imageUrls: [], note: 'no json block found' });
    }

    const json = JSON.parse(jsonMatch[1]);
    const pins = json?.props?.initialReduxState?.pins ?? {};
    const imageUrls = [];

    for (const key in pins) {
      const image = pins[key]?.images?.orig?.url;
      if (image) {
        imageUrls.push(image);
      }
    }

    res.json({ imageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from ScrapingBee', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ScrapingBee proxy running on port ${PORT}`);
});
