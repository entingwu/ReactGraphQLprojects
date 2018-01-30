/* Schemas: Object properties and relations */
const graphql = require('graphql');
//const _ = require('lodash'); //walk through collections of data users
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
      id: { type: GraphQLString },
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      users: {
        type: new GraphQLList(UserType),
        resolve(parentValue, args) {
          return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
            .then(resp => resp.data);
        }
      }
  })
});

// User Type: company <-resolve()-> User Model: companyId
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({//properties of User
      id: { type: GraphQLString },
      firstName: { type: GraphQLString },
      age: { type: GraphQLInt },
      company: {
        type: CompanyType,
        resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(resp => resp.data);
        }
      }
  })
});
/* 10. Root Queries: take the query and enter into the graph data */
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Looking for a user. Give id, it returns a UserType
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      /* 11. Resolving with data
      {
         user(id: "23") {
           id, firstName, age
         }
      } //resolve: return _.find(users, { id: args.id });
      */
      /* 12. Async Resolve Func:
         make http request and return the generated promise */
      resolve(parentValue, args) {//resolve func goes to database to grab data.
        //read data from third party api. id comes from the query
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data);// { data: {firstName: 'bill'} }

      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age }) {
        return axios.post('http://localhost:3000/users', { firstName, age })
          .then(res => res.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`)
          .then(res => res.data);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
          .then(res => res.data);
      }
    }
  }
});

// Export the schema to be used by other part of application
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
