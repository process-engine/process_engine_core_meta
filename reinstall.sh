# remove "node_modules"
echo "Purging node_modules..."
find . -name "node_modules" -exec rm -rf '{}' +
echo "Done. Starting setup..."

# install all necessary dependencies
npm install --no-package-lock

# fix conflicting types from jasmine and mocha
rm -rf node_modules/@types/jasmine

# build all packages and schemas
meta exec "npm run build && npm run build-schemas" --exclude process_engine_meta,skeleton,documentation,bpmn-io_custom-bundle,bpmn-studio,tslint-config,_integration_tests,identity_server,iam,iam_contracts
meta exec "npm run build" --include-only skeleton,bpmn-io_custom-bundle,bpmn-studio,_integration_tests,iam,iam_contracts

echo "done"
