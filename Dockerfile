FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    unzip \
    jq \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf /var/lib/apt/lists/* awscliv2.zip aws/

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create directory for static files
RUN mkdir -p staticfiles

# Set environment variables for build time
ARG DJANGO_SETTINGS_MODULE=chat_project.settings
ARG STATIC_ROOT=/app/staticfiles
ENV DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE}
ENV STATIC_ROOT=${STATIC_ROOT}

# Collect static files during build
RUN python manage.py collectstatic --noinput

# Set runtime environment variables
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Entry point script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]