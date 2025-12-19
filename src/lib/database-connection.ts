import dotenv from "dotenv";
import mssql from "mssql";

export type IDatabaseConnection = {
  connectionOptions: mssql.config;
  connectionPool: mssql.ConnectionPool | null;
  close(): Promise<void>;
  open(): Promise<void>;
};

export function createTestDatabaseConnection(): IDatabaseConnection {
  mssql.Transaction.prototype.commit = mssql.Transaction.prototype.rollback;
  return _createDatabaseConnection(() => {
    dotenv.config({ path: ".env.test", quiet: true });
  });
}

export function createDatabaseConnection(): IDatabaseConnection {
  return _createDatabaseConnection(
    () => {
      dotenv.config({ quiet: true });
    },
    (config) => {
      console.info(
        `Connected to SQL Server database ${config.server}:${config.port} with user ${config.user}`
      );
    },
    () => {
      console.info(`Connection closed`);
    }
  );
}

function _createDatabaseConnection(
  configDotenv: () => void,
  openConnectionCallback?: (config: mssql.config) => void,
  closeConnectionCallback?: (config: mssql.config) => void
): IDatabaseConnection {
  configDotenv();

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;

  return {
    connectionPool: null,
    connectionOptions: {
      server: DB_HOST as string,
      port: Number(DB_PORT),
      user: DB_USER as string,
      password: DB_PASSWORD as string,
      options: {
        encrypt: false,
        useUTC: false,
        lowerCaseGuids: true,
      },
    },
    async close() {
      if (this.connectionPool) {
        await this.connectionPool.close();
      }
      closeConnectionCallback?.(this.connectionOptions);
    },
    async open() {
      await mssql.connect(this.connectionOptions);
      openConnectionCallback?.(this.connectionOptions);
    },
  };
}
