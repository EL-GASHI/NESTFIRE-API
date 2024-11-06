import Joi from 'joi';
import mongoose from 'mongoose';

// Custom validation for MongoDB ObjectId
const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

// Validation schema specifically for creating a user
export const validateCreateUser = (data) => {
    const createUserSchema = Joi.object({
        firstName: Joi.string()
            .min(2)
            .max(50)
            .required()
            .trim(),
        lastName: Joi.string()
            .min(2)
            .max(50)
            .required()
            .trim(),
        status: Joi.string()
            .max(100)
            .optional()
            .trim(),
        bio: Joi.string()
            .max(500)
            .optional()
            .trim(),
        email: Joi.string()
            .email()
            .required()
            .lowercase()
            .trim(),
        phone: Joi.string()
            .pattern(/^\+?[1-9]\d{1,14}$/)
            .required()
            .trim(),
        password: Joi.string()
            .min(8)
            .required(),
        accountPrivacy: Joi.string()
            .valid('public', 'private', 'friend')
            .default('public'),
        isVerified: Joi.boolean()
            .default(false),
        profileImage: Joi.object({
            url: Joi.string().required(),
            public_id: Joi.string().required(),
        }).optional(),
        posts: Joi.array().items(Joi.custom(objectId)).optional(),
        notifications: Joi.array().items(Joi.custom(objectId)).optional(),
        following: Joi.array().items(Joi.custom(objectId)).optional(),
        followers: Joi.array().items(Joi.custom(objectId)).optional(),
    });

    return createUserSchema.validate(data);
};



// Validation schema specifically for updating a user
export const validateUpdateUser = (data) => {
    const updateUserSchema = Joi.object({
        firstName: Joi.string()
            .min(2)
            .max(50)
            .optional()
            .trim(),
        lastName: Joi.string()
            .min(2)
            .max(50)
            .optional()
            .trim(),
        status: Joi.string()
            .max(100)
            .optional()
            .trim(),
        bio: Joi.string()
            .max(500)
            .optional()
            .trim(),
        email: Joi.string()
            .email()
            .optional()
            .lowercase()
            .trim(),
        phone: Joi.string()
            .pattern(/^\+?[1-9]\d{1,14}$/)
            .optional()
            .trim(),
        password: Joi.string()
            .min(8)
            .optional(),
        accountPrivacy: Joi.string()
            .valid('public', 'private', 'friend')
            .optional(),
        isVerified: Joi.boolean()
            .optional(),
        profileImage: Joi.object({
            url: Joi.string().optional(),
            public_id: Joi.string().optional(),
        }).optional(),
        posts: Joi.array().items(Joi.custom(objectId)).optional(),
        notifications: Joi.array().items(Joi.custom(objectId)).optional(),
        following: Joi.array().items(Joi.custom(objectId)).optional(),
        followers: Joi.array().items(Joi.custom(objectId)).optional(),
        postsLike: Joi.array().items(Joi.custom(objectId)).optional(),

    });

    return updateUserSchema.validate(data);
};
