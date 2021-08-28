const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.use("/user", require("./routes/user"));
app.use("/products", require("./routes/products"));
app.use("/checkout", require("./routes/checkout"));

app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});
