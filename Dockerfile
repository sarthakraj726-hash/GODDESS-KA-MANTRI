FROM ubuntu:24.04

# Install curl and configure the official Node.js 20 repository
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package configurations and install dependencies safely
COPY package*.json ./
RUN npm install

# Copy the rest of your bot's code
COPY . .

# Start the bot
CMD ["npm", "start"]