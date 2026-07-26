const jwt = require('jsonwebtoken')
require('dotenv').config()

function requireAuth(...allowedRoles) {
    return function (req, res, next) {
        const bearerToken = req.headers.authorization
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            return res.status(401).send({ message: "unauthorized access" })
        }

        const token = bearerToken.split(' ')[1]
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
                return res.status(403).send({ message: "forbidden" })
            }
            req.user = decoded
            next()
        } catch (err) {
            return res.status(401).send({ message: "unauthorized access" })
        }
    }
}

module.exports = requireAuth
