#!/bin/bash
# Remove existing keys if they exist
rm -f wanderwise-key wanderwise-key.pub

# Generate new SSH key pair
ssh-keygen -t rsa -b 2048 -f wanderwise-key -N "" -C "ec2-user"

# Set correct permissions
chmod 600 wanderwise-key
chmod 644 wanderwise-key.pub

# Delete existing AWS key pair if it exists
aws ec2 delete-key-pair --key-name wanderwise-key

# Import new key pair to AWS
aws ec2 import-key-pair \
    --key-name wanderwise-key \
    --public-key-material fileb://wanderwise-key.pub

echo "SSH key pair setup complete!"
