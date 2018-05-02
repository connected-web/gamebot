#!groovy
pipeline {
    agent any

    parameters {
        string(defaultValue: "192.168.0.1", description: "The IP address of the target machine to deploy to.", name: "TARGET_IP")
    }

    stages {

        stage('Initialize') {
            steps {
                echo 'Initializing...'
                def node = tool name: 'Node 8 LTS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                env.PATH = "${node}/bin:${env.PATH}"
            }
        }

        stage("Build") {
            steps {
              echo "Checkout latest code"
              checkout scm

              sh 'node -v'
            }
        }

        stage("Test") {
            steps {
                echo "Running tests"
                sh 'npm prune'
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage("Deploy") {
            steps {
                echo "Stub deploy step to: ${params.TARGET_IP}"
            }
        }
    }
}
