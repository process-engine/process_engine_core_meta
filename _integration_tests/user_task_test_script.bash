#!/bin/bash

MAX_TRIES=20;
TEST_WAS_SUCESSFULL=true;

# Initially reset the database
node ../skeleton/database/postgres_docker.js reset demoset demo;

# Run the test until the max tries is reached.
for run in `seq 1 $MAX_TRIES`
do
  echo Running test number $run;
  npm test;
  testExitCode=$?;

  if [[ $testExitCode != 0 ]]; then
    echo -------- Test Failed on Run $run --------
    TEST_WAS_SUCESSFULL=false;
    break;
  fi
done

if $TEST_WAS_SUCESSFULL; then
  echo ran $MAX_TRIES tests without an error!
fi

