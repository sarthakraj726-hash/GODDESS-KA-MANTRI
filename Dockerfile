FROM node:20-alpine

# Install essential build tools required to compile native packages like better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Force a clean compile directly inside the container environment
RUN npm install

# Copy over the rest of your bot's code
COPY . .

# Run the startup script from your package.json
CMD ["npm", "start"]