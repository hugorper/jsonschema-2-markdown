const fs = require('fs')
const test = require('tape')
const path = require('path');
const validator = require('is-my-json-valid')
const jsonSchema2Md = require('../')

test('Internal test that invalid JSON schemas are an error', function(t) {
	var testPassed = false
	try {
		validator({
			$schema: 'http://json-schema.org/draft-07/schema#',
			title: 'Invalid Schema',
			type: 'NO PROPERTY EXIST'
		})
	} catch (e) {
		testPassed = true
	}
	t.ok(testPassed, 'exception thrown when invalid JSON schema found')
	t.end()
})

test('All the files.', function(t) {
	const jsonSchemaFolder = './test/json-schema/';

	var jsonFiles = fs.readdirSync(jsonSchemaFolder);	

	jsonFiles.forEach(function(file) {
		var jsonObject = require('./json-schema/' + file);
		var markdownBaseName = path.basename(file, '.json');
		
		var markdown = fs.readFileSync('./test/markdown/' + markdownBaseName + '.md', 'utf8')
		var mdOutput = jsonSchema2Md(jsonObject);
		
		// uncomment to generate markdown files
		/* 		
		fs.appendFile('./test/markdown/' + markdownBaseName + '.md', mdOutput, 'utf8', function (err) {
			if (err) throw err;
			console.log('Saved!');
		}); 
 		*/

		validator(jsonObject) // assert that JSON schema files are valid
		// comment to generate markdown files 
		t.equal(mdOutput, markdown, 'markdown file "' + markdownBaseName + '" should match parser output')
		// uncomment to generate markdown files 
		//t.equal("1", "1", "ok");
	})
	t.end()
})
