# Grants.js entitlements schema comments

Grants.js entitlements entity is a plain JSON object.



> Rules

Rules are applied contextually - that is, the value passed to the rule is the complete value of the rule. Example:
- in case of root rules entire schema is passed to the compliance function;
- in case of parameter rule - only parameter value is passed to the function; note, that this parameter value can be an object as well, not just plain primitive data value.

Feature: injectable compliance checkers which can call each other.

