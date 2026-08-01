locals {
  prefix = "devops-openagent"
  env    = var.env
}

module "eks" {
  source = "../modules"
  env    = var.env
  # Use a fixed prefix to keep resource names predictable and short
  cluster-name                   = "${local.prefix}-${substr(var.cluster-name, 0, 20)}"
  cidr-block                     = var.vpc-cidr-block
  vpc-name                       = "${local.prefix}-${substr(var.vpc-name, 0, 20)}"
  base_infra_s3_bucket_name      = var.base_infra_s3_bucket_name
  base_infra_dynamodb_table_name = var.base_infra_dynamodb_table_name
  igw-name                       = "${local.prefix}-${substr(var.igw-name, 0, 20)}"
  pub-subnet-count               = var.pub-subnet-count
  pub-cidr-block                 = var.pub-cidr-block
  pub-availability-zone          = var.pub-availability-zone
  pub-sub-name                   = "${local.prefix}-${substr(var.pub-sub-name, 0, 20)}"
  pri-subnet-count               = var.pri-subnet-count
  pri-cidr-block                 = var.pri-cidr-block
  pri-availability-zone          = var.pri-availability-zone
  pri-sub-name                   = "${local.prefix}-${substr(var.pri-sub-name, 0, 20)}"
  public-rt-name                 = "${local.prefix}-${substr(var.public-rt-name, 0, 20)}"
  private-rt-name                = "${local.prefix}-${substr(var.private-rt-name, 0, 20)}"
  eip-name                       = "${local.prefix}-${substr(var.eip-name, 0, 20)}"
  ngw-name                       = "${local.prefix}-${substr(var.ngw-name, 0, 20)}"
  eks-sg                         = var.eks-sg

  is_eks_role_enabled           = true
  is_eks_nodegroup_role_enabled = true
  ondemand_instance_types       = var.ondemand_instance_types
  spot_instance_types           = var.spot_instance_types
  desired_capacity_on_demand    = var.desired_capacity_on_demand
  min_capacity_on_demand        = var.min_capacity_on_demand
  max_capacity_on_demand        = var.max_capacity_on_demand
  desired_capacity_spot         = var.desired_capacity_spot
  min_capacity_spot             = var.min_capacity_spot
  max_capacity_spot             = var.max_capacity_spot
  is-eks-cluster-enabled        = var.is-eks-cluster-enabled
  cluster-version               = var.cluster-version
  endpoint-private-access       = var.endpoint-private-access
  endpoint-public-access        = var.endpoint-public-access

  create_bastion              = var.create_bastion
  bastion_instance_type       = var.bastion_instance_type
  bastion_public_subnet_index = var.bastion_public_subnet_index

  addons = var.addons
}