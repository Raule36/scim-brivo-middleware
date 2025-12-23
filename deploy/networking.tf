data "aws_vpc" "main" {
  id = "vpc-0539793d8c11d069d"
}

data "aws_subnets" "main" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
}

data "aws_security_group" "app" {
  id = "sg-044b0297c66bf9866"
}