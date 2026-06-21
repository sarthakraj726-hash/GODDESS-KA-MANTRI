FROM node:20-slim

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# This will now download a precompiled binary instantly, completely bypassing g++
RUN npm install

# Copy over the rest of your bot's code
COPY . .

# Run the startup script
CMD ["npm", "start"]