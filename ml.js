const http = require('http');
const handler = require('serve-handler');
const puppeteer = require("puppeteer");
const fs  = require("fs");
const socketio = require('socket.io');
const download = require('image-downloader');


const Discord = require('discord.js');
const client = new Discord.Client();

const server = http.createServer((request, response) => {
    return handler(request, response);
});
server.listen(process.env.PORT || 3000, () => {
    console.log('[ML] > server is running');
});
const io = socketio(server);


client.on('message', async (msg) => {
    if (msg.content.length < 1) {
        console.log('[ML] > prediction request detected')
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto("http://localhost:3000/public/")
        console.log('[ML] > page has loaded')
        page.on("console", async (res) => {
          msg.reply(res.text())
          console.log("[ML] > page closed")
          await browser.close();
          return;
        })

        io.on('connection', async (socket) => {
            const attachment = await msg.attachments.toJSON();
            const options = { url: attachment[0].url, dest: './images' }
            download.image(options)
                .then(({ filename }) => {
                    ;(async () => {  
                        const version = await page.evaluate("ml5.version");
                        console.log(`[ML] > ml5 ${version} has loaded.`);
                        const image_file = fs.readFileSync(`./${filename}`);
                        socket.emit('predict', image_file.toString('base64'));
                        fs.unlinkSync(`./${filename}`);
                    })()
                })
                .catch((err) => console.error(err))
        });
    } else {
        return;
    }
});

client.login('ODMxMDkwMjc2NTM3MzM1ODM4.YHQLIg.wRb9XTIOcEzZVPeeQVnkbNTJlmU')