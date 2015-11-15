// models/todo.js
module.exports = {
    identity: 'todo',
    connection: 'postgresql',
    attributes: {
        date: {
            type: 'datetime',
            defaultsTo: function () { return new Date(); },
            required: true,
        },
        status: {
            type: 'string',
            enum: ['new', 'assigned', 'done', 'checked', 'pending'],
            required: true,
        },
        location: {
            type: 'string',
            required: true,
        },
        description: {
            type: 'string',
            required: true,
        },
        user: {
            model: 'user',
        },
        userFamilyName: {
            type: 'string',
        },
        /*
        comments: {
            collection: 'comment',
            via: 'todo'
        },
        */
    }
};