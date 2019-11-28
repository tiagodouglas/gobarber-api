require('dotenv').config();

module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'bk201',
    database: 'gobarber',
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
    }
};