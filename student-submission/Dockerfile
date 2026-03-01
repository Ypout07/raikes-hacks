# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app/sd_tester

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy sd_tester source code
COPY . .

# Environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Optional port
EXPOSE 8000

# Run the agent by default
CMD ["python", "agent.py"]
