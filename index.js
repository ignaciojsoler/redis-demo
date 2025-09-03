import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;
const BASE_URL = 'https://rickandmortyapi.com/api';

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/characters', async (req, res) => {
    const { data: { results: characters } } = await axios.get(BASE_URL + '/character')
    res.json(characters)
});

app.get('/characters/:id', async (req, res) => {
    const { id } = req.params;
    const { data: character } = await axios.get(BASE_URL + `/character/${id}`)
    res.json(character)
});

const main = () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

main();