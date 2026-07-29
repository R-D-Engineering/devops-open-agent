output "bastion_instance_id" {
  value = length(aws_instance.bastion) > 0 ? aws_instance.bastion[0].id : ""
}

output "bastion_public_ip" {
  value = length(aws_instance.bastion) > 0 ? aws_instance.bastion[0].public_ip : ""
}

output "bastion_key_name" {
  value = length(aws_key_pair.bastion_key) > 0 ? aws_key_pair.bastion_key[0].key_name : ""
}

// WARNING: this will store the private key in state. Handle securely.
output "bastion_private_key_pem" {
  value     = length(tls_private_key.bastion) > 0 ? tls_private_key.bastion[0].private_key_pem : ""
  sensitive = true
}
