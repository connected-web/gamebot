#!groovy
pipeline {
    agent any

    parameters {

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
                echo "Stub deploy step"
            }
        }
    }
}
