import mongoose, { Schema } from "mongoose"; 

interface userSchemaProps {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
}


const userSchema = new Schema<userSchemaProps>({
    name: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: Schema.Types.String,
        required: true,
    },
    avatar: {
        type: Schema.Types.String,
        default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp",
    },
    createdAt: {
        type: Schema.Types.Date,
        default: Date.now,
    },   
}, {timestamps: true});

const User = mongoose.model<userSchemaProps>("User", userSchema);

export default User;