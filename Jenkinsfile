pipeline {
    agent any

    options {
        // Add cleanup options
        disableConcurrentBuilds()
        skipDefaultCheckout(false)
    }

    tools {
        nodejs 'Node20.13.1'  // Match your WSL Ubuntu version
        git 'Default' 
    }


    environment {
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        DB_CREDS = credentials('db-credentials')
        JWT_SECRET = credentials('jwt-secret')
        DOCKER_REGISTRY = 'isuruamarasena'
        SSH_KEY = credentials('ssh-key')
        AWS_DEFAULT_REGION    = 'us-west-2'
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
                // Add clean checkout
                cleanWs()
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [[$class: 'CleanBeforeCheckout']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/adine01/Travel-Planner.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
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
                            if (params.INFRASTRUCTURE_ACTION == 'apply') {
                                // Create keys directory
                                sh 'mkdir -p keys'

                                // Write SSH keys
                                withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key', keyFileVariable: 'SSH_KEY')]) {
                                    sh '''
                                        cp "$SSH_KEY" keys/wanderwise-key
                                        chmod 600 keys/wanderwise-key
                                        ssh-keygen -y -f keys/wanderwise-key > keys/wanderwise-key.pub
                                        chmod 644 keys/wanderwise-key.pub
                                    '''
                                }

                                // Clean up existing key pair
                                sh '''
                                    echo "Checking for existing key pair..."
                                    KEY_PAIR=$(aws ec2 describe-key-pairs --key-names wanderwise-key --query 'KeyPairs[*].KeyName' --output text || echo "")
                                    if [ ! -z "$KEY_PAIR" ]; then
                                        echo "Deleting existing key pair: $KEY_PAIR"
                                        aws ec2 delete-key-pair --key-name wanderwise-key
                                    fi
                                '''
                            }
                            if (params.INFRASTRUCTURE_ACTION == 'destroy') {
                                sh '''
                                    # Clean up RDS instances first
                                    echo "Checking for RDS instances..."
                                    RDS_INSTANCES=$(aws rds describe-db-instances --query 'DBInstances[?DBInstanceIdentifier==`wanderwise-db`].DBInstanceIdentifier' --output text)
                                    if [ ! -z "$RDS_INSTANCES" ]; then
                                        echo "Deleting RDS instance: $RDS_INSTANCES"
                                        aws rds delete-db-instance --db-instance-identifier wanderwise-db --skip-final-snapshot --delete-automated-backups
                                        echo "Waiting for RDS instance to be deleted..."
                                        aws rds wait db-instance-deleted --db-instance-identifier wanderwise-db
                                    fi

                                    # Clean up DB subnet groups
                                    echo "Checking for DB subnet groups..."
                                    aws rds delete-db-subnet-group --db-subnet-group-name wanderwise-db-subnet-group || true
                                    
                                    # Clean up VPCs and associated resources
                                    echo "Checking for existing VPCs..."
                                    VPCS=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=wanderwise-vpc" --query 'Vpcs[*].VpcId' --output text)
                                    for VPC in $VPCS; do
                                        echo "Cleaning up VPC: $VPC"
                                        
                                        # First, disassociate and release Elastic IPs
                                        EIPS=$(aws ec2 describe-addresses --filters "Name=domain,Values=vpc" --query 'Addresses[*].AllocationId' --output text)
                                        for EIP in $EIPS; do
                                            echo "Releasing Elastic IP: $EIP"
                                            aws ec2 release-address --allocation-id $EIP || true
                                        done
                                        
                                        # Terminate EC2 instances
                                        INSTANCES=$(aws ec2 describe-instances --filters "Name=vpc-id,Values=$VPC" --query 'Reservations[].Instances[].InstanceId' --output text)
                                        if [ ! -z "$INSTANCES" ]; then
                                            echo "Terminating EC2 instances: $INSTANCES"
                                            aws ec2 terminate-instances --instance-ids $INSTANCES || true
                                            echo "Waiting for instances to terminate..."
                                            aws ec2 wait instance-terminated --instance-ids $INSTANCES
                                        fi
                                        
                                        # Detach and delete Internet Gateways
                                        IGW=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC" --query 'InternetGateways[*].InternetGatewayId' --output text)
                                        if [ ! -z "$IGW" ]; then
                                            echo "Detaching and deleting Internet Gateway: $IGW"
                                            aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC || true
                                            aws ec2 delete-internet-gateway --internet-gateway-id $IGW || true
                                        fi
                                        
                                        # Delete Subnets
                                        SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC" --query 'Subnets[*].SubnetId' --output text)
                                        for SUBNET in $SUBNETS; do
                                            echo "Deleting subnet: $SUBNET"
                                            aws ec2 delete-subnet --subnet-id $SUBNET || true
                                        done
                                        
                                        # Delete Route Tables (except main)
                                        RTS=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text)
                                        for RT in $RTS; do
                                            echo "Deleting route table: $RT"
                                            aws ec2 delete-route-table --route-table-id $RT || true
                                        done
                                        
                                        # Delete Security Groups (skip default)
                                        SGS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text)
                                        for SG in $SGS; do
                                            echo "Deleting security group: $SG"
                                            aws ec2 delete-security-group --group-id $SG || true
                                        done
                                        
                                        echo "Deleting VPC: $VPC"
                                        aws ec2 delete-vpc --vpc-id $VPC || true
                                    done
                                    
                                    echo "Waiting for resources to be cleaned up..."
                                    sleep 60
                                '''
                            }

                            // Original terraform.tfvars creation
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
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Installing dependencies..."
                    npm ci  // Using ci instead of install for cleaner installs
                '''
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            # Login to Docker Hub
                            echo "$DOCKER_PASS" | docker login -u isuruamarasena --password-stdin
                            
                            # Build the image
                            docker build -t isuruamarasena/wanderwise:${BUILD_NUMBER} .
                            
                            # Push the image
                            docker push isuruamarasena/wanderwise:${BUILD_NUMBER}
                            
                            # Tag and push latest
                            docker tag isuruamarasena/wanderwise:${BUILD_NUMBER} isuruamarasena/wanderwise:latest
                            docker push isuruamarasena/wanderwise:latest
                            
                            # Cleanup
                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            when { 
                expression { params.INFRASTRUCTURE_ACTION != 'destroy' }
            }
            steps {
                script {
                    try {
                        // Use SSH credentials properly
                        withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key', keyFileVariable: 'SSH_KEY_FILE')]) {
                            // Create inventory file with proper key path
                            writeFile file: 'inventory.ini', text: """[webservers]
        ${env.EC2_IP} ansible_user=ec2-user ansible_ssh_private_key_file=${SSH_KEY_FILE} ansible_ssh_common_args='-o StrictHostKeyChecking=no'"""

                            // Print inventory for debugging (mask the key)
                            sh 'cat inventory.ini | sed "s|${SSH_KEY_FILE}|****|g"'
                            
                            // Run Ansible playbook
                            ansiblePlaybook(
                                playbook: 'playbook.yml',
                                inventory: 'inventory.ini',
                                credentialsId: 'ssh-key',
                                extras: '-vvv',
                                colorized: true
                            )
                        }
                    } catch (Exception e) {
                        echo "Deployment failed: ${e.getMessage()}"
                        throw e
                    }
                }
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