FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install packages (will download the matching precompiled binary instantly)
RUN npm install

# Copy the rest of your bot's files
COPY . .

# Fire up the bot
CMD ["npm", "start"]