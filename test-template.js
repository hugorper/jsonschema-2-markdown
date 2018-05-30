const fs = require('fs')
const test = require('tape')
const path = require('path');
const validator = require('is-my-json-valid')
const jsonSchema2Md = require('./')


var jsonObject = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "description": "An small Address",
    "type": "object",
    "properties": {
        "post-office-box": {
            "type": "string"
        },
        "street-address": {
            "type": "string"
        },
        "locality": {
            "type": "string"
        },
        "region": {
            "type": "string"
        },
        "postal-code": {
            "type": "string"
        },
        "country-name": {
            "type": "string"
        }
    },
    "required": ["locality", "region", "country-name"],
    "dependencies": {
        "post-office-box": ["street-address"],
    }
};

const content = `
title: {{title}}
type: {{type}}
description: {{description}}
{{content}}
---
`;

var template = {
	documentTemplate: content
};


var mdOutput = jsonSchema2Md(jsonObject, template);
    
console.log(mdOutput);