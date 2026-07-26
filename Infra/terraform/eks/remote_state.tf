data "terraform_remote_state" "base_infra" {
  backend = "s3"

  config = {
    bucket         = "devops-openagent-state"
    key            = "base-infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "devops-openagent-lock-files"
    encrypt        = true
  }
}

locals {
  base_s3_bucket_name      = data.terraform_remote_state.base_infra.outputs.s3_bucket_name
  base_dynamodb_table_name = data.terraform_remote_state.base_infra.outputs.dynamodb_table_name
}

output "base_infra_s3_bucket_name" {
  value = local.base_s3_bucket_name
}

output "base_infra_dynamodb_table_name" {
  value = local.base_dynamodb_table_name
}
