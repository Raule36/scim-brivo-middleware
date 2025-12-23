output "ecr_repository_url" {
  value = aws_ecr_repository.app_repository.repository_url
}

output "secrets_postgres_arn" {
  value = aws_secretsmanager_secret.postgres.arn
}

output "secrets_scim_basic_auth_arn" {
  value = aws_secretsmanager_secret.scim_basic_auth.arn
}

output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "rds_port" {
  value = aws_db_instance.main.port
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}