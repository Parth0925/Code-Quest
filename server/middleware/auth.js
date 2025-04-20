import jwt from "jsonwebtoken"

const auth=(req,res,next)=>{
    try {
        const token =req.headers.authorization.split(" ")[1];
        let decodedata=jwt.verify(token,process.env.JWT_SECRET)
        req.userid=decodedata?.id;
        next();
        
        if (!token) {
            // If no token is provided, return an error
            return res.status(401).json({ message: "Authorization token missing" });
          }
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export default auth;