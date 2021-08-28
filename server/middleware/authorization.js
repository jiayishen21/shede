const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async(req, res, next) => {
	try {

		const jwtToken = req.header("token");

		if (jwtToken === undefined) {
			return res.status(403).json({msg: "Not authorized"});
		}
		
		const payload = jwt.verify(jwtToken, process.env.jwtSecret);

		req.user = payload.user;

		next();
	} catch (error) {
		console.error(error.message);
		return res.status(403).json("Not authorized");
	}
}