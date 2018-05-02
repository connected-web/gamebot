node {
    checkout scm
    stage('Build') {
        echo "Building version ${env.BUILD_ID}"
        npm run build
    }
    stage('Test') {
        echo "Testing build ${env.BUILD_ID}"
        npm run test
    }
    stage('Deploy') {
        echo "Deploying build ${env.BUILD_ID} to ${env.TARGET_IP}"
        npm run deploy ${env.TARGET_IP}
    }
}
