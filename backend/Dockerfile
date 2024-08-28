FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ARG ETH_NODE_URL
ARG SMART_CONTRACT_ADDRESS
ARG SMART_CONTRACT_ABI_PATH
ARG CONTRACT_OWNER_PK

ENV ETH_NODE_URL=${ETH_NODE_URL}
ENV SMART_CONTRACT_ADDRESS=${SMART_CONTRACT_ADDRESS}
ENV SMART_CONTRACT_ABI_PATH=${SMART_CONTRACT_ABI_PATH}
ENV CONTRACT_OWNER_PK=${CONTRACT_OWNER_PK}

RUN python manage.py makemigrations && python manage.py migrate

EXPOSE 8000

CMD ["sh", "-c", "python manage.py initialize_db && python manage.py runserver 0.0.0.0:8000"]