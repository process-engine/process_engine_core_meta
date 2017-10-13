# checkout all repos in the correct branch
meta git update
meta exec "git checkout develop"

# install all necessary dependencies
npm install

# create a database
cd skeleton/database
node postres_docker.js reset demo
cd ../..

# install the process-engine-server-demo
cd skeleton/process-engine-server-demo
npm install
cd ../..

# make the skeleton use the linked packages
rm -rf skeleton/process-engine-server-demo/@process-engine
rm -rf fskeleton/process-engine-server-demo/@essential-projects

# build all packages and schemas
meta exec "npm run build-schemas && npm run build" --exclude process_engine_meta,skeleton,documentation,charon
cd skeleton/process-engine-server-demo
npm run build
cd ../..
meta exec "npm run build" --include-only charon
