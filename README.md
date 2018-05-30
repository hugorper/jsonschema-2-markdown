# jsonschema-2-markdown

This module generate markdown file from a JSON Schema with formating configuration.

[JSON Schema](http://json-schema.org/) is a vocabulary that allows you to annotate and validate JSON documents.

I do not implement the full specification, the primary goal of this module is to convert a schema to markdown format.

## Requirements

- `npm` version 5 or up
- `node` v6 or up

## Installation

```sh
$ npm install jsonschema-2-markdown
```

## Simple usage

```js
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


var json2md = require('jsonschema-2-markdown');
var markdown = json2md(jsonObject);
```

## Usage with markdown simple template

```js
  var jsonObject = ...

var json2md = require('jsonschema-2-markdown');

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


var markdown = json2md(jsonObject, template);

```

## Tests

Ensure you have all the dependencies installed via `npm install`, then run:

Test schema come from [json-schema-to-markdown/test/schemas/](https://github.com/saibotsivad/json-schema-to-markdown/tree/master/test/schemas)

```bash
npm test
```

## License/Copyright

Copyright 2018 Hugo Pereira (hugorper). All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0