const router = require("express").Router();
const pool = require("../db");

router.post("/", async(req, res) => {
	try {
		const { search } = req.body;
		const products = await pool.query("SELECT * FROM products WHERE LOWER(title) LIKE ($1) OR LOWER(cn_title) LIKE LOWER($1) ORDER BY product_id ASC",
		[search]);

		return res.json(products.rows);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.put("/", async(req, res) => {
	try {
		const { product_id, quantity } = req.body;

		const stock = await pool.query(
			"SELECT * FROM products WHERE product_id = $1",
			[product_id]
		);

		const remainingStock = stock.rows[0].stock - quantity;

		const product = await pool.query(
			"UPDATE products SET stock = $1 WHERE product_id = $2 RETURNING *",
			[remainingStock, product_id]
		);

		product.rows[0].stock = stock.rows[0].stock;

		res.json(product.rows[0]);
		
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

router.delete("/", async(req, res) => {
	try {
		const { product_id, quantity } = req.body;

		const stock = await pool.query(
			"SELECT * FROM products WHERE product_id = $1",
			[product_id]
		);

		const remainingStock = stock.rows[0].stock + quantity;

		const product = await pool.query(
			"UPDATE products SET stock = $1 WHERE product_id = $2 RETURNING *",
			[remainingStock, product_id]
		);

		product.rows[0].stock = stock.rows[0].stock;

		res.json(product.rows[0]);
		
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
})

module.exports = router;