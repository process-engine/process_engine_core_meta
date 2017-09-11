# checkout all repos in the correct branch
meta git update
meta exec --exclude foundation "git checkout feature/2.0-cleanup"
meta exec --include-only foundation "git checkout feature/invoker"

# install all necessary dependencies
npm install
cd demo && npm install better-npm-run
cd frontend && npm install
cd ../backend && npm install
cd ..

# make the demo use the linked packages
rm -rf frontend/node_modules/@process-engine-js
rm -rf backend/node_modules/@process-engine-js
rm -rf backend/node_modules/graphql
rm -rf backend/node_modules/react
rm -rf backend/node_modules/react-dom
rm -rf backend/node_modules/react-relay
cd ..

# build all packages
meta exec "npm run build" --exclude process_engine_meta,skeleton,documentation
