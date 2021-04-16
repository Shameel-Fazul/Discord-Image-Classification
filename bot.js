const http = require('http');
const handler = require('serve-handler');
const puppeteer = require("puppeteer")
const socketio = require('socket.io');
const fs  = require("fs")
const Discord = require('discord.js');
const client = new Discord.Client();
const download = require('image-downloader');
 
const server = http.createServer((request, response) => {
  return handler(request, response);
})

const io = socketio(server);
 
server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});


io.on('connection', socket => {
    socket.on('load', data => {
        console.log(`ML5 ${data} has been loaded`)
    });

    client.on('message', async (msg) => {
        if (msg.content.length < 1) {
            const browser = await puppeteer.launch()
  const page = await browser.newPage()
            const image = await msg.attachments.toJSON();
            const options = { url: image[0].url, dest: './testimage' }
            download.image(options)
                .then(({ filename }) => {
                    console.log(filename)
                    const file = fs.readFileSync(`./${filename}`)
                    ;(async () => {
                        
                        await page.goto("http://localhost:3000/public/")
                        console.log(await page.evaluate("ml5.version")) // prints "0.5.0"
                        page.on("console", msg => console.log(">", msg.text()))
                        socket.emit('predict', file.toString('base64'))
                      
                        // This allows to save the model when classifier.save() is called.
                        // downloadPath is the folder in which the model will be saved.
                        // await page._client.send("Page.setDownloadBehavior", {
                        //   behavior: "allow",
                        //   downloadPath: "./",
                        // })
                    })
                })
                .catch((err) => console.error(err))
            socket.on('result', data => {
                return msg.reply(`I'm ${Math.floor(data[0].confidence * 100)}% confident that it's a ${data[0].label}`)
            });
        }
    });
});

client.login('ODMxMDkwMjc2NTM3MzM1ODM4.YHQLIg.i8WGLvoQnn4mRRXb1YurFtJNbsQ');