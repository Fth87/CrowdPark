# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the SvelteKit app using adapter-node
RUN npm run build

# Prune devDependencies to keep the production image small
RUN npm ci --omit=dev

# 2. Production stage
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Expose the port (CapRover handles mapping)
EXPOSE 3000

# Start the server
CMD ["node", "build"]
