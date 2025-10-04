# web-deployment

## db-postgres-v2

### taking a postgresql db dump
<PATH_TO_POSTGRESQL_BIN_FOLDER>/pg_dump -h <POSTGRES_HOST> -p <POSTGRES_PORT> -U <POSTGRES_USER> -d <POSTGRES_DB> -inserts -f mediamine-db.sql

### restoring the above dump
<PATH_TO_POSTGRESQL_BIN_FOLDER>/psql -U <POSTGRES_USER> -d <POSTGRES_DB> -p 5435 -W
Password: <POSTGRES_PASSWORD>

<POSTGRES_DB>=# \i <PATH_TO_POSTGRESQL_DUMP_FOLDER>\mediamine-db-0.sql
OR
use the execute script action from DBeaver

## nginx

```
docker build -t mediamine/nginx .
```


## Running the production stack

```
docker compose up -d
```