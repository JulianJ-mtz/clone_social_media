import e from "express";
import { config } from "./config.js";
import userRoutes from "./routes/user.routes.js";
import morgan from "morgan";

const app = e();
const PORT = config.PORT;

app.use(e.json());
app.use(morgan("dev"));
app.use(userRoutes);

app.listen(PORT);
console.log(`Server listening on http://localhost:${PORT}`);
