define({ "api": [
  {
    "type": "get",
    "url": "/groups",
    "title": "Get all groups",
    "name": "GetUser",
    "group": "Groups",
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTPS 201 OK\n[{\n   groupId: 3,\n   groupName: \"Clasa a X-a\",\n   groupDescription: \"Grup de pregătire pentru olimpiada de informatică\" \n}, {\n   groupId: 4,\n   groupName: \"Clasa a XII-a\",\n   groupDescription: \"Grup de pregătire pentru olimpiada de informatică\" \n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/groups.js",
    "groupTitle": "Groups"
  }
] });
