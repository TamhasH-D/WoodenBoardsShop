```bash
cp .env.sample .env
docker compose --env-file .env up -d --build && docker compose logs -f
```
