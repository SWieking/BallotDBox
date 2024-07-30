# BallotDBox

BallotDBox is a decentralized voting system designed to ensure secure, transparent, and anonymous voting. It integrates a web application with blockchain technology to authenticate voters, register votes, and maintain an immutable and transparent voting record. The system ensures that only eligible voters can participate, each voter can vote only once, and all votes are recorded in a tamper-proof manner on the blockchain.

## System Architecture and Voting Process Overview

![System Architecture](images/architecture.svg)

#### Authentication with ID Card

The voter first authenticates and registers an account with the web application. This authentication is done by entering personal data (name, ID number, ID PIN), which is then compared with the data of all eligible voters stored in the backend database.

#### Verification by the Backend Server

The backend server checks the entered data against the stored database entries (which contain all eligible voters). If the entered data matches a record in the database and the voter has not already registered an account, the authentication is considered successful, allowing the voter to register an account.

#### Registration of the Ether Address

-   After successful authentication and registration, before voting the voter is prompted to provide an Ether address via MetaMask.
-   The web application retrieves the currently active address from MetaMask and the user must confirm this address for voting.
- This Ether address is sent to the backend, where it is stored in the backend's database.
-  The backend, acting as the owner of the smart contract, performs a transaction to update the list of all registered Ether addresses eligible to vote on the blockchain.

#### Voting and Validation in the Smart Contract

-   The voter submits their vote through the web application.
-   The web application, utilizing MetaMask, sends the transaction (vote) to the Smart Contract. MetaMask securely handles the signing of the transaction with the voter's private key.
-   The Smart Contract verifies if the signer's Ether address (the address used to sign the transaction) is included in the list of registered and eligible addresses. If it is, the vote is accepted.
-   This ensures the authenticity of the transaction since the address used to sign cannot be faked.

#### Single Vote

The Smart Contract ensures that each registered Ether address can only vote once. After a vote has been cast, the Ether address is marked as "voted" to prevent multiple votes.

#### Storage and Transparency

-   The vote is immutably recorded on the blockchain by the Smart Contract, ensuring transparency and integrity.
-   Anyone can inspect the blockchain to verify that the voting process was carried out correctly and without tampering.
-   The transmission of the Ether address ensures anonymous voting as there is no direct link stored, between the voter and the Ether address used for voting .

___
___

## Prerequisites

Ensure you have the following installed on your system:
- Python 3.x
- pip (Python package installer)
- Node.js

## Installation

Follow these steps to set up the development environment and get the project started.

### Clone the repository

Open a terminal and clone the repository by execute the following command

```bash
git clone https://github.com/SWieking/BallotDBox.git
cd BallotDBox
```

### Backend Setup

**1. Navigate to the backend directory:**

```bash
cd ./backend
```

**2. Create a Virtual Environment:**

```bash
python3 -m venv env
source env/bin/activate  # For Unix or MacOS
env\Scripts\activate  # For Windows
```

**3. Install all required python dependencies:**

```bash
pip install -r requirements.txt
```

**4. Create .env file**

```bash
cp backend/.env.example backend/.env
```

Then, modify `backend/.env` with the values you obtained:

```plaintext
ETH_NODE_URL="http://127.0.0.1:8545/"
SMART_CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
SMART_CONTRACT_ABI_PATH="../blockchain/artifacts/contracts/BallotBox.sol/BallotBox.json"
CONTRACT_OWNER_PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```
These values typically do not need to be changed, but you can verify them as follows:

- **ETH_NODE_URL**: The URL where the Hardhat node is running. This can be found in the output of `npx hardhat node`, typically `http://127.0.0.1:8545/`.
- **SMART_CONTRACT_ADDRESS**: The address of the deployed smart contract. This is shown in the output of `npx hardhat run scripts/deploy.js --network localhost`.
- **SMART_CONTRACT_ABI_PATH**: The path to the ABI file of the deployed contract. This is usually `../blockchain/artifacts/contracts/BallotBox.sol/BallotBox.json`.
- **CONTRACT_OWNER_PK**: The private key of the first account (Account #0) from the output of `npx hardhat node`.


**5. Prepare the database:**

```bash
python manage.py makemigrations
python manage.py migrate
```

### Frontend Setup

**1. Navigate to the frontend directory:**

```bash
cd ../frontend
```

**2. Install Frontend JS dependencies:**

```bash
npm install
```

**3. create `.env` file:**


```bash
cp frontend/.env.example frontend/.env
```

Then, modify `frontend/.env` with the correct API URL:

```plaintext
VITE_BACKEND_API_URL="http://127.0.0.1:8000/"  # URL from running the backend server with 'python manage.py runserver'
```

### Blockchain Setup

**1. Navigate to the blockchain directory:**

```bash
cd ../blockchain
```

**2. Install Smart Contract JS dependencies:**

```bash
npm install
```

## Usage

### Setup local Blockchain node and deploy Contract

Navigate to the *blockchain* directory and run the following commands to start the local ethereum network:

```bash
npx hardhat compile
npx hardhat node
```

In a new window deploy the Smart Contract with:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Starting the Backend Server and initialize the Database

Navigate to the backend directory and run the following command to start the backend server:

```bash
python manage.py runserver
```

In a new window initialize the Database with:

```bash
python manage.py initialize_db
```

This command will populate the database with:

- Blockchain information (ABI, contract address)
- Eligible voters
- Candidates
- Election times

#### Optional: Manage Data via Admin Interface

To manage the data via the Django admin interface, you can create a superuser. This is optional and not required for testing basic functionality.

1.  **Create a Superuser**: Run the following command and follow the prompts to create an admin account: 
```bash
python manage.py createsuperuser
```
    
3.  **Access the Admin Interface**: Once the superuser account is created, you can access the admin interface at: http://127.0.0.1:8000/admin/
    
    In the admin interface, you can view and manage the blockchain information, eligible voters, candidates, and election times. This provides an easy way to verify and modify the initial setup data if needed.

### Starting the React Web Application

In a new terminal, navigate to the frontend directory and run:

```bash
npm run dev 
```

Now everything is set up, and you can access the voting web application at http://localhost:5173.

### Creating a User Account

To test the system using a predefined eligible voter, follow these steps:

1. **Navigate to the registration page** in the web application.
2. **Use the details** of one of the predefined eligible voters that you loaded into the database. Here's an example of how you might use this data:
   - **Username**: Choose a unique username.
   - **Password**: Choose a strong password.
   - **First Name**: Use the first name from the dummy data.
   - **Last Name**: Use the last name from the dummy data.
   - **ID Number**: Enter the ID number from the dummy data.
   
3. **Submit the form** to create a new user account. If successful, you can then log in using these credentials.

### Setup MetaMask

When you attempt to vote, you will be prompted by the application to **install MetaMask** if it is not already installed.
Since this application runs on a local blockchain network instead of the actual Ethereum mainnet, you need to configure MetaMask to connect to the local network. Follow these steps to set up MetaMask.

 **Configure MetaMask for the Local Network**:
   - Click on the network selection button at the top left of the MetaMask interface.
   - Select "Add Network" and enter the following details to configure the local network:

- **Network Name**: *`Hardhat`*
- **New RPC URL**: *`http://127.0.0.1:8545/`* (as shown in the output of "npx hardhat node")
- **Chain ID**: *`31337`* (specified in the Hardhat config file)
- **Currency Symbol**: *`ETH`*
- **Block Explorer URL**: (Optional) leave this field empty

Ensure the details are correct. After entering the network details, click "Save" to add the network. Your MetaMask should now be connected to the local Hardhat network.

**Add an Account to MetaMask**:
   - Click on the account selector at the top middle of the MetaMask interface.
   - Select "Add account or hardware wallet" and then click on "Import account".
   - Enter the private key of one of the predefined accounts from the Hardhat node output. Do not use Account #0 as it is the owner of the contract.

By following these steps, you will be able to fully test the voting system using the local blockchain network configured with Hardhat and MetaMask.

## License

This project is licensed under the [MIT License](./LICENSE).
