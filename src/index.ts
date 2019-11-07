const router = express.Router();

router.get("users", JwtManager.middleware, (req, res) => {
  console.log(req.payload.email);
});

app.use("/", router);
