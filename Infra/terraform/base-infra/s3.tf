resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "artifact_bucket" {
  bucket        = var.s3_bucket_name != "" ? var.s3_bucket_name : "${var.project}-${random_id.bucket_suffix.hex}"
  force_destroy = false

  tags = {
    Name    = "${var.project}-artifacts"
    Project = var.project
  }
}

resource "aws_s3_bucket_acl" "artifact_bucket" {
  bucket = aws_s3_bucket.artifact_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_versioning" "artifact_bucket" {
  bucket = aws_s3_bucket.artifact_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifact_bucket" {
  bucket = aws_s3_bucket.artifact_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket = aws_s3_bucket.artifact_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
