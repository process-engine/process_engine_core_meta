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
  sh(script: "docker rmi ${server_image_id}");

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
  def passing_regex = /\d+ passing/;
  def failing_regex = /\d+ failing/;
  def pending_regex = /\d+ pending/;

  def passing_matcher = testlog =~ passing_regex;
  def failing_matcher = testlog =~ failing_regex;
  def pending_matcher = testlog =~ pending_regex;

  def passing = passing_matcher.count > 0 ? passing_matcher[0] : '0 passing';
  def failing = failing_matcher.count > 0 ? failing_matcher[0] : '0 failing';
  def pending = pending_matcher.count > 0 ? pending_matcher[0] : '0 pending';

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

          server_image   = docker.build("process_engine_test_server_image:${image_tag}", '--no-cache --file _integration_tests/Dockerfile.tests _integration_tests');

          server_image_id  = server_image.id;
        }
      }
    }
    stage('Process Engine Tests') {
      steps {
        script {
          // image.inside mounts the current Workspace as the working directory in the container
          def node_env = '--env NODE_ENV=sqlite';
          def junit_report_path = '--env JUNIT_REPORT_PATH=report.xml';
          def config_path = '--env CONFIG_PATH=/usr/src/app/config';

          // SQLite
          def db_storage_folder_path = "$WORKSPACE/process_engine_databases";
          def logging_folder_path = "$WORKSPACE/logs";
          def db_storage_path_correlation = "--env process_engine__correlation_repository__storage=$db_storage_folder_path/processengine.sqlite";
          def db_storage_path_logging = "--env process_engine__logging_repository__log_output_path=$logging_folder_path";
          def db_storage_path_process_model = "--env process_engine__process_model_repository__storage=$db_storage_folder_path/processengine.sqlite";
          def db_storage_path_flow_node_instance = "--env process_engine__flow_node_instance_repository__storage=$db_storage_folder_path/processengine.sqlite";
          def db_storage_path_timer = "--env process_engine__timer_repository__storage=$db_storage_folder_path/processengine.sqlite";

          server_image.inside("${node_env} ${db_storage_path_logging} ${db_storage_path_correlation} ${db_storage_path_process_model} ${db_storage_path_flow_node_instance} ${db_storage_path_timer} ${junit_report_path} ${config_path}") {
            error_code = sh(script: "node /usr/src/app/node_modules/.bin/mocha --timeout 120000 /usr/src/app/test/*.js --colors --reporter mocha-jenkins-reporter --exit > result.txt", returnStatus: true);
            testresults = sh(script: "cat result.txt", returnStdout: true).trim();

            junit 'report.xml'

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
          // Failure to send the slack message should not result in build failure.
          try {
            slack_send_summary(testresults, test_failed);
            slack_send_testlog(testresults);
          } catch (Exception error) {
            echo "Failed to send slack report: $error";
          }
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

        // Ignore any failures during docker clean up.
        // 'docker image prune --force' fails if
        // two builds run simultaneously.
        try {
          cleanup_docker();
        } catch (Exception error) {
          echo "Failed to cleanup docker $error";
        }
      }
    }
  }
}
