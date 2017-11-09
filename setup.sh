# make sure meta and gulp are installed
npm install -g meta gulp

# checkout all repos in the correct branch
meta git update
meta exec "git checkout develop" --exclude process_engine_meta
meta exec "git checkout feature/namespace_versioning_fixes"

# install all necessary dependencies
npm install

# install the process-engine-server-demo, and make it use the linked packages
cd skeleton/process-engine-server-demo
npm install
rm -rf node_modules/@process-engine
rm -rf node_modules/@essential-projects
cd ../..

# fix conflicting types from jasmine and mocha
rm -rf node_modules/@types/jasmine

# build all packages and schemas
meta exec "npm run build-schemas && npm run build" --exclude process_engine_meta,skeleton,documentation,charon
cd skeleton/process-engine-server-demo
npm run build
cd ../..

# build charon. for some aurelia-reason, this doesn't work with a higher-level node_modules folder
mkdir charon/node_modules
mkdir charon/node_modules/@essential-projects
mkdir charon/node_modules/@process-engine
ln -s ../../../core_contracts charon/node_modules/@essential-projects/core_contracts
ln -s ../../../event_aggregator charon/node_modules/@essential-projects/event_aggregator
ln -s ../../../consumer_client charon/node_modules/@process-engine/consumer_client
ln -s ../../../process_engine_contracts charon/node_modules/@process-engine/process_engine_contracts
cd charon
npm install
npm run build
cd ..

# create a database
cd skeleton/database
node postgres_docker.js reset demo
cd ../..

# tell the user how to run stuff
echo "run 'npm start' in 'skeleton/process-engine-server-demo' to run the process-engine"
echo "run 'npm start' in 'charon' to run the frontend"
