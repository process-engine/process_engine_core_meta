# checkout all repos in the correct branch
meta git update
meta exec "git checkout develop" --exclude process_engine_meta

# install all necessary dependencies
npm install

# create a database
cd skeleton/database
node postres_docker.js reset demo
cd ../..

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
meta exec "npm run build" --include-only charon
