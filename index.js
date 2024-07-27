const express = require('express');
const axios = require('axios');
var applescript = require('applescript');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
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
            "progress": Math.round(response2.data.uiProgress),
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
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Sydney,aus&units=metric&APPID=${process.env.WEATHER_API_KEY}`);
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


app.get('/image/:section', async (req, res) => {
    try {
         response = await axios.get('http://localhost:13090/track/');
         imageUrl = response.data.video.thumbnail.thumbnails[0].url.replace("https", "http");
        const section = req.params.section;

        const image = await Jimp.read(imageUrl);
        const resizedImage = image.resize(40, 40);

        let pixelData = [];
        for (let y = 0; y < 40; y++) {
            let row = [];
            for (let x = 0; x < 40; x++) {
                const hex = resizedImage.getPixelColor(x, y);
                const rgb = Jimp.intToRGBA(hex);
                row.push([rgb.r, rgb.g, rgb.b]);
            }
            pixelData.push(row);
        }
        fs.writeFileSync('image.json', JSON.stringify(pixelData));

        if(section == 1) {
            pixelData = [pixelData[0], pixelData[1], pixelData[2], pixelData[3], pixelData[4]];
        } else if(section == 2) {
            pixelData = [pixelData[5], pixelData[6], pixelData[7], pixelData[8], pixelData[9]];
        } else if(section == 3) {
            pixelData = [pixelData[10], pixelData[11], pixelData[12], pixelData[13], pixelData[14]];
        } else if(section == 4) {
            pixelData = [pixelData[15], pixelData[16], pixelData[17], pixelData[18], pixelData[19]];
        } else if(section == 5) {
            pixelData = [pixelData[20], pixelData[21], pixelData[22], pixelData[23], pixelData[24]];
        } else if(section == 6) {
            pixelData = [pixelData[25], pixelData[26], pixelData[27], pixelData[28], pixelData[29]];
        } else if(section == 7) {
            pixelData = [pixelData[30], pixelData[31], pixelData[32], pixelData[33], pixelData[34]];
        } else if(section == 8) {
            pixelData = [pixelData[35], pixelData[36], pixelData[37], pixelData[38], pixelData[39]];
        }
        res.json({pixelData: pixelData});
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/weather/image/:section', async (req, res) => {
    try {
        fs.readFile('weather.json', async (err, data) => {
            if (err) {
                console.error('Error:', err.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            const jsonData = JSON.parse(data);
         imageUrl = `https://openweathermap.org/img/wn/${jsonData.weather[0].icon}@2x.png`;
         console.log(imageUrl)

        const section = req.params.section;

        const image = await Jimp.read(imageUrl);
        const resizedImage = image.resize(40, 40);

        let pixelData = [];
        for (let y = 0; y < 40; y++) {
            let row = [];
            for (let x = 0; x < 40; x++) {
                const hex = resizedImage.getPixelColor(x, y);
                const rgb = Jimp.intToRGBA(hex);
                row.push([rgb.r, rgb.g, rgb.b]);
            }
            pixelData.push(row);
        }
        fs.writeFileSync('image.json', JSON.stringify(pixelData));

        if(section == 1) {
            pixelData = [pixelData[0], pixelData[1], pixelData[2], pixelData[3], pixelData[4]];
        } else if(section == 2) {
            pixelData = [pixelData[5], pixelData[6], pixelData[7], pixelData[8], pixelData[9]];
        } else if(section == 3) {
            pixelData = [pixelData[10], pixelData[11], pixelData[12], pixelData[13], pixelData[14]];
        } else if(section == 4) {
            pixelData = [pixelData[15], pixelData[16], pixelData[17], pixelData[18], pixelData[19]];
        } else if(section == 5) {
            pixelData = [pixelData[20], pixelData[21], pixelData[22], pixelData[23], pixelData[24]];
        } else if(section == 6) {
            pixelData = [pixelData[25], pixelData[26], pixelData[27], pixelData[28], pixelData[29]];
        } else if(section == 7) {
            pixelData = [pixelData[30], pixelData[31], pixelData[32], pixelData[33], pixelData[34]];
        } else if(section == 8) {
            pixelData = [pixelData[35], pixelData[36], pixelData[37], pixelData[38], pixelData[39]];
        }
        res.json({pixelData: pixelData});
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/volume/:volume', async (req, res) => {
    const volume = req.params.volume;
    console.log(volume);
    if(volume != "togglePausePlay" && volume != "get") {
    const script = "set volume output volume " + volume;

    applescript.execString(script, function (err, rtn) {
        if (err) {
            res.send(err);
        }
        console.log("set volume to " + volume);
        res.status(200).send(rtn);
    });
} else if(volume == "togglePausePlay") {
    let response = await axios.post('http://localhost:13090/track/toggle-play-state');
    res.status(200).send(response.data);
    console.log(response.data)
} else if(volume == "get") {
    const script = "get output volume of (get volume settings)"
    applescript.execString(script, function (err, rtn) {
        if (err) {
            res.send(err);
        }
        res.status(200).send(rtn.toString());
    });
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

app.get('/seek/:time', async (req, res) => {
    console.log(req.params.time);
    const time = req.params.time;
   fetch(`http://localhost:13090/track/seek`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: "seek",
            time: time * 1000,
        }),
    })
    .then(() =>  res.status(200).send("Seeked to " + time));

});

app.get('/like', async (req, res) => {
    fetch('http://localhost:13090/track/like', {
        method: 'POST',
    })
    .then((response) => response.json())
    .then((response) => res.status(200).send(response));
}
);

app.get('/dislike', async (req, res) => {
    fetch('http://localhost:13090/track/dislike', {
        method: 'POST',
    })
    .then((response) => response.json())
    .then((response) => res.status(200).send(response));
}
);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
