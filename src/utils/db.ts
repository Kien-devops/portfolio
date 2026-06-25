import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '100.112.150.56',
  database: process.env.DB_DATABASE || 'portfolio',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false, // Set to true if you are on Azure SQL
    trustServerCertificate: true, // For self-signed/local dev environments
  },
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getDbConnection(): Promise<sql.ConnectionPool> {
  if (poolPromise) {
    return poolPromise;
  }

  poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log('Connected to MSSQL database successfully');
      return pool;
    })
    .catch((err) => {
      console.error('Database Connection Failed! Bad Config: ', err);
      poolPromise = null;
      throw err;
    });

  return poolPromise;
}

export { sql };
