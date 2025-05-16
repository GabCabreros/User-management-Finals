const mysql = require('mysql2/promise');
const config = require('../config.json');

async function deleteNonAdminAccounts() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database
        });

        console.log('Connected to database successfully');

        // Find and delete non-admin accounts
        const [accounts] = await connection.execute(
            'SELECT id, email FROM accounts WHERE role != ?',
            ['Admin']
        );

        console.log(`Found ${accounts.length} non-admin accounts to delete`);

        // Delete each account
        for (const account of accounts) {
            try {
                // Delete associated employee record if exists
                await connection.execute(
                    'DELETE FROM employees WHERE accountId = ?',
                    [account.id]
                );

                // Delete the account
                await connection.execute(
                    'DELETE FROM accounts WHERE id = ?',
                    [account.id]
                );

                console.log(`Deleted account: ${account.email}`);
            } catch (err) {
                console.error(`Error deleting account ${account.email}:`, err);
            }
        }

        console.log('Successfully deleted all non-admin accounts');
    } catch (error) {
        console.error('Error deleting accounts:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
    process.exit(0);
}

// Run the deletion
deleteNonAdminAccounts(); 