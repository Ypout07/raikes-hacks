# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app/sd_tester

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy sd_tester source code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose any necessary ports (optional, for future extensions)
EXPOSE 8000

# Default command
CMD ["python", "agent.py"]