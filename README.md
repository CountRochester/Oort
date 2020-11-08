# Freeware ECM-system
## Current version 1.1.1
## Requirements
 - Node.js v.14 and above
 - PostgreSQL v.12 and above
## Stack
 - Fastify featured server with ApolloServer
 - Database based on PostgreSQL
 - Sequelize ORM to interract with database
 - Multer for file transfer
 - Nuxt-based frontend
 - GUI fetured by Vuetify
## Features
 - Almost fully working ECM (documents transfer between the departments under construction)
 - Realtime application with data update via WebSocket
 - GraphQL-based client-server interract
 - GraphQL subscription support
 - Document lifecycle support
 - Resolution to documents support
 - IndexedDB support for data storing on the client
## Development plan
 - [x] v.1.1.1 (current)
 - [ ] v.1.1.2 fix documents transfer between the departments
 - [ ] v.1.1.x bugfix and QoL changes
 - [ ] v.1.2.0 GraphQL schema and resolvers refactoring, remove unusing function
 - [ ] v.1.2.1 Remove moment and data type from scema (frontend update)
 - [ ] v.1.2.5 Optimize the schema (rename entity props in frontend and backend)
 - [ ] v.1.3.0 General server refactoring (optimize and remove several dependences)
 - [ ] v.1.3.5 Upgrade the authentification (remove unused dependences)
 - [ ] v.1.4.0 Decompose the server. Relocate the file server (create mini-CDN) in separate thread
 - [ ] v.1.5.0 Optimize the schema, unification of file storing and accessing
 - [ ] v.1.6.0 Optimize the client, add setings to user, limit the number of first loaded entitys
 - [ ] v.1.7.0 Database managment update (replication and sync)
 - [ ] v.1.7.5 Add file server replication and sync
 - [ ] v.1.8.0 Major visualize and GUI update
 - [ ] v.2.0.0 Add new module of document archive