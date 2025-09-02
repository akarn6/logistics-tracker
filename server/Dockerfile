# Use Node LTS
FROM node:18

# Set workdir
WORKDIR /app

# Copy package.json + lock
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose port
EXPOSE 4000

# Run server
CMD ["node", "index.js"]
