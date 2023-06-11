const { auth, requiresAuth } = require('express-openid-connect');
require('dotenv').config();
const jwt = require('jsonwebtoken');

function decodeToken(token) {
    console.log("decodeToken: ", token)
    const decoded = jwt.decode(token, { complete: true });
    console.log(decoded);
}

const config = {
    authRequired: false,
    auth0Logout: true,
    auth0LogoutUrl: process.env.AUTH0_LOGOUT_URL,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    authorizationParams: {
        scope: 'openid profile email create:records update:records delete:records', // add your scopes here
    },
};

function checkScopes(scopes) {
    return (req, res, next) => {
        console.log("checkScopes: ", checkScopes.name)
        console.log(req.oidc.accessToken);
        const webToken = decodeToken(req.oidc.accessToken);
        const userScopes = req.oidc.accessToken?.scope || "";
        const hasScope = scopes.every(scope => userScopes.includes(scope));
        if (!hasScope) {
            res.status(403).json({ error: 'Insufficient scope' });
        } else {
            next();
        }
    }
}

module.exports = { auth, requiresAuth, config, checkScopes, decodeToken };