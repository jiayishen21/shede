const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator.js");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

router.post("/register", validInfo, async(req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body;
		const user = await pool.query("SELECT * FROM users WHERE email = $1", [
			email
		]);

		if(user.rows.length != 0) {
			return res.status(401).json("This email has already been used to create an account");
		}

		const saltRound = 10;
		const salt = await bcrypt.genSalt(saltRound)

		const bcryptPassword = await bcrypt.hash(password, salt);

		const newUser = await pool.query("INSERT INTO users (first_name, last_name, email, user_password) VALUES($1, $2, $3, $4) RETURNING *", 
		[firstName, lastName, email, bcryptPassword]);

		const token = jwtGenerator(newUser.rows[0].user_id);

		return res.json({ token });
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.post("/login", validInfo, async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await pool.query("SELECT * FROM users WHERE email LIKE $1", [
			email
		]);

		if(user.rows.length === 0) {
			return res.status(401).json("Incorrect password and/or email");
		}

		const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

		if(!validPassword) {
			return res.status(401).json("Incorrect password and/or email");
		}

		const token = jwtGenerator(user.rows[0].user_id);
		res.json({ token });

	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");	
	}
})

router.get("/is-verify", authorization, async (req, res) => {
	try {
		res.json(true);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.get("/language", authorization, async (req, res) => {
	try {
		const user = await pool.query(
			"SELECT * FROM users WHERE user_id = $1",
			[req.user]
		);

		res.json(user.rows[0].lang);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.put("/language", authorization, async (req, res) => {
	try {
		const { lang } = req.body;
		const updateLanguage = await pool.query(
			"UPDATE users SET lang = $1 WHERE user_id = $2 RETURNING *",
			[lang, req.user]
		);

		res.json(updateLanguage.rows[0]);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.get("/cart", authorization, async(req, res) => {
	try {
		const purchases = await pool.query(
			"SELECT * FROM cart WHERE user_id = $1 ORDER BY product_id",
			[req.user]
		);
		
		const products = await pool.query(
			"SELECT * FROM products"
		)

		for(var _i = 0; _i < purchases.rows.length; _i++) {
			for(let product of products.rows) {
				if(purchases.rows[_i].product_id === product && purchases.rows[_i].quantity > product.stock) {
					purchases.rows[_i].quantity = product.stock;

					if(product.stock === 0) {
						await pool.query(
							"DELETE FROM cart WHERE user_id = $1 AND product_id = $2",
							[req.user, product.product_id]
						)
					}
					else {
						await pool.query(
							"UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3",
							[stock, req.user, purchases.rows[_i].product_id]
						);
					}
				}
			}
		}

		res.json(purchases.rows);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.put("/cart", authorization, async(req, res) => {
	try {
		const { product_id, quantity } = req.body;

		const same = await pool.query(
			"SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
			[req.user, product_id]
		);

		if(same.rows.length === 0) {
			const pro = await pool.query(
				"SELECT * FROM products WHERE product_id = $1",
				[product_id]
			);

			const { title, cn_title, price, unit, cn_unit } = pro.rows[0];
			var p = await pool.query(
				"INSERT INTO cart (user_id, product_id, title, cn_title, price, unit, cn_unit, quantity) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
				[req.user, product_id, title, cn_title, price, unit, cn_unit, quantity]
			);
		}
		else {
			var p = await pool.query(
				"UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
				[quantity, req.user, product_id]
			);
		}
		
		res.json(p.rows);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.delete("/cart", authorization, async(req, res) => {
	try {
		const { product_id } = req.body;

		const del = await pool.query(
			"DELETE FROM cart WHERE user_id = $1 AND product_id = $2",
			[req.user, product_id]
		);

		res.json(del.rows[0]);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.get("/history", authorization, async(req, res) => {
	try {
		const history = await pool.query(
			"SELECT * FROM history WHERE user_id = $1",
			[req.user]
		);

		res.json(history.rows);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.post("/history", authorization, async(req, res) => {
	try {
		const { product_id, title, cn_title, price, unit, cn_unit, quantity } = req.body;

		const history = await pool.query(
			"INSERT INTO history (user_id, product_id, title, cn_title, price, unit, cn_unit, quantity) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
			[req.user_id, product_id, title, cn_title, price, unit, cn_unit, quantity]
		);

		res.json(history.rows[0]);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

module.exports = router;