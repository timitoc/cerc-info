define({ "api": [
  {
    "type": "post",
    "url": "/groups",
    "title": "Add a new group",
    "name": "AddGroup",
    "group": "Groups",
    "parameter": {
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n  \"name\": \"Numele grupului\",\n  \"description\": \"Descrierea grupului\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n   groupId: 3,\n   name: \"Grupul nou creat\",\n   description: \"Descrierea grupului nou creat\" \n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Groups"
  },
  {
    "type": "delete",
    "url": "/groups/:groupId",
    "title": "Delete a group",
    "name": "DeleteGroup",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "groupId",
            "description": "<p>The group id</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n  success: true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/groups/:groupId",
    "title": "Get group by id",
    "name": "GetGroupById",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>The group id</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n{\n   groupId: 3,\n   name: \"Un group\",\n   description: \"Descrierea grupului\" \n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/groups",
    "title": "Get all groups",
    "name": "GetGroups",
    "group": "Groups",
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n  [\n    {\n       groupId: 3,\n       name: \"Clasa a X-a\",\n       description: \"Grup de pregătire pentru olimpiada de informatică\" \n    }, {\n       groupId: 4,\n       name: \"Clasa a XII-a\",\n       description: \"Grup de pregătire pentru olimpiada de informatică\" \n    }\n  ]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Groups"
  },
  {
    "type": "put",
    "url": "/groups/:groupId",
    "title": "Modify a group",
    "name": "ModifyGroup",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "groupId",
            "description": "<p>The group id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request example (only use the fields that you want to update):",
          "content": "{\n  \"name\": \"Noul nume al grupului\",\n  \"description\": \"Noua descriere a grupului\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n   groupId: 3,\n   name: \"Noul nume\",\n   description: \"Noua descriere\" \n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Groups"
  }
] });
