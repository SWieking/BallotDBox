FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx hardhat compile

RUN mkdir -p ./blockchain_abi/

RUN cp ./artifacts/contracts/BallotBox.sol/BallotBox.json ./blockchain_abi/

ENV DOCKER=true

EXPOSE 8545

CMD ./start-node_deploy-contract.sh

