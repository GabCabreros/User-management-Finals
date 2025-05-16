const mysql = require('mysql2/promise');
const config = require('./config.json');

async function clearAccounts() {
    const connection = await mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database
    });

    try {
        // Delete accounts
        await connection.execute('DELETE FROM accounts');
        console.log('Cleared all accounts');

    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await connection.end();
    }
}

clearAccounts(); 