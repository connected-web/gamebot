#!groovy
pipeline {
    agent any

    parameters {
        string(defaultValue: "192.168.0.1", description: "The IP address of the target machine to deploy to.", name: "TARGET_IP")
    }

    stages {
        stage("Build") {
            steps {
              echo "Checkout latest code"
              checkout scm
            }
        }

        stage("Test") {
            steps {
                echo "Running tests"
                npm test
            }
        }

        stage("Deploy") {
            steps {
                echo "Stub deploy step to: ${params.TARGET_IP}"
            }
        }
    }
}
