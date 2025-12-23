variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "project_name" {
  type    = string
  default = "brivo-scim-gateway"
}

variable "github_repo" {
  type    = string
  default = "Raule36/scim-brivo-middleware"
}

variable "db_password" {
  type = string
  sensitive = true
}