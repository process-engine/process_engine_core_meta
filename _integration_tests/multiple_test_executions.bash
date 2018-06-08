#!/bin/bash
#
# This script runs the integration tests multiple times.
# You can specify the number of iterations by the first command line argument. If this
# Argument is not given, the script executes the integration tests 20 times.

DOCKER_CONTAINER_NAME='process_engine_postrgres_container';
DOCKER_IMAGE_NAME='process_engine_postrgres';
DOCKER_VOLUME_NAME='process_engine_postgres_volume';

PG_DEFAULT_USERNAME='admin';
PG_DEFAULT_USER_PASSWORD='admin';
PG_DATABASE_NAME='processengine';
PG_DATABASE_PORT=5432;

testWasSucessfull=true;
maxTries=20;
resetDatabase=false;

if [[ "$1" =~ ^[0-9]+$ ]]; then
  maxTries=$1
fi

if [[ "$1" == "--reset-datastore" ]] || [[ "$2" == "--reset-datastore" ]]; then
  resetDatabase=true;
fi

# Initially reset the database
#echo resetting database...
#node ../skeleton/database/postgres_docker.js reset demoset demo;

function runTestsInLoop() {
  # Run the test until the max tries is reached.
  printf "\nStarting max $maxTries test runs\n"
  for run in `seq 1 $maxTries`
  do
    echo Running test number $run;
    npm test;
    testExitCode="$?";

    if [[ "$testExitCode" != 0 ]]; then
      echo -------- Test Failed on Run "$run" --------
      testWasSucessfull=false;
      break;
    fi
  done

  if [[ "$testWasSucessfull" == true ]]; then
    echo ran $maxTries tests without an error!
  fi
}


#######################################
# Returns the id of the running postgres container
#######################################
function getContainerId() {
  echo $(docker ps --quiet --filter name=$DOCKER_CONTAINER_NAME);
}


#######################################
# Stops the postgres container with the given container id.
# Args:
#   id: Id of the container that should be stopped.
#######################################
function stopDBContainer() {
  containerId="$1";

  # If the container is already stopped, the resulting container ID should be empty.
  if [[ $containerId == "" ]]; then
    echo "The container is already stopped";
    return;
  fi

  echo "Stopping Postgres container..."
  docker stop "$containerId" > /dev/null;
}

#######################################
# Removes the docker container with the given id.
# Args:
#   id: Id of the container that should be removed.
#######################################
function removeContainer() {
  containerId="$1";

  # Only remove the container, it if exists.
  if [[ "$containerId" ]]; then
    echo "Removing current container....";
    docker rm "${containerId}" > /dev/null;
  else
    echo "The container was already removed!";
  fi
}

#######################################
# Removes the volume which belongs to the postgres docker container.
#######################################
function removeVolume() {
  volumeId=$(docker volume ls --quiet --filter name="$DOCKER_VOLUME_NAME");
  
  # If the volume exists, remove it.
  if [[ "$volumeId" ]]; then
    echo Removing volume "$DOCKER_VOLUME_NAME"...;
    docker volume rm "$volumeId" > /dev/null;
  else
    echo "The volume "$DOCKER_VOLUME_NAME" was already removed.";
  fi
}

#######################################
# Creates a new Postgres docker container.
#######################################
function createAndRunPostgresContainer() {
  echo "building new Postgres Docker Container...";
  docker build\
    --file Dockerfile.database \
    --tag "$DOCKER_IMAGE_NAME" \
    . > /dev/null;

  echo "starting the docker container...";
  docker run \
  --detach \
  --env POSTGRES_USER="$PG_DEFAULT_USERNAME" \
  --env POSTGRES_PASSWORD="$PG_DEFAULT_USER_PASSWORD"  \
  --env POSTGRES_DB="$PG_DATABASE_NAME" \
  --publish "$PG_DATABASE_PORT":5432 \
  --name "$DOCKER_CONTAINER_NAME" \
  --mount source="$DOCKER_VOLUME_NAME",target=/dbdata \
  "$DOCKER_IMAGE_NAME" > /dev/null;
  }

#######################################
# Stops and removes the postgres container including the volume.
#######################################
function clearDocker() {
  # Optain the container id of the postgres docker container
  containerId=$(getContainerId);

  # Stop the container
  stopDBContainer "$containerId";

  # Remove the container
  removeContainer "$containerId";

  # Remove the volume
  removeVolume;

  # Create and run the docker container for the postgres database
  createAndRunPostgresContainer;

  # Give postgres some time to start up
  sleep 2;
}

if [[ "$resetDatabase" == true ]]; then
  clearDocker;
fi

runTestsInLoop;
