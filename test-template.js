const fs = require('fs')
const test = require('tape')
const path = require('path');
const validator = require('is-my-json-valid')
const jsonSchema2Md = require('./')


var jsonObject = {
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "Hotel Schema",
    "type": "object",
    "properties": {
      "@context": {
        "type": "string"
      },
      "@type": {
        "type": "string"
      },
      "image": {
        "type": "string"
      },
      "starRating": {
        "type": "object",
        "properties": {
          "@type": {
            "type": "string"
          },
          "ratingValue": {
            "type": "string"
          }
        },
        "required": [
          "@type",
          "ratingValue"
        ]
      },
      "priceRange": {
        "type": "string"
      },
      "address": {
        "type": "object",
        "properties": {
          "@type": {
            "type": "string"
          },
          "streetAddress": {
            "type": "string"
          },
          "addressLocality": {
            "type": "string"
          },
          "addressRegion": {
            "type": "string"
          },
          "postalCode": {
            "type": "string"
          },
          "addressCountry": {
            "type": "string"
          }
        },
        "required": [
          "@type",
          "streetAddress",
          "addressLocality",
          "addressRegion",
          "postalCode",
          "addressCountry"
        ]
      },
      "description": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "alternateName": {
        "type": "string"
      },
      "logo": {
        "type": "string"
      },
      "telephone": {
        "type": "string"
      },
      "email": {
        "type": "string"
      },
      "url": {
        "type": "string"
      },
      "sameAs": {
        "type": "array",
        "items": [
          {
            "type": "string"
          },
          {
            "type": "string"
          }
        ]
      }
    },
    "required": [
      "@context",
      "@type",
      "image",
      "starRating",
      "priceRange",
      "address",
      "description",
      "name",
      "alternateName",
      "logo",
      "telephone",
      "email",
      "url",
      "sameAs"
    ]
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