def cleanup_workspace() {
  cleanWs();
  dir("${env.WORKSPACE}@tmp") {
    deleteDir();
  }
  dir("${env.WORKSPACE}@script") {
    deleteDir();
  }
  dir("${env.WORKSPACE}@script@tmp") {
    deleteDir();
  }
}

def cleanup_docker() {
  sh(script: "docker stop ${db_container_id}");
  sh(script: "docker rm ${db_container_id}");
  sh(script: "docker rmi ${server_image_id} ${db_imageI_id}");

  // Build stages in dockerfiles leave dangling images behind (see https://github.com/moby/moby/issues/34151).
  // Dangling images are images that are not used anywhere and don't have a tag. It is safe to remove them (see https://stackoverflow.com/a/45143234).
  // This removes all dangling images
  sh(script: "docker image prune --force");

  // Some Dockerfiles create volumes using the `VOLUME` command (see https://docs.docker.com/engine/reference/builder/#volume)
  // running the speedtests creates two dangling volumes. One is from postgres (which contains data), but i don't know about the other one (which is empty)
  // Dangling volumes are volumes that are not used anywhere. It is safe to remove them.
  // This removes all dangling volumes
  sh(script: "docker volume prune --force");
}

def slack_send_summary(testlog, test_failed) {
  def cleaned_string = testlog.replace('\n', '\\n').replace('"', '\\"');
  def passing = sh(script: "echo \"${cleaned_string}\" | grep passing || echo \"0 passing\"", returnStdout: true).trim();
  def failing = sh(script: "echo \"${cleaned_string}\" | grep failing || echo \"0 failing\"", returnStdout: true).trim();
  def pending = sh(script: "echo \"${cleaned_string}\" | grep pending || echo \"0 pending\"", returnStdout: true).trim();

  def color_string     =  '"color":"good"';
  def markdown_string  =  '"mrkdwn_in":["text","title"]';
  def title_string     =  "\"title\":\":white_check_mark: Process Engine Integration Tests for ${env.BRANCH_NAME} Succeeded!\"";
  def result_string    =  "\"text\":\"${passing}\\n${failing}\\n${pending}\"";
  def action_string    =  "\"actions\":[{\"name\":\"open_jenkins\",\"type\":\"button\",\"text\":\"Open this run\",\"url\":\"${RUN_DISPLAY_URL}\"}]";

  if (test_failed == true) {
    color_string = '"color":"danger"';
    title_string =  "\"title\":\":boom: Process Engine Integration Tests for ${env.BRANCH_NAME} Failed!\"";
  }

  slackSend(attachments: "[{$color_string, $title_string, $markdown_string, $result_string, $action_string}]");
}

def slack_send_testlog(testlog) {
  withCredentials([string(credentialsId: 'slack-file-poster-token', variable: 'SLACK_TOKEN')]) {

    def requestBody = [
      "token=${SLACK_TOKEN}",
      "content=${testlog}",
      "filename=process_engine_integration_tests.txt",
      "channels=process-engine_ci"
    ];

    httpRequest(
      url: 'https://slack.com/api/files.upload',
      httpMode: 'POST',
      contentType: 'APPLICATION_FORM',
      requestBody: requestBody.join('&')
    );
  }
}

pipeline {
  agent any

  stages {
    stage('Prepare') {
      steps {
        script {

          def first_seven_digits_of_git_hash = env.GIT_COMMIT.substring(0, 8);
          def safe_branch_name = env.BRANCH_NAME.replace("/", "_");
          def image_tag = "${safe_branch_name}-${first_seven_digits_of_git_hash}-b${env.BUILD_NUMBER}";

          db_image       = docker.build("process_engine_test_db_image:${image_tag}", '--file _integration_tests/Dockerfile.database _integration_tests');
          server_image   = docker.build("process_engine_test_server_image:${image_tag}", '--no-cache --file _integration_tests/Dockerfile.tests _integration_tests');

          db_imageI_id     = db_image.id;
          server_image_id  = server_image.id;

          db_container_id = db_image
                            .run('--env POSTGRES_USER=admin --env POSTGRES_PASSWORD=admin --env POSTGRES_DB=processengine')
                            .id;

          // wait for the DB to start up
          docker
            .image('postgres')
            .inside("--link ${db_container_id}:db") {
              sh(script: 'while ! pg_isready -U postgres -h db ; do sleep 5; done');
          }
        }
      }
    }
    stage('Process Engine Tests') {
      steps {
        script {
          // image.inside mounts the current Workspace as the working directory in the container
          def node_env = '--env NODE_ENV=test';
          def config_path = '--env CONFIG_PATH=/usr/src/app/config';
          def db_host = '--env datastore__service__data_sources__default__adapter__server__host=db';
          def db_link = "--link ${db_container_id}:db";

          server_image.inside("${node_env} ${config_path} ${db_host} ${db_link}") {
            error_code = sh(script: "node /usr/src/app/node_modules/.bin/mocha /usr/src/app/test/*.js --exit > result.txt", returnStatus: true);
            testresults = sh(script: "cat result.txt", returnStdout: true).trim();

            test_failed = false;
            currentBuild.result = 'SUCCESS'
            if (error_code > 0) {
              test_failed = true;
              currentBuild.result = 'FAILURE'
            }
          }
        }
      }
    }
    stage('Publish') {
      steps {
        script {
          // Print the result to the jobs console
          println(testresults);
          slack_send_summary(testresults, test_failed);
          slack_send_testlog(testresults);
        }
      }
    }
    stage('Cleanup') {
      steps {
        script {
          // This stage just exists, so the cleanup work that happens
          // in the post script will show up in its own stage in Blue Ocean.
          sh(script: ':', returnStdout: true);
        }
      }
    }
  }
  post {
    always {
      script {
        cleanup_workspace();
        cleanup_docker();
      }
    }
  }
}
