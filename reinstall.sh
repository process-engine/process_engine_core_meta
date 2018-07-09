# remove "node_modules"
echo "Purging node_modules..."
find . -name "node_modules" -exec rm -rf '{}' +
echo "Done. Starting setup..."

# install all necessary dependencies
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

# build all packages and schemas
meta exec "npm run build && npm run build-schemas" --include-only process_engine_contracts
meta exec "npm run build" --exclude process_engine_meta,skeleton,documentation,identity_server

echo "done"
