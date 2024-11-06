import Joi from "joi";

export const validateComment = (data) => {
  const schema = Joi.object({
    body: Joi.string()
      .required()
      .min(1)
      .max(500)
      .trim(),

    post: Joi.string()
      .required(),
    replies: Joi.array()
      .items(Joi.object({
        body: Joi.string()
          .required()
          .min(1)
          .max(500)
          .trim(),
        user: Joi.string()
          .required(),
      }))
      .optional(),
  });

  return schema.validate(data);
};
