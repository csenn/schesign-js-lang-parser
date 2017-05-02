# Schesign Text Based Language Parser


Note: The AST built is not reallyyy abstract. Maybe using a real grammar would be better. It, however, works as is, and is relatively simple and maintainable and the moment.

[
  {
    type: "block",
    label: {
      type: "var",
      value: "MyClass"
    },
    body: [
      {
        type: "assign",
        operator: ":",
        left: {
          type: "var",
          value: "description"
        },
        right: {
          type: "str",
          value: "some desc"
        }
      },
      {
        type: "assign",
        operator: ":",
        left: {
          type: "var",
          value: "properties"
        },
        right: [
          {
            type: "reference",
            label: {
              type: "var",
              value: "some_prop"
            },
            constraints: [
              {
                type: "str",
                value: "required"
              },
              {
                type: "assign",
                operator: "=",
                left: {
                  type: "str",
                  value: "minItems"
                },
                right: {
                  type: "num",
                  value: 3
                }
              }
            ]
          }
        ]
      }
    ]
  }
]

[
  type: "str",
  value: "Class",

]