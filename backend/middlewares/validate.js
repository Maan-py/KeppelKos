export const validate = (schema) => {
  return (req, res, next) => {
    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      const formattedErrors = validation.error.flatten();
      return res.status(400).json({
        status: "error",
        message: "Data yang dikirim tidak valid!",
        formErrors: formattedErrors.formErrors,
        fieldErrors: formattedErrors.fieldErrors,
      });
    }

    req.body = validation.data;

    next();
  };
};
