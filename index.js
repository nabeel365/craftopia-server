const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Craftopia is Drawing');
});



app.listen(port, () => {
    console.log(`Craftopia Art School is running on port ${port}`);
});
