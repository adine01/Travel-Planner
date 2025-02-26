pipeline {
    agent any


    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        DB_CREDS = credentials('db-credentials')
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
                        sh 'terraform init'  // Changed from bat to sh for Linux
                    }
                }

                stage('Terraform Plan/Destroy') {
                    steps {
                        script {
                            if (params.INFRASTRUCTURE_ACTION == 'destroy') {
                                sh 'terraform plan -destroy -out=tfplan'
                            } else {
                                sh 'terraform plan -out=tfplan'
                            }
                        }
                    }
                }

                stage('Terraform Apply') {
                    when {
                        expression { params.INFRASTRUCTURE_ACTION == 'apply' || params.INFRASTRUCTURE_ACTION == 'destroy' }
                    }
                    steps {
                        input "Execute ${params.INFRASTRUCTURE_ACTION} action?"
                        sh 'terraform apply -auto-approve tfplan'
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
                            env.EC2_IP = sh(
                                script: 'terraform output -raw instance_public_ip',
                                returnStdout: true
                            ).trim()
                            env.DB_HOST = sh(
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

                        writeFile file: '/var/lib/jenkins/workspace/travel-planner/inventory.ini', text: """
                        [webservers]
                        ${env.EC2_IP} ansible_user=ec2-user ansible_ssh_private_key_file=${SSH_KEY}
                        """

                    } catch (Exception e) {
                        error "Failed to setup environment: ${e.getMessage()}"
                    }
                }
            }
        }

        //do not need test for now
        stage('Build') {
            when { expression { params.INFRASTRUCTURE_ACTION != 'destroy' } }
            steps {
                sh '''
                    node --version
                    npm --version
                    npm install
                '''
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