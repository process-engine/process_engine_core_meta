# make sure meta and gulp are installed
npm install -g meta gulp

# checkout all repos in the correct branch
meta git update
meta exec "git checkout develop" --exclude process_engine_meta

# retrieve latest versions
meta git pull

echo "Clearing npm cache"
npm cache clean --force

# install all necessary dependencies
echo "Running npm install"
npm install --no-package-lock

# If npm install (or minstall) fails, stop any further execution.
# This is advisable since a failed npm install may lead to failures in the
# building process.
if [[ "$?" -ne "0" ]]; then
  printf "\e[1;31mError while executing npm install!\e[0m\n";
  exit 1;
fi

# fix conflicting types from jasmine and mocha
rm -rf node_modules/@types/jasmine

# build all packages
meta exec "npm run build" --exclude process_engine_meta,skeleton,documentation,identity_server

# create a database
cd skeleton/database
node postgres_docker.js reset demo
cd ../..

# tell the user how to run stuff
echo "run 'npm start' in 'skeleton/process-engine-server-demo' to run the process-engine"
echo "run 'npm start' in 'bpmn-studio' to run the frontend"
