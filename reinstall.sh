# remove "node_modules"
echo "Purging node_modules..."
find . -name "node_modules" -exec rm -rf '{}' +
echo "Done. Starting setup..."

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

# build all packages
meta exec "npm run build" --exclude process_engine_core_meta

echo "done"
