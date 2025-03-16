# EZ AI Agent - Backend Server

This is the backend server for the EZ AI Agent application. It provides RESTful APIs for managing AI agents and executing prompts.

## Architecture

The server is built using a clean architecture approach with the following layers:

- **Domain Layer**: Contains the core business logic, entities, and interfaces.
- **Application Layer**: Contains the application services that orchestrate the use cases.
- **Infrastructure Layer**: Contains the implementation details like database access, external services, etc.
- **Interface Layer**: Contains the controllers, routes, and validators that handle HTTP requests.

## Technologies

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Knex.js (SQL query builder)
- Docker

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for containerized development)
- PostgreSQL (if running locally)
- API keys for LLM services (Gemini, OpenAI, Deepseek)

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the environment variables in the `.env` file, including your LLM API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

### Obtaining API Keys

#### Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Navigate to "API Keys" in the left sidebar
4. Create a new API key
5. Copy the API key and add it to your `.env` file

#### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to "API Keys" in your account settings
4. Create a new API key
5. Copy the API key and add it to your `.env` file

#### Deepseek API Key

1. Go to [Deepseek Platform](https://platform.deepseek.com/)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the API key and add it to your `.env` file

### Development

To start the development server:

```
npm run dev
```

This will start the server with nodemon, which will automatically restart when changes are detected.

### Using Docker

To start the server and PostgreSQL using Docker Compose:

```
docker-compose -f ../docker-compose.dev.yml up
```

This will start the server and PostgreSQL in development mode.

### Database Migrations

To run database migrations:

```
npm run migrate
```

To seed the database with initial data:

```
npm run seed
```

## API Endpoints

### Agents

- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create a new agent
- `PUT /api/agents/:id` - Update an agent
- `DELETE /api/agents/:id` - Delete an agent
- `POST /api/agents/:id/execute` - Execute an agent with a prompt

## Supported LLM Models

The server supports the following LLM models:

- **Gemini**: Google's Gemini models (default: gemini-2.0-flash)
- **ChatGPT**: OpenAI's GPT models (default: gpt-4o)
- **Deepseek**: Deepseek's models (default: deepseek-reasoner)

You can configure the default models in the `.env` file:

```
DEFAULT_GEMINI_MODEL=gemini-2.0-flash
DEFAULT_OPENAI_MODEL=gpt-4o
DEFAULT_DEEPSEEK_MODEL=deepseek-reasoner
```

## License

This project is licensed under the MIT License.

## Database Connection

The server implements robust database connection handling with the following features:

- Connection check before server startup
- Configurable retry mechanism
- Health check endpoints
- Graceful shutdown

### Configuration

Database connection can be configured using the following environment variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ez_ai_agent
DB_SSL=false
DB_MAX_RETRIES=5
DB_RETRY_INTERVAL=2000
```

- `DB_MAX_RETRIES`: Maximum number of connection retry attempts (default: 5)
- `DB_RETRY_INTERVAL`: Interval between retries in milliseconds (default: 2000)

### Health Check Endpoints

The server provides the following health check endpoints:

- `GET /health`: General server health check
- `GET /health/db`: Database connection health check

Example response from `/health/db`:

```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "timestamp": "2023-06-01T12:34:56.789Z",
    "databaseName": "ez_ai_agent",
    "host": "127.0.0.1"
  }
}
```

## Starting the Server

The server will attempt to connect to the database before starting. If the database connection fails after the configured number of retries, the server will exit with an error.

```bash
npm run start
```

## Graceful Shutdown

The server implements graceful shutdown to ensure that all database connections are properly closed when the server is shut down. This is triggered by SIGTERM or SIGINT signals (e.g., when pressing Ctrl+C).
