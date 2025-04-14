const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = '90DI7UVSJVYM9AEIJ75ZPO4K870U8IZIW0O4FGSTXGV7XQIEZJJGTPMXAFQF2FKMW32GSZXLCDG0FORR';

app.post('/extract-pins', async (req, res) => {
  const { pinterestUrl } = req.body;

  try {
    const { data: html } = await axios.get('https://app.scrapingbee.com/api/v1', {
      params: {
        api_key: API_KEY,
        url: pinterestUrl,
        render_js: true,
        wait: 5000
      }
    });

    const jsonMatch = html.match(/<script id="__PWS_DATA__" type="application\/json">(.*?)<\/script>/);
if (!jsonMatch || !jsonMatch[1]) {
  return res.status(200).json({
    imageUrls: [],
    error: 'PWS_DATA not found',
    debugHtml: html.slice(0, 1500)
  });
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

    res.json({
  imageUrls,
  debugHtml: html.slice(0, 1000)
});
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch or parse HTML',
      details: err.message
    });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
