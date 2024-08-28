#!/bin/bash

set -m

npx hardhat node &

until nc -z localhost 8545; do
  echo "Waiting for hardhat node..."
  sleep 1
done

echo "Hardhat node is up, running the deploy script..."

npx hardhat run scripts/deploy.js --network localhost

#fg %1
while true; do
  sleep 1000
done