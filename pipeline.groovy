pipeline {
    agent any
    stages {
        stage('echo hello world') {
            steps {
                echo 'Hello, World'
            }
        }
    }
}
