const Database = require('./Database')
    // const db = new Database({
    //     database: 'lemon'
    // })


module.exports = (options) => {
    return (req, res, next) => {
        req.db = new Database(options)
        next()
    }
}