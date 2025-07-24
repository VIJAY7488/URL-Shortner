import cors from 'cors';

const configureCors = () => {
  const allowOrigins = ["http://localhost:5173"];

  return cors({
    origin(origin, callback) {
      if (!origin || allowOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"],
    credentials: true,
    maxAge: 10*60*60*1000, // 10min
  });
};

export default configureCors;
