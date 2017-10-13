# install meta
npm install -g meta gulp

# setup the environment
./setup.sh
​
# run the backend
cd skeleton/process-engine-server-demo
npm start & disown
cd ../..

# run the frontend
cd charon
npm start
