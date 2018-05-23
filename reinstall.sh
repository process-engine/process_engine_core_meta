# install all necessary dependencies
npm install --no-package-lock

# fix conflicting types from jasmine and mocha
rm -rf node_modules/@types/jasmine

# build all packages and schemas
meta exec "GULPTRAUM_TRANSPILE_ONLY=1 npm run build-schemas && npm run build" --exclude process_engine_meta,skeleton,documentation,bpmn-studio,bpmn-io_custom-bundle,tslint-config
meta exec "GULPTRAUM_TRANSPILE_ONLY=1 npm run build" --include-only skeleton,bpmn-studio,bpmn-io_custom-bundle

echo "done"
