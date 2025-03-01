provider "aws" {
  region = "us-west-2"
}

# VPC with internet access
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "wanderwise-vpc"
  }
}

# Create subnets in two AZs
resource "aws_subnet" "main" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-west-2a"

  tags = {
    Name = "wanderwise-subnet-1"
  }
}

resource "aws_subnet" "secondary" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-west-2b"

  tags = {
    Name = "wanderwise-subnet-2"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "default" {
  name       = "wanderwise-db-subnet-group"
  subnet_ids = [aws_subnet.main.id, aws_subnet.secondary.id]

  tags = {
    Name = "WanderWise DB subnet group"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "wanderwise-igw"
  }
}

# Route table
resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "wanderwise-rt"
  }
}

# Route table associations
resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

resource "aws_route_table_association" "secondary" {
  subnet_id      = aws_subnet.secondary.id
  route_table_id = aws_route_table.main.id
}

# Update security group to allow all traffic
resource "aws_security_group" "allow_web" {
  name   = "allow_web_traffic"
  vpc_id = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "All Traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami           = "ami-008fe2fc65df48dac"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.allow_web.id]
  associate_public_ip_address = true
  
user_data = <<-EOF
              #!/bin/bash
              # Update system and install packages
              apt-get update
              apt-get install -y python3 python3-pip docker.io openssh-server
              
              # Configure SSH for completely open access (DANGEROUS!)
              cat > /etc/ssh/sshd_config <<'EOL'
              Port 22
              PermitRootLogin yes
              PubkeyAuthentication no
              PasswordAuthentication yes
              PermitEmptyPasswords yes
              UsePAM no
              ChallengeResponseAuthentication no
              AuthenticationMethods none
              EOL
              
              # Create ec2-user with no password
              useradd -m -s /bin/bash ec2-user
              passwd -d ec2-user
              
              # Give ec2-user ALL permissions without password
              echo "ec2-user ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ec2-user
              chmod 440 /etc/sudoers.d/ec2-user
              
              # Configure Docker
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ec2-user
              
              # Restart SSH with new configuration
              systemctl restart sshd
              EOF
              
  tags = {
    Name = "WanderWise-WebServer"
  }
}

# RDS Instance with basic configuration
resource "aws_db_instance" "default" {
  identifier           = "wanderwise-db"
  engine              = "postgres"
  engine_version      = "13"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  storage_type        = "gp2"
  username            = var.db_username
  password            = var.db_password
  db_name             = "wanderwise"  # Add database name
  skip_final_snapshot = true
  publicly_accessible = false  # Change to false for security
  multi_az            = false

  vpc_security_group_ids = [aws_security_group.allow_postgres.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name

  tags = {
    Name = "WanderWise-Database"
  }
}

# Security group for RDS
resource "aws_security_group" "allow_postgres" {
  name        = "allow_postgres"
  description = "Allow PostgreSQL inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from Web Server"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.allow_web.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "wanderwise-db-sg"
  }
}
