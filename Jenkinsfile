pipeline {
    agent any

    environment {
        AWS_CREDENTIALS = credentials('aws-credentials')
        DB_CREDS = credentials('db-credentials')
        TERRAFORM_ACTION = 'plan' // Default to plan
        JWT_SECRET = credentials('jwt-secret')
        DOCKER_REGISTRY = 'amarasenaisuru'
        SSH_KEY = credentials('ssh-key')
    }

    parameters {
    choice(
        name: 'INFRASTRUCTURE_ACTION',
        choices: ['none', 'apply', 'destroy'],
        description: '''Select infrastructure action:
        - none: Regular code deployment (DEFAULT - use this most of the time)
        - apply: First time setup or when infrastructure changes needed
        - destroy: Remove all AWS resources (use with caution!)'''
    )
}

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Infrastructure Steps') {
            when {
                expression { params.INFRASTRUCTURE_ACTION != 'none' }
            }
            stages {
                stage('Setup Terraform') {
                    steps {
                        script {
                            writeFile file: 'terraform.tfvars', text: """
                                db_username = "${DB_CREDS_USR}"
                                db_password = "${DB_CREDS_PSW}"
                            """
                        }
                    }
                }

                stage('Terraform Init') {
                    steps {
                        withAWS(credentials: AWS_CREDENTIALS) {
                            bat 'terraform init'
                        }
                    }
                }

                stage('Terraform Plan/Destroy') {
                    steps {
                        withAWS(credentials: AWS_CREDENTIALS) {
                            script {
                                if (params.INFRASTRUCTURE_ACTION == 'destroy') {
                                    bat 'terraform plan -destroy -out=tfplan'
                                } else {
                                    bat 'terraform plan -out=tfplan'
                                }
                            }
                        }
                    }
                }

                stage('Terraform Apply') {
                    when {
                        expression { params.INFRASTRUCTURE_ACTION == 'apply' || params.INFRASTRUCTURE_ACTION == 'destroy' }
                    }
                    steps {
                        withAWS(credentials: AWS_CREDENTIALS) {
                            input "Execute ${params.INFRASTRUCTURE_ACTION} action?"
                            bat 'terraform apply -auto-approve tfplan'
                        }
                    }
                }
            }
        }

        stage('Setup Environment') {
            when { expression { params.INFRASTRUCTURE_ACTION != 'destroy' } }
            steps {
                script {
                    try {
                        // Get infrastructure outputs if they exist
                        if (params.INFRASTRUCTURE_ACTION == 'apply') {
                            env.EC2_IP = bat(
                                script: 'terraform output -raw instance_public_ip',
                                returnStdout: true
                            ).trim()
                            env.DB_HOST = bat(
                                script: 'terraform output -raw rds_endpoint',
                                returnStdout: true
                            ).trim()
                        }

                        writeFile file: '.env', text: """
                            DB_USER=${DB_CREDS_USR}
                            DB_PASSWORD=${DB_CREDS_PSW}
                            DB_NAME=wanderwise
                            DB_HOST=${env.DB_HOST ?: 'localhost'}
                            JWT_SECRET=${JWT_SECRET}
                            NODE_ENV=production
                        """

                        writeFile file: 'inventory.ini', text: """
                            [webservers]
                            ${env.EC2_IP} ansible_user=ec2-user ansible_ssh_private_key_file=${SSH_KEY}
                        """

                    } catch (Exception e) {
                        error "Failed to setup environment: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Build & Test') {
            when { expression { params.INFRASTRUCTURE_ACTION != 'destroy' } }
            steps {
                bat 'npm install'
                bat 'npm run build'
            }
        }

        stage('Docker Build & Push') {
            when { expression { params.INFRASTRUCTURE_ACTION != 'destroy' } }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-registry') {
                        def dockerImage = docker.build("${DOCKER_REGISTRY}/wanderwise:${BUILD_NUMBER}")
                        dockerImage.push()
                    }
                }
            }
        }

        stage('Deploy') {
            when { expression { params.INFRASTRUCTURE_ACTION != 'destroy' } }
            steps {
                ansiblePlaybook(
                    playbook: 'playbook.yml',
                    inventory: 'inventory.ini',
                    credentialsId: 'ssh-key'
                )
            }
        }
    }

    post {
        success {
            script {
                if (params.INFRASTRUCTURE_ACTION == 'apply') {
                    echo "Infrastructure created successfully!"
                    echo "EC2 Instance IP: ${env.EC2_IP}"
                    echo "RDS Endpoint: ${env.DB_HOST}"
                }
            }
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
        always {
            cleanWs()
        }
    }
}