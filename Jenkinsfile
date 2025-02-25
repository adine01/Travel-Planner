pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "your-docker-registry/wanderwise:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry('https://your-docker-registry', 'docker-credentials-id') {
                        docker.image(DOCKER_IMAGE).push()
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                sh "ansible-playbook -i inventory/staging playbook.yml"
            }
        }

        stage('Integration Tests') {
            steps {
                sh 'npm run test:integration'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input "Deploy to production?"
                sh "ansible-playbook -i inventory/production playbook.yml"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}

