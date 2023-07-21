const express = require('express');
const PORT = 3333;
const db = require('./models');
require('dotenv').config();

const server = express();

server.use(express.json());
server.use(express.static('./public'));

server.get('/', (req, res) => {
    res.status(200).send('Welcome to SCP API.')
});

const { basicRouters, authRouters, userRouters } = require('./routers');
server.use('/', basicRouters);
server.use('/guest', authRouters);
server.use('/user', userRouters);

server.listen(PORT, () => {
    // db.sequelize.sync({ alter: true });
    console.log(`server is running at port : ${PORT}`);
})


