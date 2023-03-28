const express = require("express");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");
const csp = require("helmet-csp");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const path = require("path");
const bootcampRouter = require("./routers/bootcampRoutes");
const courseRouter = require("./routers/courseRoutes");
const authRouter = require("./routers/authRoutes");
const userRotuer = require("./routers/userRoutes");
const reviewRouter = require("./routers/reviewRoutes");

// Importing Env Variables

const app = express();
// Set cors
app.use(cors());
// Setting some headers for security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Allow inline scripts only for the specified endpoint
        "script-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
// cookie-parser
app.use(cookieParser());

// Middlewares
app.use(express.json());
// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);
// prevent hpp(http parameter pollution)
app.use(hpp());

// Data Sanitization for nosql query injection
app.use(mongoSanitize());
// Data sanitization for xss(cross side scripting)
app.use(xss());

// Serving Static Files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/bootcamps", bootcampRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRotuer);
app.use("/api/v1/reviews", reviewRouter);

app.use(globalErrorHandler);

module.exports = app;
