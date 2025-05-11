---
trigger: model_decision
description: making js related edits
globs: 
---
## Introduction

These guidelines establish modern JavaScript coding practices, ensuring consistent and maintainable code across the project.

## Guidelines

### Modern JavaScript Features
- Use ES6+ features consistently:
  - Arrow functions for callbacks and methods
  - Template literals for string interpolation
  - Destructuring for object and array manipulation
  - Spread/rest operators where appropriate
  
### Code Structure
- Always include 'use strict' mode
- Use `const` by default, `let` when reassignment is needed
- Never use `var`
- Use camelCase for variable and function names

### Asynchronous Code
- Use async/await for asynchronous operations
- Implement proper error handling with try/catch blocks
```javascript
// Good
async function fetchData() {
  try {
    const response = await api.getData();
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Bad
function fetchData() {
  return api.getData()
    .then(response => response)
    .catch(error => console.error(error));
}
```

### Event Handling
- Prefer event delegation for multiple similar elements
- Use descriptive event handler names
- Remove event listeners when components are destroyed

## Common Pitfalls
- Not using strict mode
- Mixing async/await with .then() chains
- Missing error handling in async operations
- Using var instead of const/let
- Direct event binding instead of delegation for multiple elements 