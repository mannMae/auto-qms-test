FROM mcr.microsoft.com/playwright:v1.59.1-noble

# Set working directory for the tool logic
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the logic (scripts, templates, assets)
COPY scripts/ ./scripts/
COPY templates/ ./templates/
COPY assets/ ./assets/

# Entrypoint will run our CI script
# We will pass the arguments from action.yml to the script
ENTRYPOINT ["node", "/app/scripts/ci-selective-update.js"]
