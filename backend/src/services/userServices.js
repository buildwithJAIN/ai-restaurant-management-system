import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const UserService = {
  async createUser(data) {
    const { firstName, lastName, email, username, gender, role, password } = data;

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email,username } });
    if (existing) throw new Error("User already exists");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    return prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        gender,
        role,
        password: hashedPassword,
      },
    });
  },
  async validateLogin(identifier, password) {
    // Find user by email OR username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Don’t return password
    const { password: _, ...userSafe } = user;
    return { user: userSafe, token };
  },
};
