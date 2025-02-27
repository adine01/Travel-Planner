variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "region" {
  default = "us-west-2"
}


variable "ssh_public_key" {
  description = "Public key for EC2 SSH access"
  type        = string
}