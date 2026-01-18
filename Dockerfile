FROM python:3.10-slim

WORKDIR /app

# Copy backend files
COPY backend/ /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 5000

# Run Flask app
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
