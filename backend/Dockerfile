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

# Pre-download the embedding model at build time so it's baked into the
# Docker image.  This prevents a ~200MB download on Render's first request,
# which would exceed the free tier's cold-start timeout.
RUN python -c "\
from sentence_transformers import SentenceTransformer; \
import os; \
model_name = os.environ.get('EMBEDDING_MODEL_NAME', 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'); \
print(f'Pre-downloading embedding model: {model_name}'); \
SentenceTransformer(model_name); \
print('Model cached successfully.')"

# Expose port
EXPOSE 8000

# Run with Gunicorn and Uvicorn workers for production (Respects $PORT for cloud deployment)
# Single worker (-w 1) to fit Render free tier's 512MB RAM
CMD gunicorn app.main:app -w 1 --timeout 120 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
