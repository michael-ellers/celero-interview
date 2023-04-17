const express = require('express')
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const cors = require('cors')
const app = express()

const customers = [
    { id: 1, name: 'Michael'},
    { id: 2, name: 'Tracy'},
    { id: 3, name: 'Lucy'}
]

const transactions = [
    { id: 1, amount: 10, customerId: 1 },
    { id: 2, amount: 15, customerId: 1 },
    { id: 3, amount: 42, customerId: 1 },
    { id: 4, amount: 61, customerId: 2 },
    { id: 5, amount: 21, customerId: 2 },
    { id: 6, amount: 5, customerId: 2 },
    { id: 7, amount: 51, customerId: 3 },
    { id: 8, amount: 3, customerId: 3 }
]

const TransactionType = new GraphQLObjectType ({
    name: 'Transaction',
    description: 'This represents a transaction made by a customer',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        amount: { type: GraphQLNonNull(GraphQLInt) },
        customerId: { type: GraphQLNonNull(GraphQLInt) },
        customer: { 
            type: CustomerType,
            resolve: (transaction) => {
                return customers.find(customer => customer.id === transaction.customerId)
            }
        }
    })
})

const CustomerType = new GraphQLObjectType ({
    name: 'Customer',
    description: 'This represents a customer of one more transactions',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        transactions: { type: new GraphQLList(TransactionType), 
        resolve: (customer) => {
            return transactions.filter(transaction => transaction.customerId === customer.id)
        }}
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query', 
    description: 'Root Query',
    fields: () => ({
        transaction: {
            type: TransactionType,
            description: 'A single transaction',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => transactions.find(transaction => transaction.id === args.id)
        },
        transactions: {
            type: new GraphQLList(TransactionType),
            description: 'List of All Transactions',
            resolve: () => transactions
        },
        customer: {
            type: CustomerType,
            description: 'List of all customers',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => customers.find(customer => customer.id === args.id)
        },
        customers: {
            type: new GraphQLList(CustomerType),
            description: 'A single customer',
            resolve: () => customers
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addTransaction: {
            type: TransactionType,
            description: 'Add a Transaction',
            args: {
                amount: { type: GraphQLNonNull(GraphQLString) },
                customerId: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const transaction = { 
                    id: transactions.length + 1, 
                    amount: args.amount, 
                    customerId: args.customerId
                }
                transactions.push(transaction)
                return transaction
            }
        },
        updateTransaction: {
            type: TransactionType,
            description: 'Update a transaction',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)},
                amount: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const transaction = transactions.find(transaction => transaction.id === args.id)
                if (!transaction) {
                    throw new Error(`Transaction with id ${args.id} not found`)
                }
                transaction.amount = args.amount
                return transaction
            }
        },
        addCustomer: {
            type: CustomerType,
            description: 'Add a customer',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const customer = { 
                    id: customers.length + 1, 
                    name: args.name
                }
                customers.push(customer)
                return customer
            }
        },
        updateCustomer: {
            type: CustomerType,
            description: 'Update a customer',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)},
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const customer = customers.find(customer => customer.id === args.id)
                if (!customer) {
                    throw new Error(`Customer with id ${args.id} not found`)
                }
                customer.name = args.name
                return customer
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use(cors());

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(5000., () => console.log('Server is running'))