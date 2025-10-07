import { Router } from "express";

const router = Router();

router.get("/users", (req, res) => {
    res.send("get users");
});

router.post("/users", (req, res) => {
    res.send("get users");
});

router.get("/users/:id", (req, res) => {
    res.send("get users");
});

router.delete("/users/:id", (req, res) => {
    res.send("get users");
});

router.put("/users/:id", (req, res) => {
    res.send("get users");
});

export default router;
