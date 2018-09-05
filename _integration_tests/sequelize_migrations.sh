#!/bin/sh

_VERSION="0.0.1"

# This script will install and use the sequelize-cli and gulp-sequelize.
# This cli is used to perform database migrations for all sequelize related repositories.
if [[ $(uname) != "Darwin" ]]; then
    echo "This tool currently works only for macOS. Sorry."
    exit -1
fi

# check if sequelize-cli and gulp-sequelize are already installed
echo "Verifying sequelize setup. This may take a moment."
GULP_SEQUELIZE_NOT_INSTALLED=$(npm -g ls | grep gulp-sequelize)
SEQUELIZE_CLI_NOT_INSTALLED=$(npm -g ls | grep sequelize-cli)

if [[ -z $GULP_SEQUELIZE_NOT_INSTALLED ]]; then
    printf "\e[1;31mgulp-sequelize must be installed globally. Installing now...\e[0m\n";
    npm install -g gulp-sequelize
else
  echo "gulp-sequelize found.";
fi

if [[ -z $SEQUELIZE_CLI_NOT_INSTALLED ]]; then
    printf "\e[1;31msequelize-cli must be installed globally. Installing now...\e[0m\n";
    npm install -g sequelize-cli
else
  echo "sequelize-cli found.";
fi

echo "Done. Running migrations..."
sequelize db:migrate
