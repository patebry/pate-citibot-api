require('dotenv').config()
const express = require('express')
const app = express()
const dal = require('./dal')
const port = process.env.PORT || 4000
const HTTPError = require('node-http-error')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pathOr, keys, pick, head, assoc } = require('ramda')
const checkRequiredFields = require('./lib/check-required-fields')

app.use(bodyParser.json())
app.use(cors({ credentials: true }))

const { pluck, map, replace, compose } = require('ramda')
const twilio = require('twilio')(
	process.env.TWILIO_SID,
	process.env.TWILIO_TOKEN
)
const setupTrello = require('./setup-trello')(
	process.env.TRELLO_KEY,
	process.env.TRELLO_TOKEN
)

//Required Field checks
const cityReqFieldCheck = checkRequiredFields([
	'name',
	'sites',
	'content',
	'_id'
])

//Post City
app.post('/cities', function(req, res, next) {
	var body = pathOr(null, ['body'], req)
	const reqFieldsCheckResults = cityReqFieldCheck(body)
	console.log('body.name', body.name)
	twilio.incomingPhoneNumbers.create({
		phoneNumber: body._id
	})
	/*
	,
	function(err, purchasedNumber) {
		console.log('purchasedNumber', purchasedNumber)
	}
	*/
	// call trello to create a new board of city name
	// also create a inbound/complete list on trello
	setupTrello(body.name, ['inbound', 'complete']).then(res => {
		console.log('res', res)
		;(body.trello = {
			app: process.env.TRELLO_KEY,
			token: process.env.TRELLO_TOKEN,
			list: res.id
		}), pathOr(0, ['length'], reqFieldsCheckResults) > 0
			? next(
					new HTTPError(400, 'Bad request.  Missing required field', {
						missingFields: reqFieldsCheckResults
					})
				)
			: dal.createCity(
					pick(
						['name', 'description', 'sites', 'content', '_id', 'trello'],
						body
					),
					(err, result) => {
						if (err) next(new HTTPError(err.status, err.message, err))
						res.status(201).send(result)
					}
				)
	})
})

//Show a city
app.get('/cities/:id', function(req, res, next) {
	const id = pathOr(null, ['params', 'id'], req)
	dal.showCity(id, function(err, result) {
		if (err) next(new HTTPError(err.status, err.message, err))
		res.status(200).send(result)
	})
})

//Update a city
app.put('/cities/:id', (req, res, next) => {
	const body = pathOr({}, ['body'], req)

	const checkUpdateFields = checkRequiredFields([
		'_id',
		'_rev',
		'name',
		'sites',
		'content'
	])

	const checkResults = checkUpdateFields(body)

	console.log('checkResults', checkResults)

	if (pathOr(0, ['length'], checkResults) > 0) {
		return next(
			new HTTPError(400, 'Bad request.  Missing required fields', {
				missingFields: checkResults
			})
		)
	}

	// check the id in the path against the id in the body
	if (body['_id'] != req.params.id) {
		return next(
			new HTTPError(
				400,
				'Bad request. Profile id in path must match the profile id in the request body.'
			)
		)
	}

	dal.updateCity(
		pick(['_id', '_rev', 'name', 'sites', 'content', 'description'], body),
		(err, result) => {
			if (err) next(new HTTPError(err.status, err.message, err))
			console.log('PUT /profiles/:id result', result)
			res.status(200).send(result)
		}
	)
})

//Delete City
app.delete('/cities/:id', function(req, res, next) {
	const id = pathOr(null, ['params', 'id'], req)
	dal.deleteCity(id, function(err, result) {
		if (err) return next(new HTTPError(err.status, err.message, err))
		res.status(200).send(result)
	})
})

//List Cities
app.get('/cities', (req, res, next) => {
	const limit = Number(pathOr(10, ['query', 'limit'], req))
	const filter = pathOr(null, ['query', 'filter'], req)
	const lastItem = pathOr(null, ['query', 'lastItem'], req)

	dal.listCities(lastItem, filter, limit, function(err, result) {
		if (err) return next(new HTTPError(err.status, err.message, err))
		res.status(200).send(result)
	})
})

// Get numbers
app.get('/numbers/:areaCode', (req, res) => {
	var areaCode = req.params.areaCode
	console.log('areaCode', areaCode)

	twilio.availablePhoneNumbers('US').local.list({
		areaCode: areaCode
	}, function(err, data) {
		if (err) {
			return res.send(err)
		}
		// map(prop('phone'), data) === pluck('prop', data)
		res.send(compose(map(replace('+', '')), pluck('phoneNumber'))(data))
	})
})

app.use((err, req, res, next) => {
	console.log(req.method, ' ', req.path, ' ', 'error: ', err)
	res.status(err.status || 500)
	res.send(err)
})

app.listen(port, () => console.log('API is up on', port))
