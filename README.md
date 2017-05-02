# Schesign Text Based Language Parser


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
                type: "var",
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