const generateElementTitle = function (headerTagLevel, elementName, elementType, isRequired, isEnum, example) {
	var text = [ headerTagLevel ]
	if(elementName) {
		text.push(' `' + elementName + '`')
	}
	if (elementType || isRequired) {
		text.push(' (')
		if (elementType) {
			text.push(elementType)
		}
		if (isEnum) {
			text.push(', enum')
		}
		if (isRequired) {
			text.push(', required')
		}
		text.push(')')
	}
	if (example) {
		text.push(' eg: `' + example + '`')
	}
	return text.join('')
}

const generatePropertyRestrictions = function (schema) {
	var generate = generateSinglePropertyRestriction(schema)
	return [
		generate('minimum', 'Minimum'),
		generate('maximum', 'Maximum'),
		generate('pattern', 'Regex pattern'),
		generate('minItems', 'Minimum items'),
		generate('uniqueItems', 'Unique items')
	].filter(function(text) {
		return text
	}).join('\n')
}

const generateSinglePropertyRestriction = function (schema) {
	return function(key, text) {
		if (schema[key]) {
			return '* ' + text + ': `' + schema[key] + '`'
		} else {
			return null
		}
	}
}

const generateSchemaSectionText = function (headerTagLevel, name, isRequired, schema, subSchemas) {
	var schemaType = getActualType(schema, subSchemas)

	var text = [
		generateElementTitle(headerTagLevel, name, schemaType, isRequired, schema.enum, schema.example),
		schema.description
	]

	if (schemaType === 'object') {
		if (schema.properties) {
			text.push('Properties of the `' + name + '` object:')
			generatePropertySection(headerTagLevel, schema, subSchemas).forEach(function(section) {
				text = text.concat(section)
			})
		}
	} else if (schemaType === 'array') {
		var itemsType = schema.items && schema.items.type

		if (!itemsType && schema.items['$ref']) {
			itemsType = getActualType(schema.items, subSchemas)
		}

		if (itemsType && name) {
			text.push('The object is an array with all elements of the type `' + itemsType + '`.')
		} else if (itemsType) {
			text.push('The schema defines an array with all elements of the type `' + itemsType + '`.')
		} else {
			var validationItems = []

			if (schema.items.allOf) {
				text.push('The elements of the array must match *all* of the following properties:')
				validationItems = schema.items.allOf
			} else if (schema.items.anyOf) {
				text.push('The elements of the array must match *at least one* of the following properties:')
				validationItems = schema.items.anyOf
			} else if (schema.items.oneOf) {
				text.push('The elements of the array must match *exactly one* of the following properties:')
				validationItems = schema.items.oneOf
			} else if (schema.items.not) {
				text.push('The elements of the array must *not* match the following properties:')
				validationItems = schema.items.not
			}

			if (validationItems.length > 0) {
				validationItems.forEach(function(item) {
					text = text.concat(generateSchemaSectionText(headerTagLevel, undefined, false, item, subSchemas))
				})
			}
		}

		if (itemsType === 'object') {
			text.push('The array object has the following properties:')
			generatePropertySection(headerTagLevel, schema.items, subSchemas).forEach(function(section) {
				text = text.concat(section)
			})
		}
	} else if (schema.oneOf) {
		text.push('The object must be one of the following types:')
		text.push(schema.oneOf.map(function(oneOf) {
			return '* `' + subSchemas[oneOf['$ref']] + '`'
		}).join('\n'))
	}

	if (schema.enum) {
		text.push('This element must be one of the following enum values:');
		text.push(schema.enum.map(function(enumItem) {
			return '* `' + enumItem + '`'
		}).join('\n'))
	}

	if (schema.default !== undefined) {
		if (schema.default === null || [ "boolean", "number", "string" ].indexOf(typeof schema.default) !== -1) {
			text.push('Default: `' + JSON.stringify(schema.default) + '`')
		} else {
			text.push('Default:')
			text.push('```\n' + JSON.stringify(schema.default, null, 2) + '\n```')
		}
	}

	var restrictions = generatePropertyRestrictions(schema)

	if (restrictions) {
		text.push('Additional restrictions:')
		text.push(restrictions)
	}

	return text
}

const generatePropertySection = function (headerTagLevel, schema, subSchemas) {
	if (schema.properties) {
		return Object.keys(schema.properties).map(function(propertyKey) {
			var propertyIsRequired = schema.required && schema.required.indexOf(propertyKey) >= 0
			return generateSchemaSectionText(headerTagLevel + '#', propertyKey, propertyIsRequired, schema.properties[propertyKey], subSchemas)
		})
	} else if (schema.oneOf) {
		var oneOfList = schema.oneOf.map(function(innerSchema) {

			return '* `' + getActualType(innerSchema, subSchemas) + '`'
		}).join('\n')
		return ['This property must be one of the following types:', oneOfList]
	} else {
		return []
	}
}

const getActualType = function (schema, subSchemas) {
	if (schema.type) {
		return schema.type
	} else if (schema['$ref'] && subSchemas[schema['$ref']]) {
		return subSchemas[schema['$ref']]
	} else {
		return undefined
	}
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

const defaultDocumentTemplate = '{{content}}';

var templateVariable = {
	title: "{{title}}",
	type: "{{type}}",
	description: "{{description}}",
	content: "{{content}}"
};

var templateOptions = {
	documentTemplate: defaultDocumentTemplate
};


/**
 * Convert json-schema to markdown
 * 
 * @param  {} schema 	Schema object
 * @param  {} templates Template option to format markdown output
 * 
 */
module.exports = function(schema, templates) {
	var subSchemaTypes = Object.keys(schema.definitions || {}).reduce(function(map, subSchemaTypeName) {
		map['#/definitions/' + subSchemaTypeName] = subSchemaTypeName
		return map
	}, {})
	
	var text = []

	var headerTagLevel = '';

	// if new template provided replace default
	if (templates) {
		templateOptions = templates;
	}

	if (schema.title) {
		templateOptions.documentTemplate = templateOptions.documentTemplate.replaceAll(templateVariable.title, schema.title);

		headerTagLevel += '#'
		text.push(headerTagLevel + ' ' + schema.title)
	}

	if (schema.type === 'object') {
		templateOptions.documentTemplate = templateOptions.documentTemplate.replaceAll(templateVariable.type, schema.type);
		if (schema.description) {
			templateOptions.documentTemplate = templateOptions.documentTemplate.replaceAll(templateVariable.description, schema.description);
			text.push(schema.description)
		}
		text.push('The schema defines the following properties:')
		generatePropertySection(headerTagLevel, schema, subSchemaTypes).forEach(function(section) {
			text = text.concat(section)
		})
	} else {
		text = text.concat(generateSchemaSectionText('#' + headerTagLevel, undefined, false, schema, subSchemaTypes));
	}

	if (schema.definitions) {
		text.push('---')
		text.push('# Sub Schemas')
		text.push('The schema defines the following additional types:')
		Object.keys(schema.definitions).forEach(function(subSchemaTypeName) {
			text.push('## `' + subSchemaTypeName + '` (' + schema.definitions[subSchemaTypeName].type + ')')
			text.push(schema.definitions[subSchemaTypeName].description)
			if (schema.definitions[subSchemaTypeName].type === 'object') {
				if (schema.definitions[subSchemaTypeName].properties) {
					text.push('Properties of the `' + subSchemaTypeName + '` object:')
				}
			}
			generatePropertySection('##', schema.definitions[subSchemaTypeName], subSchemaTypes).forEach(function(section) {
				text = text.concat(section)
			})
		})
	}

	var fullText = text.filter(function(line) {
		return !!line
	}).join('\n\n');

	return templateOptions.documentTemplate.replaceAll(templateVariable.content, fullText);


}
