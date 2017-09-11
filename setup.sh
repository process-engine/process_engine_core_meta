# checkout all repos in the correct branch
meta git update
meta exec "git checkout feature/2.0-cleanup"

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

# build all packages
meta exec "npm run build" --exclude skeleton
