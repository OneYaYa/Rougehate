FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ROUGEHATE_HOST=0.0.0.0 \
    ROUGEHATE_PORT=8787

RUN useradd --system --uid 10001 --create-home --home-dir /app rougehate
WORKDIR /app

COPY --chown=rougehate:rougehate \
    server.py index.html styles.css game.js vfx-library.js \
    trailer.css trailer-boot.js trailer.js ./
COPY --chown=rougehate:rougehate assets ./assets

USER rougehate
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8787/api/health', timeout=3).read()"]

CMD ["python", "-u", "server.py"]
