function createSuggestionController(service) {
  return {
    async getSuggestions(req, res, next) {
      try {
        const result = await service.getTodaySuggestions(req.user.id);
        return res.json({ ...result, disclaimer: 'AI suggestions are general wellness information, not medical advice. Consult a qualified clinician or registered dietitian for personalized care.' });
      } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        return next(error);
      }
    },
  };
}

module.exports = { createSuggestionController };
