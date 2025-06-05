# Import Rules

-  types → imports nothing
-  shared → imports external libraries & types only. For functions needed by /constants, such as times/dates
-  constants → imports types + shared
-  validations → imports types + shared + constants
-  utilities → imports types + shared + constants + validations
-  database → imports everything above
