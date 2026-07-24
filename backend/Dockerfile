FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run with Gunicorn and Uvicorn workers for production (Respects $PORT for cloud deployment)
# Run with Gunicorn and Uvicorn workers for production (Respects $PORT for cloud deployment)
CMD gunicorn app.main:app -w 1 --timeout 120 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
