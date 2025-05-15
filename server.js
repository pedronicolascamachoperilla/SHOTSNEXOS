require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectBlockchain, buyWeapon } = require('./blockchain');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const players = {}; // Almacenar datos de jugadores

// Middleware para servir archivos estáticos (como frontend)
app.use(express.static('public'));

// Gestión de conexiones de jugadores
io.on('connection', (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);

    // Registrar nuevo jugador
    socket.on('register', (username) => {
        players[socket.id] = { username, kills: 0, deaths: 0, score: 0, weapons: [] };
        console.log(`Jugador registrado: ${username}`);
        io.emit('playerList', Object.values(players)); // Enviar la lista de jugadores a todos
    });

    // Comprar un arma usando blockchain
    socket.on('buyWeapon', async (weaponId) => {
        try {
            await buyWeapon(socket.id, weaponId);
            players[socket.id].weapons.push(weaponId);
            socket.emit('weaponPurchased', { success: true, weaponId });
        } catch (err) {
            socket.emit('weaponPurchased', { success: false, error: err.message });
        }
    });

    // Desconexión del jugador
    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerList', Object.values(players));
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

// Conectar a blockchain al iniciar
connectBlockchain();
