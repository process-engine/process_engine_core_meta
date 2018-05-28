# install all necessary dependencies
npm install --no-package-lock

# fix conflicting types from jasmine and mocha
rm -rf node_modules/@types/jasmine

# build all packages and schemas
meta exec "npm run build && npm run build-schemas" --exclude process_engine_meta,skeleton,documentation,bpmn-io_custom-bundle,bpmn-studio,tslint-config
meta exec "npm run build" --include-only skeleton,bpmn-io_custom-bundle,bpmn-studio

echo "done"
