import e from "express";
import { config } from "./config.js";
import userRoutes from "./routes/user.routes.js";

const app = e();
const PORT = config.PORT;


app.use(userRoutes);
app.listen(PORT);

console.log(`Server listeng on http://localhost:${PORT}`);
