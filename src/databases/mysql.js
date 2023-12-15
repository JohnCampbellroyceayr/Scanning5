import mysql from 'mysql2';
import { promisify } from 'util';

function connectMysql() {
  return new Promise((resolve, reject) => {
    const pool = mysql.createPool({
      host: '127.0.0.1',
      user: 'scanning',
      password: 'yyERRHcWptGrcmrSqL',
      database: 'SCANNING',
      connectionLimit: 100
    });
 
    const getConnection = promisify(pool.getConnection).bind(pool);
 
    getConnection()
      .then(connection => {
        console.log('Connected to MySQL');
        connection.release();
        resolve(pool);
      })
      .catch(err => {
        console.error('Error connecting to MySQL:', err);
        resolve(null);
      });
  });
}

let connection = await connectMysql();

export default async function sqlQuery(query, args = []) {
  if(connection !== null) {
    return new Promise((resolve) => {
      connection.query(query, args, (err, result) => {
        if(err) {
          resolve({
            error: true,
            result: err
          });
        }
        else {
          resolve({
            error: false,
            result: result
          });
        }
      });
    });
  }
  else {
    return {
      error: true
    }
  }
}