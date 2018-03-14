# make sure meta and gulp are installed
npm install -g meta gulp

# checkout all repos in the correct branch
meta git update
meta exec "git checkout develop" --exclude process_engine_meta

# retrieve latest versions
meta git pull

# install all necessary dependencies
npm install --no-package-lock

# fix conflicting types from jasmine and mocha
rm -rf node_modules/@types/jasmine

# build all packages and schemas
meta exec "npm run build-schemas && npm run build" --exclude process_engine_meta,skeleton,documentation,bpmn-studio
meta exec "npm run build" --include-only skeleton,bpmn-studio

# create a database
cd skeleton/database
node postgres_docker.js reset demo
cd ../..

# tell the user how to run stuff
echo "run 'npm start' in 'skeleton/process-engine-server-demo' to run the process-engine"
echo "run 'npm start' in 'bpmn-studio' to run the frontend"
