export DJANGO_SETTINGS_MODULE=chat_project.settings
daphne -b 0.0.0.0 -p 8000 chat_project.asgi:application