pipeline {
    agent any

    parameters {
        booleanParam(defaultValue: true, description: '', name: 'booleanExample')
        string(defaultValue: "TEST", description: 'What environment?', name: 'stringExample')
        text(defaultValue: "This is a multiline\n text", description: "Multiline Text", name: "textExample")
        choice(choices: 'US-EAST-1\nUS-WEST-2', description: 'What AWS region?', name: 'choiceExample')
        password(defaultValue: "Password", description: "Password Parameter", name: "passwordExample")
    }

    stages {
        stage("my stage") {
            steps {
                echo "booleanExample: ${params.booleanExample}"
                echo "stringExample: ${params.stringExample}"
                echo "textExample: ${params.textExample}"
                echo "choiceExample: ${params.choiceExample}"
                echo "passwordExample: ${params.passwordExample}"
            }
        }
    }
}
