const express = require('express');
const axios = require('axios');
var applescript = require('applescript');
const fs = require('fs');
const cors = require('cors');


const app = express();
app.use(cors());
const port = 13091;
let pastVol = 0;

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
            "playing": response2.data.playing,
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

app.get('/weather', async (req, res) => {
    if (fs.existsSync('weather.json')) {
        const data = fs.readFileSync('weather.json');
        const jsonData = JSON.parse(data);
        const currentTime = new Date();
        const lastUpdated = new Date(jsonData.currentTime);
        const diff = Math.abs(currentTime - lastUpdated) / 1000;
        if (diff < 1800) {
            const respData = {"main":jsonData.weather[0].main, "temp": jsonData.main.temp, "icon": jsonData.weather[0].icon};
            res.json(respData);
            return;
        }
    }
    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather?q=Sydney,aus&units=metric&APPID=ba1a5a37eabae42a73d46e9c7bf0cb40');
        const currentTime = new Date();
        response.data.currentTime = currentTime;
        response.data.main.temp = (Math.round(response.data.main.temp * 10) / 10).toString() + " C";
        fs.writeFileSync('weather.json', JSON.stringify(response.data));
        respData = {"main":response.data.weather[0].main, "temp": response.data.main.temp, "icon": response.data.weather[0].icon};
        res.json(respData); 
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/volume/:volume', async (req, res) => {
    const volume = req.params.volume;
    console.log(volume)
    if(volume != "togglePausePlay") {
    const script = "set volume output volume " + volume;

    applescript.execString(script, function (err, rtn) {
        if (err) {
            res.send(err);
        }
        console.log("set volume to " + volume);
        res.status(200).send(rtn);
    });
} else {
    let response = await axios.post('http://localhost:13090/track/toggle-play-state');
    res.status(200).send(response.data);
    console.log(response.data)
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
