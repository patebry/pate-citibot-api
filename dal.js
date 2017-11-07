const dalHelper = require('./lib/dal-helper')
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const { prop, assoc, head, last, split, trim } = require('ramda')

const createCity = (body, callback) =>
	dalHelper.create(createFormat(body), callback)
const showCity = (id, callback) => dalHelper.read(id, callback)
const updateCity = (body, callback) => dalHelper.update(body, callback)
const deleteCity = (id, callback) => dalHelper.deleteDoc(id, callback)
const listCities = (lastItem, filter, limit, callback) => {
	dalHelper.list(lastItem, filter, limit, callback)
}

function createFormat(body) {
	body._id = trim(body._id)
	console.log(body)
	return body
}

const dal = {
	createCity,
	showCity,
	updateCity,
	deleteCity,
	listCities
}

module.exports = dal
