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

app.get('/characters', async (req, res) => {
    const reply = await client.get('characters');
    if (reply) return res.json(JSON.parse(reply));
    const { data: { results: characters } } = await axios.get(BASE_URL + '/character')
    await client.set('characters', JSON.stringify(characters));
    res.json(characters)
});

app.get('/characters/:id', async (req, res) => {
    const { id } = req.params;
    const reply = await client.get(`character:${id}`);
    if (reply) return res.json(JSON.parse(reply));
    const { data: character } = await axios.get(BASE_URL + `/character/${id}`)
    await client.set(`character:${id}`, JSON.stringify(character));
    res.json(character)
});

const main = async () => {
    await client.connect();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

main();