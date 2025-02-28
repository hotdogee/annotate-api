# annotate-api
> Backend API for ANNotate

Check README in project annotate-ui.

# Development Setup

## Prerequisites

- `annotate-serving` is running on `http://localhost:8601/`
- MongoDB is running on `mongodb://localhost:27017/`

## Starting the Development Server

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

The API server will start running on `http://localhost:8581` by default.

## Send a pfam create request

```bash
node util/pfam-create.js
```

