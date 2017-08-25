import test from 'ava';
import { executeCommand, sortByKey, sortByProperty, sortVersions } from '../src/utils'

test('sortVersions should returns versions sorted', t => {
	let unsorted = [
		'10.0.1',
		'2.2.1',
		'2.1.10',
		'2.10.1',
		'2.1.2',
	]

	let sorted = [
		'2.1.2',
		'2.1.10',
		'2.2.1',
		'2.10.1',
		'10.0.1',
	]

	t.deepEqual(unsorted.sort(sortVersions), sorted)
})

test('sortByKey should returns versions sorted', t => {
	let unsorted = {
		'10.0.1': 'foo', 
		'2.2.1': 'foo',
		'2.1.10': 'foo',
		'2.10.1': 'foo',
		'2.1.2': 'foo'
	}

	let sorted = {
		'2.1.2': 'foo',
		'2.1.10': 'foo',
		'2.2.1': 'foo',
		'2.10.1': 'foo',
		'10.0.1': 'foo'
	}

	t.deepEqual(sortByKey(unsorted), sorted)
})

test('sortByProperty should returns versions sorted', t => {
	let unsorted = [
		{ key: '10.0.1', other: 'foo' },
		{ key: '2.2.1', other: 'foo' },
		{ key: '2.1.10', other: 'foo' },
		{ key: '2.10.1', other: 'foo' },
		{ key: '2.1.2', other: 'foo' }
	]

	let sorted = [
		{ key: '2.1.2', other: 'foo' },
		{ key: '2.1.10', other: 'foo' },
		{ key: '2.2.1', other: 'foo' },
		{ key: '2.10.1', other: 'foo' },
		{ key: '10.0.1', other: 'foo' }
	]

	t.deepEqual(sortByProperty(unsorted, 'key'), sorted)
})

test('executeCommand "ls" should returns the project directory', async t => {
	let commandResult = await executeCommand('ls')
	commandResult = commandResult.split('\n')

	t.true(commandResult.indexOf('index.js') !== -1)
	t.true(commandResult.indexOf('package.json') !== -1)
	t.true(commandResult.indexOf('README.md') !== -1)
	t.true(commandResult.indexOf('src') !== -1)
	t.true(commandResult.indexOf('test') !== -1)
	t.true(commandResult.indexOf('node_modules') !== -1)
	t.true(commandResult.indexOf('output') !== -1)	
})
