const express = require('express');
const axios = require('axios');



const app = express();
const port = 13091;

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

app.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:13090/track');
        const response2 = await axios.post('http://localhost:13090/track/state');
        let response3 = await axios.post('http://localhost:13090/track/accent');
        console.log(response3.data)
        response3 = response3.data.replace("#","")
        response3 = hexToRgb(response3)
        accentr = response3.r;
        accentg = response3.g;
        accentb = response3.b;
        const newData = {
            "title": response.data.video.title,
            "artist": response.data.video.author,
            "length": response2.data.duration,
            "progress": response2.data.uiProgress,
            "accentr": accentr,
            "accentg": accentg,
            "accentb": accentb,
            "image": response.data.video.thumbnail.thumbnails[0].url.replace("https", "http")
        };

        res.send(newData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/next', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:13090/track/next');
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/prev', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:13090/track/prev');
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
