const router = require("express").Router();
const pool = require("../db");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

router.post("/info", validInfo, async(req, res) => {
	try {
		res.json(true);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.post("/changestock", async(req, res) => {
	try {
		const { purchases } = req.body;
		
		const products = await pool.query("SELECT * FROM products");

		for(let purchase of purchases) {
			for(let product of products.rows) {
				if(product.product_id === purchase.product_id) {
					const remaining = product.stock - purchase.quantity;
					await pool.query("UPDATE products SET stock = $1 WHERE product_id = $2", 
						[remaining, purchase.product_id]
					);
				}
			}
		}

		res.json("Checkout successful");
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.post("/authorized", authorization, async(req, res) => {
	try {
		const { purchases, body } = req.body;
		const { firstName, lastName, email, streetnumber, city } = body;

		for(let purchase of purchases) {
			const {product_id, title, cn_title, price, unit, cn_unit, quantity} = purchase;

			await pool.query("INSERT INTO history (user_id, product_id, title, cn_title, price, unit, cn_unit, quantity, first_name, last_name, email, streetnumber, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
				[req.user, product_id, title, cn_title, price, unit, cn_unit, quantity, firstName, lastName, email, streetnumber, city]
			);
		}

		await pool.query("DELETE FROM cart WHERE user_id = $1", [req.user]);

		res.json("Checkout successful");
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.post("/guest", async(req, res) => {
	try {
		const { purchases, body } = req.body;
		const { firstName, lastName, email, streetnumber, city } = body;

		for(let purchase of purchases) {
			const {product_id, title, cn_title, price, unit, cn_unit, quantity} = purchase;

			await pool.query("INSERT INTO history (product_id, title, cn_title, price, unit, cn_unit, quantity, first_name, last_name, email, streetnumber, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
				[product_id, title, cn_title, price, unit, cn_unit, quantity, firstName, lastName, email, streetnumber, city]
			);
		}

		res.json("Checkout successful");
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

module.exports = router;