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
cd ..

# build all packages and schemas
meta exec "npm run build-schemas && npm run build" --exclude process_engine_meta,skeleton,documentation,frontend_react_plugin_process_manager,demo
meta exec "npm run build" --include-only frontend_react_plugin_process_manager,demo
