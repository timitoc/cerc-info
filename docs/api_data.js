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
    "url": "/invite/student",
    "title": "Generate invitation for a student",
    "name": "InviteStudent",
    "group": "Invitations",
    "parameter": {
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n  \"email\": \"john_smith@gmail.com\",\n  \"groupId\": 2\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n     \"succes\": true,\n     \"previewUrl\": \"https://ethereal.email/message/W2FI7F.N1gyNXi9eW2FI7g9ALQzbRAJiAAAAAb76SgwS8fklYkNkjbQEUPc\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/invite.js",
    "groupTitle": "Invitations"
  },
  {
    "type": "post",
    "url": "/invite/teacher",
    "title": "Generate invitation for a teacher",
    "name": "InviteTeacher",
    "group": "Invitations",
    "parameter": {
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n  \"email\": \"john_smith@gmail.com\",\n  \"groupId\": 2\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n     \"succes\": true,\n     \"previewUrl\": \"https://ethereal.email/message/W2FI7F.N1gyNXi9eW2FI7g9ALQzbRAJiAAAAAb76SgwS8fklYkNkjbQEUPc\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/invite.js",
    "groupTitle": "Invitations"
  },
  {
    "type": "get",
    "url": "/invite/validate/:inviteCode",
    "title": "Validate invite code",
    "name": "ValidateInviteCode",
    "group": "Invitations",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "inviteCode",
            "description": "<p>The invitation code</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n{\n   valid: true,\n   email: \"john_smith@gmail.com\",\n   privilege: 0,\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error: Code not found",
          "content": "HTTP 200\n{\n   error: \"Code not found!\"\n}",
          "type": "json"
        },
        {
          "title": "Error: Code already used",
          "content": "HTTP 200\n{\n   error: \"Code already used!\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/invite.js",
    "groupTitle": "Invitations"
  },
  {
    "type": "post",
    "url": "/groups/:groupId/lessons",
    "title": "Add a new lesson",
    "name": "AddLesson",
    "group": "Lessons",
    "parameter": {
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n \t\"name\": \"Ciclu hamiltonian de cost minim\",\n \t\"content\": \"Continutul lectiei\",\n \t\"authorId\": 2,\n \t\"tags\": \"dynammic programming,graph theory\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n   \"lessonId\": 3,\n   \"groupId\": 2,\n   \"name\": \"Ciclu hamiltonian de cost minim\"\",\n   \"content\": \"Continutul lectiei\",\n   \"authorId\": 2,\n   \"tags\": \"dynammic programming,graph theory\",\n   \"dateAdded\": \"2018-07-31T21:00:00.000Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Lessons"
  },
  {
    "type": "delete",
    "url": "/groups/:groupId/lessons/:lessonId",
    "title": "Delete a lesson",
    "name": "DeleteLesson",
    "group": "Lessons",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>The group id (useless, kept only for symmetrical purposes)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lessonId",
            "description": "<p>The lesson id</p>"
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
    "groupTitle": "Lessons"
  },
  {
    "type": "get",
    "url": "/groups/:groupId/lessons/:lessonId",
    "title": "Get lesson by id",
    "name": "GetLessonById",
    "group": "Lessons",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>The group id (useless, kept only for symmetrical purposes)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lessonId",
            "description": "<p>The lesson id</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n{\n  \"lessonId\": 2,\n  \"groupId\": 2,\n  \"name\": \"Lectia 1\",\n  \"content\": \"Continutul lectiei\",\n  \"authorId\": 2,\n  \"tags\": \"dynammic programming,graph theory\",\n  \"dateAdded\": \"2018-07-31T21:00:00.000Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Lessons"
  },
  {
    "type": "get",
    "url": "/groups/:groupId/lessons",
    "title": "Get all lessons from a group",
    "name": "GetLessons",
    "group": "Lessons",
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n[\n   {\n       \"lessonId\": 2,\n       \"groupId\": 2,\n       \"name\": \"Lectia 1\",\n       \"content\": \"Continutul lectiei\",\n       \"authorId\": 2,\n       \"tags\": \"dynammic programming\",\n       \"dateAdded\": \"2018-07-31T21:00:00.000Z\"\n   },\n   {\n       \"lessonId\": 3,\n       \"groupId\": 2,\n       \"name\": \"Lectia 2\",\n       \"content\": \"Continutul lectiei\",\n       \"authorId\": 2,\n       \"tags\": \"math,modular arithmetic\",\n       \"dateAdded\": \"2018-07-31T21:00:00.000Z\"\n   }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Lessons"
  },
  {
    "type": "put",
    "url": "/groups/:groupId/lessons/:lessonId",
    "title": "Modify a lesson",
    "name": "ModifyLesson",
    "group": "Lessons",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>The group id (useless, kept only for symmetrical purposes)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lessonId",
            "description": "<p>The lesson id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request example (only use the fields that you want to update):",
          "content": "{\n  \"name\": \"Noul nume al lecţiei\",\n  \"content\": \"Noul conţinut\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 201 OK\n{\n   \"lessonId\": 3,\n   \"groupId\": 2,\n   \"name\": \"Noul nume\"\",\n   \"content\": \"Noul conţinut\",\n   \"authorId\": 2,\n   \"tags\": \"dynammic programming,graph theory\",\n   \"dateAdded\": \"2018-07-31T21:00:00.000Z\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Lessons"
  },
  {
    "type": "post",
    "url": "/login",
    "title": "Authenticate user",
    "name": "Login",
    "group": "Login",
    "parameter": {
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n  \"email\": \"john_smith@gmail.com\",\n  \"password\": \"supersecurepassword\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP 200 OK\n{\n     token: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5fc21pdGhAZ21haWwuY29tIiwibmFtZSI6IkpvaG4gU21pdGgiLCJwcml2aWxlZ2UiOjEsImlhdCI6MTUzMzA5NjYyNH0.9o8iQTOp1-p8s8gDV9bgY6lzg1Y2K-Zvilp_nLHN6zo\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error: User not found",
          "content": "HTTP 200\n{\n   \"error\": \"User account not found!\"\n}",
          "type": "json"
        },
        {
          "title": "Error: Incorrect credentials",
          "content": "HTTP 200\n{\n   \"error\": \"Incorrect credentials!\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/login.js",
    "groupTitle": "Login"
  },
  {
    "type": "post",
    "url": "/register",
    "title": "Register user account",
    "name": "RegisterUserAccount",
    "group": "Register",
    "parameter": {
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n  \"name\": \"John Smith\",\n  \"password\": \"supersecurepassword\",\n  \"inviteCode\": \"NYKFV\"\n}",
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
    "filename": "api/routes/register.js",
    "groupTitle": "Register"
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
