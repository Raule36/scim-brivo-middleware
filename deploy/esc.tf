resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

resource "aws_ecs_task_definition" "app" {
  family                   = var.project_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = var.project_name
      image     = "${aws_ecr_repository.app_repository.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "PORT", value = "3000" },
        { name = "NODE_ENV", value = "production" },
        { name = "DB_NAME", value = "postgres" },
        { name = "BRIVO_MODE", value = "mock" }
      ]

      secrets = [
        {
          name      = "DB_HOST"
          valueFrom = "${aws_secretsmanager_secret.postgres.arn}:host::"
        },
        {
          name      = "DB_PORT"
          valueFrom = "${aws_secretsmanager_secret.postgres.arn}:port::"
        },
        {
          name      = "DB_USER"
          valueFrom = "${aws_secretsmanager_secret.postgres.arn}:username::"
        },
        {
          name      = "DB_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.postgres.arn}:password::"
        },
        {
          name      = "SCIM_BASIC_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.scim_basic_auth.arn}:username::"
        },
        {
          name      = "SCIM_BASIC_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.scim_basic_auth.arn}:password::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}"
          "awslogs-create-group"  = "true"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = var.project_name
    container_port   = 3000
  }

  network_configuration {
    subnets          = data.aws_subnets.main.ids
    security_groups  = [data.aws_security_group.app.id]
    assign_public_ip = true
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution]
}