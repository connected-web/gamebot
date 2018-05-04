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
        SSH_KEY_FOR_TARGET = credentials('jenkins.id_rsa')
        echo "SSH Credential For Target: ${SSH_KEY_FOR_TARGET} ?"
    }

    stage('Test') {
        echo "Running tests"
        sh 'npm prune'
        sh 'npm install'
        sh 'npm test'
    }

    withCredentials([sshUserPrivateKey(credentialsId: "jenkins.id_rsa")]) {
        stage('Deploy using SSH Key') {
            TARGET_IP = params.TARGET_IP
            echo "Stub deploy step to: ${TARGET_IP}"
            echo "Null pointer exception? Why?"
        }
    }
}
