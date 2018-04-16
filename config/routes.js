'use strict'

module.exports = require('lib/wiring/routes')

// create routes

// what to run for `GET /`
.root('root#root')

// standards RESTful routes
.resources('examples', { except: ['new', 'edit'] })
.resources('blogPosts', { except: ['new', 'edit'] })
.resources('webpages', { except: ['new', 'edit'] })
.resources('images')

// users of the app have special requirements
.post('/sign-up', 'users#signup')
.post('/sign-in', 'users#signin')
.delete('/sign-out/:id', 'users#signout')
.patch('/change-password/:id', 'users#changepw')
.resources('users', { only: ['index', 'show'] })
.get('/ownedimages/:id', 'images#indexByUser')
.resources('tokens', { only: ['create'] })
.get('/ownedwebpages/:id', 'webpages#indexByUser')
.get('/ownedblogposts/:id', 'blogPosts#indexByUser')
// all routes created
