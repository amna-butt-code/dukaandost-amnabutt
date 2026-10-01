import StoreSettings from '../models/StoreSettings.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) settings = await StoreSettings.create({});
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { storeName, city, whatsappNumber, deliveryPolicy, faqs } = req.body;

    if (!storeName?.trim() || !city?.trim() || !whatsappNumber?.trim() || !deliveryPolicy?.trim()) {
      return res.status(400).json({
        message: 'Store name, city, WhatsApp number and delivery policy are required',
      });
    }
    const cleanFaqs = (Array.isArray(faqs) ? faqs : []).filter(
      (f) => f.question?.trim() && f.answer?.trim()
    );
    if (cleanFaqs.length < 3) {
      return res.status(400).json({ message: 'Please add at least 3 FAQs' });
    }

    let settings = await StoreSettings.findOne();
    if (!settings) settings = new StoreSettings();
    Object.assign(settings, { storeName, city, whatsappNumber, deliveryPolicy, faqs: cleanFaqs });
    await settings.save();

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
