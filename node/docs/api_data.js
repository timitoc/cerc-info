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
  },
  {
    "type": "post",
    "url": "/users",
    "title": "Add a new user",
    "name": "AddUser",
    "group": "Users",
    "parameter": {
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n  \"email\": \"john_smith@gmail.com\",\n  \"password\": \"supersecurepassword\"\n  \"privilege\": 1\n  \"name\": \"John Smith\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n   userId: 3,\n   name: \"John Smith\",\n   email: \"john_smith@gmail.com\",\n   privilege: 1\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "get",
    "url": "/users",
    "title": "Get all users",
    "name": "GetUsers",
    "group": "Users",
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n  [\n    {\n       userId: 1,\n       name: \"Johnny Smith\",\n       email: \"johnny_smith@gmail.com\",\n       privilege: 0\n    },\n    {\n       userId: 2,\n       name: \"John Smith\",\n       email: \"john_smith@gmail.com\",\n       privilege: 1\n    }\n  ]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "get",
    "url": "/users/:userId",
    "title": "Get user by id",
    "name": "GetUsersById",
    "group": "Users",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>The user id</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n{\n   userId: 2,\n   name: \"John Smith\",\n   email: \"john_smith@gmail.com\",\n   privilege: 1\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "put",
    "url": "/users/:userId",
    "title": "Modify a user",
    "name": "ModifyUser",
    "group": "Users",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The user id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request example (only use the fields that you want to update):",
          "content": "{\n  \"name\": \"New Name\",\n  \"email\": \"new_email@gmail.com\",\n  \"password\": \"newsecurepassword\",\n  \"privilege\": 1\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n   userId: 3,\n   name: \"John Smith\",\n   email: \"john_smith@gmail.com\",\n   privilege: 1\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "delete",
    "url": "/users/:userId",
    "title": "Delete a user",
    "name": "UserGroup",
    "group": "Users",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The user id</p>"
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
    "filename": "api/routes/users.js",
    "groupTitle": "Users"
  }
] });
