require('dotenv').config({ path: '/etc/sheet-meister.env' });

const axios = require('axios');
const express = require('express');

const { inspect } = require('util');

const port = process.env.PORT || 3044;

const app = express();

app.get('/health', (req, res) => {
	res.send("This is sheet-meister. We're all fine here. How are you?");
});

app.get('/sheet/:sheetId/:tab', async (req,res) => {
	const { sheetId, tab } = req.params;
	const API_KEY = process.env.API_KEY;
	if (!sheetId) return res.status(400).send('sheet id not present');
	if (!tab) return res.status(400).send('tab not present');
	if (!API_KEY) return res.status(400).send('API_KEY not present');
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tab}?alt=json&key=${API_KEY}`;

	console.log({url});
	try {
		const content = await axios.get(url);
		// console.log(inspect(content));
		const json = convertApiOutputToJson(content.data.values);
		return res.send(json);
	} catch(err) {
		console.error(err);
		return res.status(500).send(err);
	}
});





app.use((err, req, res, next) => {
  console.error('GENERAL ERROR',err);
  res.status(500).send('It is pitch black. You are likely to be eaten by a grue.');
})

app.listen(port, err => {
  console.log(`app is running on port ${port}`);
});




function convertApiOutputToJson(apiOutput) {
	const headers = apiOutput[0];
	const data = apiOutput
		.slice(1)
		.map(d => {
			let obj = {};
			headers.forEach((h,i) => obj[h] = d[i]);
			return obj;
		});
	return data;
}