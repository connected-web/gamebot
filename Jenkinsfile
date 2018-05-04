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

    stage('Deploy') {
        echo "Stub deploy step to: ${params.TARGET_IP}"
        withCredentials([sshUserPrivateKey(credentialsId: "jenkins.id_rsa")]) {
            stage('Deploy using SSH Key') {
            sh """
              ssh -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET pi@${params.TARGET_IP} <<'ENDSSH'
              ls -la
              node -v
              npm -v
              sudo systemctl daemon-reload

              ENDSSH
            """
            }
        }
    }
}
