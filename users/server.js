// /Users/entingwu/Documents/workspace/GraphQLRelayWorkspace/prod/users   server.js
// localhost:4000/graphql
const express = require('express');
const expressGraphQL = require('express-graphql');// Glue layer

// schema tells graphql what type of data it is working with. How all the relations play out between different pieces of data.
const schema = require('./schema/schema');

// Make express application
const app = express();

// Wire up middleware (eg. expressGraphQL) to express app
app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true
}));

// Listen to port 4000
app.listen(4000, () => {
  console.log('Listening');
});
