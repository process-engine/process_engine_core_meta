#!/bin/bash

testWasSucessfull=true;
maxTries=20;

if [[ $1 -ne 0 ]]; then
  maxTries=$1
fi


# Initially reset the database
echo resetting database...
node ../skeleton/database/postgres_docker.js reset demoset demo;

# Run the test until the max tries is reached.
printf "\nStarting max $maxTries test runs\n"
for run in `seq 1 $maxTries`
do
  echo Running test number $run;
  npm test;
  testExitCode=$?;

  if [[ $testExitCode != 0 ]]; then
    echo -------- Test Failed on Run $run --------
    testWasSucessfull=false;
    break;
  fi
done

if $testWasSucessfull; then
  echo ran $maxTries tests without an error!
fi

