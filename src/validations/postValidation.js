import Joi from "joi";

export const validatePost = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .min(1)
      .max(150)
      .trim(),
    body: Joi.string()
      .required()
      .min(1)
      .trim(),
    // media: Joi.array()
    //   .items(Joi.object({
    //     url: Joi.string().uri().required(),
    //     publicId: Joi.string().required(),
    //   }))
    //   .optional(),
    // tags: Joi.array()
    //   .items(Joi.string().trim())
    //   .optional(),
    
  });

  return schema.validate(data);
};
