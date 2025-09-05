module.exports = [
  {
    "type": "heading",
    "defaultValue": "Total Digital Configuration"
  },
  {
    "type": "text",
    "defaultValue": "Welcome to total control"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Colors"
      },
      {
        "type": "color",
        "messageKey": "background_color",
        "defaultValue": "0x000000",
        "allowGray": true,
        "label": "Background Color"
      },
      {
        "type": "color",
        "messageKey": "hour_one_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "First Hour Color"
      },
      {
        "type": "color",
        "messageKey": "hour_two_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "Second Hour Color"
      },
      {
        "type": "color",
        "messageKey": "colon_one_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "First Colon Color"
      },
      {
        "type": "color",
        "messageKey": "minute_one_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "First Minute Color"
      },
      {
        "type": "color",
        "messageKey": "minute_two_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "Second Minute Color"
      },
      {
        "type": "color",
        "messageKey": "colon_two_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "Second Colon Color"
      },
      {
        "type": "color",
        "messageKey": "second_one_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "First Second Color"
      },
      {
        "type": "color",
        "messageKey": "second_two_color",
        "defaultValue": "0xFFFFFF",
        "allowGray": true,
        "label": "Second Second Color"
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Number and Cell Dimensions"
      },
      {
        "type": "slider",
        "messageKey": "width",
        "defaultValue": 100,
        "label": "Horizontal Cell Width",
        "description": "The width of each horizontal cell",
        "min": 1,
        "max": 100,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "height",
        "defaultValue": 100,
        "label": "Vertical Cell Height",
        "description": "The height of each vertical cell",
        "min": 1,
        "max": 150,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "stroke",
        "defaultValue": 6,
        "label": "Line Width",
        "description": "The thickness of each individual cell. Set equal to width and height for square-ish shapes",
        "min": 1,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "diagonal",
        "defaultValue": 1,
        "label": "Diagonal Inset",
        "description": "The amount of corner inset on the edges of the cell. Set to 0 for rectangles or set to greater than stroke for funky stuff",
        "min": -10,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "spacing",
        "defaultValue": -5,
        "label": "Cell Spacing",
        "description": "The space in between each cell in a number. Set negative for overlaps",
        "min": -50,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "gap",
        "defaultValue": 4,
        "label": "Gap Width",
        "description": "The horizontal distance between adjacent numbers. Set negative for right > left stacking",
        "min": -20,
        "max": 20,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "xborder",
        "defaultValue": 4,
        "label": "Horizontal Border",
        "description": "The width of the border on the left and right sides of the display",
        "min": 0,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "yborder",
        "defaultValue": 40,
        "label": "Vertical Border",
        "description": "The height of border on the top and bottom sides of the display",
        "min": 0,
        "max": 100,
        "step": 1
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Position and Additional Settings"
      },
      {
        "type": "radiogroup",
        "messageKey": "xjustify",
        "label": "Horizontal Justification",
        "defaultValue": "1",
        "options": [
          {
            "label": "Left",
            "value": "0"
          },
          {
            "label": "Center",
            "value": "1"
          },
          {
            "label": "Right",
            "value": "2"
          },
        ]
      },
      {
        "type": "radiogroup",
        "messageKey": "yjustify",
        "label": "Vertical Justification",
        "defaultValue": "1",
        "options": [
          {
            "label": "Top",
            "value": "0"
          },
          {
            "label": "Center",
            "value": "1"
          },
          {
            "label": "Bottom",
            "value": "2"
          },
        ]
      },
      {
        "type": "toggle",
        "messageKey": "xsquish",
        "label": "Dynamically Resize Width",
        "defaultValue": true,
        "description": "This makes your numbers skinnier in the event of the clockface exceeding the horizontal border (10:00 is wider than 1:00)"
      },
      {
        "type": "toggle",
        "messageKey": "ysquish",
        "label": "Dynamically Resize Height",
        "defaultValue": true,
        "description": "This makes your numbers shorter in the event of the clockface exceeding the bounds selected above (in the case of a timeline event)"
      },
      {
        "type": "toggle",
        "messageKey": "seconds",
        "label": "Display Seconds",
        "defaultValue": false,
        "description": "Dynamically resizing width is recommended"
      }
    ]
  },
  {
      "type": "section",
      "items": [
          {
              "type": "heading",
              "defaultValue": "Alternate Design Toggles",
          },
          {
              "type": "text",
              "defaultValue": "These are some alternate versions of the font.\nJust a stylistic choice."
          },
          {
              "type": "toggle",
              "messageKey": "six_tail",
              "defaultValue": true,
              "label": "Tail Above 6",
          },
          {
              "type": "toggle",
              "messageKey": "seven_tail",
              "defaultValue": false,
              "label": "Tail Left of 7",
          },
          {
              "type": "toggle",
              "messageKey": "nine_tail",
              "defaultValue": true,
              "label": "Tail Below 9",
          },
      ],
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];