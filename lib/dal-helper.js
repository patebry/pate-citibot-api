require('dotenv').config()
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const HTTPError = require('node-http-error')
const db = new PouchDB(process.env.COUCHDB_URL)
const { head, split, last } = require('ramda')

function create(doc, callback) {
	console.log('doc', doc)
	if (doc._id !== '' && doc.name !== '') {
		db.post(doc, function(err, doc) {
			if (err) callback(err)
			callback(null, doc)
		})
	}
}

function read(id, callback) {
	db.get(id, function(err, doc) {
		if (err) callback(err)
		callback(null, doc)
	})
}

function update(doc, callback) {
	console.log(doc)
	db.put(doc, function(err, doc) {
		if (err) callback(err)
		callback(null, doc)
	})
}

function deleteDoc(id, callback) {
	db
		.get(id)
		.then(function(doc) {
			return db.remove(doc)
		})
		.then(function(result) {
			callback(null, result)
		})
		.catch(function(err) {
			callback(err)
		})
}

const findDocs = (query, callback) =>
	query
		? db
				.find(query)
				.then(res => callback(null, res.docs))
				.catch(err => callback(err))
		: callback(null, [])

const list = (lastItem, filter, limit, callback) => {
	var query = {}

	if (filter) {
		const arrFilter = split(':', filter)
		const filterField = head(arrFilter)
		const filterValue = last(arrFilter)
		const selectorValue = {}
		selectorValue[filterField] = Number(filterValue)
			? Number(filterValue)
			: filterValue

		query = {
			selector: selectorValue,
			limit
		}
	} else if (lastItem) {
		// They are asking to paginate.  Give them the next page of results
		query = {
			selector: {
				_id: {
					$gt: lastItem
				}
			},
			limit
		}
	} else {
		// Give the first page of results.
		query = {
			selector: {
				_id: {
					$gt: null
				}
			},
			limit
		}
	}

	findDocs(query, callback)
}

const dalHelper = {
	create,
	read,
	update,
	deleteDoc,
	findDocs,
	list
}

module.exports = dalHelper
