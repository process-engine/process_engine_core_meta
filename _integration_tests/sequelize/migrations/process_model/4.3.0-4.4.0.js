'use strict';

// See manual:
// https://sequelize.readthedocs.io/en/latest/docs/migrations/#functions

// CHANGE NOTES:
// Changes between 4.3.0 and 4.4.0:
// - New Field: ProcessToken.hash: Stores the hash for a given process models xml. This field is used to implement versioning
// - Remove "unique" constraint from "name", to allow versioning
module.exports = {
  up: async (queryInterface, Sequelize) => {

    const checkIfProcessDefinitionsExists = async () => {
      // Note
      // Unfortunately, at migration level, is no such thing as "checkIfTableExits".
      // We can only query for the table and see if that query causes an exception.
      try {

        const result = await queryInterface.describeTable('ProcessDefinitions');
        return result;
      } catch (error) {
        return undefined;
      }
    };

    const processDefinitionTableInfo = await checkIfProcessDefinitionsExists();

    if (!processDefinitionTableInfo) {
      console.log('ProcessDefinitions does not exist. Skipping migrations.');
      return Promise.resolve();
    }

    console.log('Running updating migrations');

    const migrationNotRequired = processDefinitionTableInfo.hash !== undefined;

    if (migrationNotRequired) {
      console.log('The database is already up to date. Nothing to do here.');

      return Promise.resolve();
    }

    // New Column for ProcessDefinitions
    await queryInterface.addColumn(
      'ProcessDefinitions',
      'hash',
      {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      }
    );

    // Remove unique constraint from name
    await queryInterface.changeColumn(
      'ProcessDefinitions',
      'name',
      {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    return Promise.resolve();
  },
};
