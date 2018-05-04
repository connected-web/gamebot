node {
    stage('Initialize') {
        echo 'Initializing...'
        def node = tool name: 'Node 8 LTS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        env.PATH = "${node}/bin:${env.PATH}"
    }

    stage('Checkout') {
        echo "Checkout latest code"
        checkout scm

        sh 'node -v'
    }

    stage('Credentials') {
        echo "Test out credentials"
        PRIVATE_KEY = credentials('jenkins.id_rsa')
        echo "Private key: ${PRIVATE_KEY} ?"
    }

    stage('Test') {
        echo "Running tests"
        sh 'npm prune'
        sh 'npm install'
        sh 'npm test'
    }

    stage('Deploy') {
        echo "Stub deploy step to: ${params.TARGET_IP}"
    }
}
