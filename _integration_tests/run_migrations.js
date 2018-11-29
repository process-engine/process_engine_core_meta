'use strict';

const Logger = require('loggerhythm').Logger;

const logger = Logger.createLogger('process-engine:migration:sequelize');

const fs = require('fs');
const path = require('path');
const Umzug = require('umzug');

const SequelizeConnectionManager = require('@essential-projects/sequelize_connection_manager');

let sequelizeInstance;

runMigration();

async function runMigration() {
  const repositories = [
    'correlation',
    'flow_node_instance',
    'process_model',
    'timer',
  ];

  for (const repository of repositories) {
    await migrate(repository);
  }

  await sequelizeInstance.close();
}

// Based on: https://github.com/abelnation/sequelize-migration-hello/blob/master/migrate.js
async function migrate(database) {

  sequelizeInstance = await createSequelizeInstance(database);
  const umzugInstance = await createUmzugInstance(sequelizeInstance, database);

  logger.info('Running database migrations, using Umzug and Sequelize.');
  await umzugInstance.up();
}

async function createSequelizeInstance(repositoryName) {
  const env = process.env.NODE_ENV || 'sqlite';

  const configPath = path.resolve('config', env, 'process_engine', `${repositoryName}_repository.json`);
  const configAsString = fs.readFileSync(configPath, 'utf-8');
  const configAsJson = JSON.parse(configAsString);

  const sequelizeConnectionManager = new SequelizeConnectionManager();
  const connection = sequelizeConnectionManager.getConnection(configAsJson);
  return connection;
}

async function createUmzugInstance(sequelize, database) {

  const migrationsPath = path.resolve(__dirname, 'sequelize', 'migrations', database);

  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: sequelize,
    },
    // see: https://github.com/sequelize/umzug/issues/17
    migrations: {
      params: [
        sequelize.getQueryInterface(),
        sequelize.constructor,
        () => {
          throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
        },
      ],
      path: migrationsPath,
      pattern: /\.js$/,
    },
    logging: (args) => {
      logger.info(args);
    },
  });

  return umzug;
}
