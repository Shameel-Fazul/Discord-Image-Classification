const http = require('http');
const socketio = require('socket.io');
const fs  = require("fs")
const Discord = require('discord.js');
const client = new Discord.Client();
const download = require('image-downloader');


const requestListener = (req, res) => {
    res.writeHead(200);
    fs.createReadStream('index.html').pipe(res)
}

const server = http.createServer(requestListener);
const io = socketio(server);
server.listen(process.env.PORT || 3000)
console.log('The server is listening..')


io.on('connection', socket => {
    socket.on('load', data => {
        console.log(`ML5 ${data} has been loaded`)
    });

    client.on('message', async (msg) => {
        if (msg.content.length < 1) {
            const image = await msg.attachments.toJSON();
            const options = { url: image[0].url, dest: './images' }
            download.image(options)
                .then(({ filename }) => {
                    const file = fs.readFileSync(`./${filename}`)
                    socket.emit('predict', file.toString('base64'))
                })
                .catch((err) => console.error(err))
            socket.on('result', data => {
                return msg.reply(`I'm ${Math.floor(data[0].confidence * 100)}% confident that it's a ${data[0].label}`)
        });
        }
    });
});

client.login('#');