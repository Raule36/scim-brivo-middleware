resource "aws_secretsmanager_secret" "postgres" {
  name = "${var.environment}/${var.project_name}/postgres"
}

resource "aws_secretsmanager_secret" "scim_basic_auth" {
  name = "${var.environment}/${var.project_name}/scim-basic-auth"
}