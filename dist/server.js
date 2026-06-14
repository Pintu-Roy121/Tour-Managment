/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app.js";
import { envVers } from "./app/config/env.js";
let server;
// const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        const mongoUri = envVers.DB_ATLAS;
        if (!mongoUri) {
            throw new Error("MongoDB URI not found in environment variables");
        }
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");
        server = app.listen(envVers.PORT, () => {
            console.log(`Server is running on port ${envVers.PORT}`);
        });
    }
    catch (error) {
        console.error("Error starting server:", error);
    }
};
startServer();
process.on("unhandledRejection", () => {
    console.error("Unhandled Rejection detected. Shutting down gracefully...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("uncaughtException", () => {
    console.error("Uncaught Exception detected. Shutting down gracefully...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("SIGTERM", () => {
    console.error("SIGTERM received. Shutting down gracefully...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// process.on("SIGINT", () => {
//   console.error("SIGINT received. Shutting down gracefully...");
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });
// Promise.reject(new Error("This is an unhandled rejection test"));
// throw new Error("This is an uncaught exception test");
//# sourceMappingURL=server.js.map