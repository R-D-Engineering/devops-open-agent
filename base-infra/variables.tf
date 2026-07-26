variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name prefix for resources"
  type        = string
  default     = "devops-open-agent"
}

variable "s3_bucket_name" {
  description = "Optional explicit S3 bucket name. Leave empty to create a generated name."
  type        = string
  default     = ""
}
