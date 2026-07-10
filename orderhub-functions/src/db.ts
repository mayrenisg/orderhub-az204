import * as sql from 'mssql';

export async function updateOrderStatus(orderId: number) {
  const pool = await sql.connect({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  });

  await pool
    .request()
    .input('id', sql.Int, orderId)
    .query(`
      UPDATE order
      SET status = 'Processed'
      WHERE id = @id
    `);

  await pool.close();
}