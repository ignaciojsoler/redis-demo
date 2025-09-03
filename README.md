# Redis: Complete Implementation Guide with Express and Docker

## What is Redis and what is it used for?
Redis (**Remote Dictionary Server**) is an open-source, in-memory database that works as a **key-value data structure**.  
It is extremely fast because it stores data directly in **RAM**, allowing response times of **less than a millisecond**.

---

## 🔑 Main Use Cases

- ⚡ **Application Caching**: Store results of frequent queries  
- 👤 **User Sessions**: Manage session data in a distributed way  
- 📩 **Message Queues**: Implement real-time messaging systems  
- 🚦 **Rate Limiting**: Control the frequency of requests per user  
- 🏆 **Leaderboards**: Real-time rankings for games or applications  
- 📊 **Real-time Counters**: Analytics, usage metrics, etc.  

---

## 📦 Tech Stack

- [Redis](https://redis.io/) – In-memory data store  
- [Express](https://expressjs.com/) – Node.js web framework  
- [Docker](https://www.docker.com/) – Containerization platform  
- [Rick and Morty API](https://rickandmortyapi.com/api) - External API for demo data

---

# Redis: Complete Implementation Guide with Express and Docker

## What is Redis and what is it used for?

Redis (**Remote Dictionary Server**) is an open-source, in-memory database that works as a **key-value data structure**. 

It is extremely fast because it stores data directly in **RAM**, allowing response times of **less than a millisecond**.

---

## 🔑 Main Use Cases

- ⚡ **Application Caching**: Store results of frequent queries 
- 👤 **User Sessions**: Manage session data in a distributed way 
- 📩 **Message Queues**: Implement real-time messaging systems 
- 🚦 **Rate Limiting**: Control the frequency of requests per user 
- 🏆 **Leaderboards**: Real-time rankings for games or applications 
- 📊 **Real-time Counters**: Analytics, usage metrics, etc.

---

## 📦 Tech Stack

- [Redis](https://redis.io/) – In-memory data store 
- [Express](https://expressjs.com/) – Node.js web framework 
- [Docker](https://www.docker.com/) – Containerization platform
- [Rick and Morty API](https://rickandmortyapi.com/) – External API for demo data

---

## 🚀 Project Setup

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

### Step 1: Initialize the Project

```bash
# Create project directory
mkdir redis-express-demo
cd redis-express-demo

# Initialize npm project
npm init -y

# Install dependencies
npm install express axios redis

# Install development dependencies
npm install -D nodemon
```

### Step 2: Create Docker Compose Configuration

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  redis:
    image: redis
    ports:
      - "6379:6379"
```

### Step 3: Start Redis Container

```bash
# Start Redis in detached mode
docker-compose up -d

# Verify Redis is running
docker-compose ps
```

### Step 4: Create the Express Server

Create an `index.js` file with the following implementation:

```javascript
import express from 'express';
import axios from 'axios';
import redis from 'redis';

const app = express();
const PORT = 3000;
const BASE_URL = 'https://rickandmortyapi.com/api';
const REDIS_URL = 'redis://localhost:6379';

// Create a Redis client
const client = redis.createClient({
    url: REDIS_URL
})

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Get all characters with caching
app.get('/characters', async (req, res) => {
    try {
        // Check if data exists in cache
        const reply = await client.get('characters');
        if (reply) {
            console.log('Data retrieved from cache');
            return res.json(JSON.parse(reply));
        }

        // If not in cache, fetch from API
        console.log('Fetching data from API...');
        const { data: { results: characters } } = await axios.get(BASE_URL + '/character');
        
        // Store in cache for future requests
        await client.set('characters', JSON.stringify(characters));
        console.log('Data cached successfully');
        
        res.json(characters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch characters' });
    }
});

// Get specific character by ID with caching
app.get('/characters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `character:${id}`;
        
        // Check if data exists in cache
        const reply = await client.get(cacheKey);
        if (reply) {
            console.log(`Character ${id} retrieved from cache`);
            return res.json(JSON.parse(reply));
        }

        // If not in cache, fetch from API
        console.log(`Fetching character ${id} from API...`);
        const { data: character } = await axios.get(BASE_URL + `/character/${id}`);
        
        // Store in cache for future requests
        await client.set(cacheKey, JSON.stringify(character));
        console.log(`Character ${id} cached successfully`);
        
        res.json(character);
    } catch (error) {
        if (error.response?.status === 404) {
            res.status(404).json({ error: 'Character not found' });
        } else {
            res.status(500).json({ error: 'Failed to fetch character' });
        }
    }
});

const main = async () => {
    try {
        // Connect to Redis
        await client.connect();
        console.log('Connected to Redis successfully');
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        process.exit(1);
    }
};

main();
```

### Step 5: Update package.json

Add the following scripts to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### Step 6: Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

---

## 🧪 Testing the Implementation

### Test the endpoints:

1. **Home endpoint**:
   ```bash
   curl http://localhost:3000/
   ```

2. **Get all characters** (first call fetches from API, second from cache):
   ```bash
   curl http://localhost:3000/characters
   ```

3. **Get specific character** (first call fetches from API, second from cache):
   ```bash
   curl http://localhost:3000/characters/1
   ```

### Performance Comparison

- **First request**: ~200-500ms (API call)
- **Cached request**: ~1-5ms (Redis cache)
- **Performance improvement**: ~100x faster!

---

## 📊 How Caching Works in This Project

1. **Cache Miss**: When data is not in Redis
   - Fetch data from Rick and Morty API
   - Store the result in Redis
   - Return data to client

2. **Cache Hit**: When data exists in Redis
   - Retrieve data directly from Redis
   - Return cached data to client (much faster!)

### Cache Keys Used:
- `characters`: Stores the list of all characters
- `character:{id}`: Stores individual character data by ID