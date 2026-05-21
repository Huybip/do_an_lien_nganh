'use strict';

const DENTAL_SYSTEM_PROMPT = `You are DentalAI, an expert dental health assistant for VinaMec Dental Clinic (Nha Khoa VinaMec).
You provide accurate, helpful, and empathetic responses about dental health, treatments, prevention, and oral care.
ALWAYS respond in the SAME language the user writes in (Vietnamese or English).
Be concise (under 200 words), friendly, and professional.
If asked about medications, treatments, or diagnosis, always note that a licensed dentist must confirm.
If you don't know something, say so honestly and recommend seeing a dentist.
For Vietnamese queries, use Vietnamese naturally (đánh răng, sâu răng, đau răng, etc.).
Never make up medical information. Keep responses practical and actionable.
Clinic info: VinaMec Dental Clinic - We offer general dentistry, orthodontics, implants, cosmetic dentistry.`;

const PRIVATE_SYSTEM_PROMPT = `You are DentalAI, a private clinical assistant for VinaMec Dental Clinic (Nha Khoa VinaMec).
You have access to the patient's context and medical history.
Provide personalized dental health advice based on the patient's profile.
For doctors: provide clinical insights, treatment suggestions, ICD codes references, and evidence-based recommendations.
For patients: provide personalized guidance based on their dental history, dental scores, and recent diagnoses.
ALWAYS respond in the SAME language the user writes in.
Maintain medical confidentiality and professionalism.
Keep responses concise and actionable (under 200 words).`;

const GREETING_FAQ = {
  vi: [
    "Xin chào! Tôi là trợ lý nha khoa AI của Nha Khoa VinaMec. Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi về sức khỏe răng miệng, các dịch vụ khám, hay bất kỳ thắc mắc nào về chăm sóc răng.",
    "Chào bạn! 👋 Tôi là AI assistant của VinaMec Dental. Tôi có thể tư vấn về: sâu răng, viêm nướu, tẩy trắng răng, niềng răng, implant, và chăm sóc răng miệng hàng ngày.",
    "Xin chào! Rất vui được gặp bạn! Tôi có thể giúp bạn tìm hiểu về các vấn đề răng miệng, đặt lịch khám, hoặc tư vấn dịch vụ nha khoa tại VinaMec.",
  ],
  en: [
    "Hello! I'm DentalAI, your virtual assistant from VinaMec Dental Clinic. How can I help you today? You can ask about dental health, appointments, or any oral care questions.",
    "Hi there! 👋 I'm the AI assistant at VinaMec Dental. I can help with: cavities, gum disease, teeth whitening, braces, implants, and daily oral care tips.",
    "Welcome! I'm here to help with dental health questions, appointment booking, or information about our services at VinaMec Dental Clinic.",
  ],
};

/**
 * Detect language from message
 */
const detectLanguage = (text) => {
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹảẻêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const viCount = (text.match(vietnameseChars) || []).length;
  return viCount >= text.length * 0.1 ? 'vi' : 'en';
};

/**
 * Try to use OpenAI if API key is provided, otherwise use rule-based fallback
 */
const callAI = async (messages, systemPrompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const provider = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'groq'
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  if (apiKey) {
    let baseUrl = 'https://api.openai.com/v1';
    let actualModel = model;

    // Support Groq API (cheaper & faster, uses OpenAI-compatible format)
    if (provider === 'groq' || apiKey.startsWith('gsk_')) {
      baseUrl = 'https://api.groq.com/openai/v1';
      // Groq-supported models
      const groqModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
      actualModel = groqModels.includes(model) ? model : 'llama-3.3-70b-versatile';
    }

    try {
      const https = require('https');
      const payload = JSON.stringify({
        model: actualModel,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 600,
        temperature: 0.7,
      });

      return await new Promise((resolve, reject) => {
        const urlObj = new URL(`${baseUrl}/chat/completions`);
        const req = https.request(
          {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) return reject(new Error(parsed.error.message));
                resolve(parsed.choices[0].message.content.trim());
              } catch (e) {
                reject(e);
              }
            });
          }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    } catch (err) {
      console.warn(`AI API error (${provider}), falling back to rule-based:`, err.message);
    }
  }

  // Fallback rule-based AI
  return ruleBasedResponse(messages[messages.length - 1]?.content || '');
};

// ─── Comprehensive Dental FAQ Database ───────────────────────────────────────
const DENTAL_FAQ = [
  // TOOTHACHE / ĐAU RANG
  {
    keywords: ['toothache', 'đau răng', 'pain', 'đau', 'đau nhức', 'nhức răng', 'răng đau'],
    answer: {
      vi: 'Đau răng có thể do nhiều nguyên nhân: sâu răng, viêm tủy, mòn men răng, hoặc cao răng. *Khuyến nghị tạm thời:* Ngậm nước muối ấm, uống thuốc giảm đau (paracetamol/ibuprofen), tránh thức ăn quá nóng/lạnh. Quan trọng: Hãy đặt lịch khám tại VinaMec để được bác sĩ chẩn đoán chính xác.',
      en: 'Toothaches can be caused by cavities, pulp infection, enamel wear, or tartar. *Temporary relief:* Rinse with warm salt water, take OTC pain relievers, avoid very hot/cold foods. Important: Book an appointment at VinaMec for accurate diagnosis.',
    },
  },
  // BRUSHING / DANH RANG
  {
    keywords: ['brush', 'đánh răng', 'brushing', 'toothbrush', 'bàn chải', 'chải răng'],
    answer: {
      vi: 'Bạn nên đánh răng ít nhất 2 lần/ngày (sáng và tối), mỗi lần 2-3 phút. Dùng kem đánh răng có fluoride. Chọn bàn chải lông mềm, thay bàn chải mỗi 3 tháng. Không đánh răng ngay sau khi ăn đồ chua (chờ 30 phút).',
      en: 'Brush your teeth at least twice daily (morning & night) for 2-3 minutes each time using fluoride toothpaste. Use a soft-bristled toothbrush and replace it every 3 months. Wait 30 minutes after acidic food before brushing.',
    },
  },
  // FLOSSING / CHI NHA KHOA
  {
    keywords: ['floss', 'flossing', 'chỉ nha khoa', 'xỉa răng', 'tăm răng', ' interdental'],
    answer: {
      vi: 'Nên sử dụng chỉ nha khoa ít nhất 1 lần/ngày để loại bỏ thức ăn và mảng bám giữa các răng mà bàn chải không thể chạm tới. Nếu dùng tăm, hãy nhẹ nhàng và không cắm sâu vào nướu. Tốt nhất nên dùng chỉ nha khoa thay vì tăm.',
      en: 'Floss at least once daily to remove plaque and food particles between teeth where your toothbrush can\'t reach. If using toothpicks, be gentle and don\'t push too deep into gums. Dental floss is recommended over wooden picks.',
    },
  },
  // WHITENING / TAY TRANG
  {
    keywords: ['whitening', 'white', 'tẩy trắng', 'trắng răng', 'làm trắng', 'răng ố'],
    answer: {
      vi: 'Các phương pháp tẩy trắng: (1) Tẩy trắng tại phòng khám (hiệu quả cao nhất, an toàn), (2) Máng tẩy tại nhà theo chỉ định bác sĩ, (3) Miếng dán/cream tẩy trắng (hiệu quả hạn chế). Lưu ý: Tẩy trắng có thể gây nhạy cảm tạm thời. Liên hệ VinaMec để được tư vấn phương pháp phù hợp.',
      en: 'Whitening options: (1) In-office treatment (most effective, safest), (2) Take-home trays prescribed by dentist, (3) OTC strips/creams (limited effect). Note: Whitening may cause temporary sensitivity. Contact VinaMec for personalized advice.',
    },
  },
  // CAVITIES / SAU RANG
  {
    keywords: ['cavity', 'cavities', 'sâu răng', 'decay', 'filling', 'trám', 'trám răng', 'lỗ sâu'],
    answer: {
      vi: 'Sâu răng là tổn thương vĩnh viễn trên bề mặt răng tạo thành lỗ. Nguyên nhân: vi khuẩn + đường + axit tấn công men răng. Phòng ngừa: đánh răng 2 lần/ngày, hạn chế đồ ngọt, khám định kỳ 6 tháng/lần. Điều trị: Phương pháp phổ biến nhất là hàn (trám) răng. Nếu sâu nặng có thể cần chữa tủy hoặc bọc sứ.',
      en: 'Cavities are permanently damaged areas forming holes. Cause: bacteria + sugar + acid attacking enamel. Prevention: brush twice daily, limit sugary foods, regular check-ups every 6 months. Treatment: Most common is dental filling. Severe cases may need root canal or crown.',
    },
  },
  // GUM DISEASE / VIEM NUOCU
  {
    keywords: ['gum', 'nướu', 'gingivitis', 'periodontitis', 'bleeding', 'chảy máu nướu', 'viêm nướu', 'viêm quanh răng', 'nướu sưng', 'tụt nướu'],
    answer: {
      vi: 'Bệnh nướu gồm 2 giai đoạn: (1) Viêm nướu (nhẹ) - nướu đỏ, sưng, chảy máu khi đánh răng. (2) Viêm quanh răng (nặng) - có thể gây mất xương và răng. Điều trị: Lấy cao răng chuyên nghiệp, cải thiện vệ sinh răng miệng, trong trường hợp nặng có thể phẫu thuật. Hãy đặt lịch khám tại VinaMec để được kiểm tra.',
      en: 'Gum disease has 2 stages: (1) Gingivitis (mild) - red, swollen, bleeding gums. (2) Periodontitis (severe) - bone loss and tooth loss possible. Treatment: Professional cleaning, improved home care, surgery in severe cases. Book an appointment at VinaMec for evaluation.',
    },
  },
  // APPOINTMENT / DAT LICH
  {
    keywords: ['appointment', 'book', 'schedule', 'đặt lịch', 'hẹn', 'lịch hẹn', 'đăng ký khám', 'booking'],
    answer: {
      vi: 'Bạn có thể đặt lịch khám tại VinaMec qua: (1) Website/ứng dụng: vào mục "Đặt lịch hẹn" → Chọn dịch vụ → Chọn bác sĩ → Chọn ngày giờ. (2) Hotline: Gọi trực tiếp tới phòng khám. (3) Zalo: Nhắn tin qua page chính thức. Chúng tôi khám từ Thứ 2 - Thứ 7, 8:00 - 18:00.',
      en: 'You can book an appointment at VinaMec via: (1) Website/App: Go to "Appointments" → Select service → Choose doctor → Pick date/time. (2) Hotline: Call the clinic directly. (3) Zalo/WhatsApp: Message our official page. We operate Mon-Sat, 8:00 AM - 6:00 PM.',
    },
  },
  // X-RAY / X-QUANG
  {
    keywords: ['x-ray', 'xray', 'xquang', 'x ray', 'scan', 'chụp phim', 'chụp X-quang', 'chụp X quang'],
    answer: {
      vi: 'X-quang nha khoa giúp phát hiện các vấn đề không nhìn thấy được khi khám: sâu răng giữa các răng, mất xương, răng khôn ngầm, hoặc bệnh nướu. Chụp X-quang an toàn với bức xạ rất thấp. Tại VinaMec, chúng tôi sử dụng máy X-quang kỹ thuật số hiện đại, giảm bức xạ tối đa.',
      en: 'Dental X-rays help detect hidden problems: cavities between teeth, bone loss, impacted wisdom teeth, or gum disease. X-rays are safe with minimal radiation. At VinaMec, we use modern digital X-ray equipment that minimizes radiation exposure.',
    },
  },
  // CHILDREN / TRE EM
  {
    keywords: ['children', 'kid', 'baby', 'trẻ em', 'infant', 'bé', 'em bé', 'răng sữa'],
    answer: {
      vi: 'Lần đầu khám nha khoa cho trẻ nên từ 6-12 tháng tuổi hoặc khi răng sữa đầu tiên mọc. Chăm sóc răng sữa rất quan trọng vì: (1) Giữ chỗ cho răng vĩnh viễn, (2) Giúp trẻ nhai thức ăn đúng cách, (3) Ảnh hưởng đến phát âm. Nên khám định kỳ 6 tháng/lần. VinaMec có dịch vụ nha khoa trẻ em với bác sĩ chuyên môn.',
      en: 'First dental visit should be at 6-12 months or when first baby tooth appears. Baby teeth care is important because: (1) Holds space for permanent teeth, (2) Helps proper chewing, (3) Affects speech development. Check-ups every 6 months recommended. VinaMec has pediatric dental services with specialized doctors.',
    },
  },
  // COST/PRICE / GIA
  {
    keywords: ['cost', 'price', 'fee', 'giá', 'chi phí', 'bao nhiêu', 'hết bao nhiêu', 'phí', 'bảo hiểm', 'insurance'],
    answer: {
      vi: 'Chi phí nha khoa tại VinaMec phụ thuộc vào dịch vụ: Khám răng định kỳ: Miễn phí | Lấy cao răng: 200-500k | Trám răng: 300k-1.5M/răng | Tẩy trắng: 2-8M | Niềng răng: 25-80M | Implant: 15-35M/răng. Nhiều dịch vụ được bảo hiểm y tế chi trả một phần. Liên hệ để được báo giá chi tiết.',
      en: 'VinaMec dental costs depend on service: Check-up: Free | Scaling: $10-25 | Filling: $15-75/tooth | Whitening: $100-400 | Braces: $1,200-4,000 | Implants: $750-1,800/tooth. Many services are partially covered by health insurance. Contact us for detailed pricing.',
    },
  },
  // BAD BREATH / HOA MIENG
  {
    keywords: ['bad breath', 'halitosis', 'hôi miệng', 'mùi hôi', 'hơi thở', 'thơm miệng'],
    answer: {
      vi: 'Hôi miệng có thể do: (1) Vệ sinh răng miệng kém, (2) cao răng, (3) sâu răng hoặc bệnh nướu, (4) khô miệng, (5) ăn thực phẩm có mùi mạnh, (6) các vấn đề tiêu hóa. Cách khắc phục: Đánh răng lưỡi, dùng chỉ nha khoa, uống đủ nước, khám răng định kỳ. Nếu kéo dài, hãy đến VinaMec để kiểm tra nguyên nhân.',
      en: 'Bad breath can be caused by: (1) Poor oral hygiene, (2) tartar, (3) cavities or gum disease, (4) dry mouth, (5) strong-smelling foods, (6) digestive issues. Fix: Brush tongue, floss, drink enough water, regular check-ups. If persistent, visit VinaMec for evaluation.',
    },
  },
  // SENSITIVE TEETH / RANG NHẠY CẢM
  {
    keywords: ['sensitive', 'sensitivity', 'nhạy cảm', 'đau khi ăn', 'đau khi uống', 'lạnh', 'nóng', ' ê buốt', 'buốt răng'],
    answer: {
      vi: 'Răng nhạy cảm thường do: men răng mòn, nướu tụt, hoặc sâu răng. *Tạm thời:* Dùng kem đánh răng cho răng nhạy cảm (có potassium nitrate). Tránh đồ ăn quá nóng/lạnh/ngọt/chua. *Lâu dài:* Đến VinaMec để bác sĩ đánh giá: có thể cần niêm phong ống ngà, điều trị sâu, hoặc điều trị bệnh nướu.',
      en: 'Tooth sensitivity is usually caused by: worn enamel, receding gums, or cavities. *Temporary fix:* Use sensitivity toothpaste (potassium nitrate). Avoid very hot/cold/sweet/sour foods. *Long-term:* Visit VinaMec for evaluation: may need sealants, filling, or gum treatment.',
    },
  },
  // WISDOM TOOTH / RANG KHON
  {
    keywords: ['wisdom', 'khôn', 'răng khôn', 'răng số 8', 'impaction', 'ngầm', 'mọc ngang'],
    answer: {
      vi: 'Răng khôn (răng số 8) thường mọc ở tuổi 17-25. Có thể mọc thẳng, nghiêng, hoặc ngầm trong xương. Khi nào nên nhổ: Đau, sưng, viêm nhiễm, đè vào răng bên cạnh, hoặc khó vệ sinh. Phẫu thuật nhổ răng khôn ngầm phức tạp hơn. Liên hệ VinaMec để chụp X-quang và tư vấn.',
      en: 'Wisdom teeth (3rd molars) usually emerge at age 17-25. They can grow straight, tilted, or impacted. When to remove: Pain, swelling, infection, pushing neighboring teeth, or difficult cleaning. Impacted tooth surgery is more complex. Contact VinaMec for X-ray and consultation.',
    },
  },
  // IMPLANT / TRONG IMPLANT
  {
    keywords: ['implant', 'cấy ghép', 'cấy ghép implant', 'trồng răng', 'răng giả', ' prosthesis'],
    answer: {
      vi: 'Implant nha khoa là phương pháp trồng răng giả bằng trụ titanium cấy vào xương hàm. Ưu điểm: Nhìn và chức năng như răng thật, không mài răng bên cạnh, bảo tồn xương. Quy trình: Cắm trụ (2-6 tháng lành) → Trụ abutment → Răng sứ. Chi phí: 15-35 triệu/răng tùy loại implant. Liên hệ VinaMec để được tư vấn chi tiết.',
      en: 'Dental implant is a titanium post surgically placed into the jawbone to support a replacement tooth. Advantages: Looks and functions like natural teeth, no grinding of adjacent teeth, preserves bone. Process: Post placement (2-6 months healing) → Abutment → Crown. Cost: $750-1,800/tooth depending on implant type. Contact VinaMec for consultation.',
    },
  },
  // BRACES / NIỀNG RĂNG
  {
    keywords: ['braces', 'orthodontic', 'niềng', 'niềng răng', 'ortho', ' Invisalign', 'niêm phong', 'sealant', 'sealants'],
    answer: {
      vi: 'Niềng răng (orthodontics) điều trị: Răng lệch lạc, khấp khểnh, hô, móm, sai khớp cắn. Các loại: (1) Niềng mắc cài kim loại (phổ biến, chi phí thấp), (2) Mắc cài sứ (thẩm mỹ hơn), (3) Niềng trong suốt Invisalign (thẩm mỹ cao nhất), (4) Niềng rãnh (dishing). Thời gian: 12-36 tháng. Liên hệ VinaMec để khám và lên kế hoạch điều trị.',
      en: 'Braces/orthodontics treat: Crooked teeth, crowding, overbite, underbite, jaw misalignment. Types: (1) Metal braces (common, lower cost), (2) Ceramic braces (more aesthetic), (3) Clear aligners like Invisalign (most aesthetic), (4) Lingual braces (hidden). Duration: 12-36 months. Contact VinaMec for consultation.',
    },
  },
  // EXTRACTION / NHỔ RĂNG
  {
    keywords: ['extract', 'extraction', 'nhổ răng', 'nhổ', 'loại bỏ răng', 'remove tooth'],
    answer: {
      vi: 'Nhổ răng được chỉ định khi: răng sâu nặng không thể phục hồi, răng khôn gây biến chứng, hoặc theo chỉ định niềng. Sau khi nhổ: (1) Cắn chặt gạc 30-60 phút, (2) Không ăn nóng trong 24h, (3) Không súc miệng mạnh, (4) Uống thuốc theo đơn, (5) Chườm đá giảm sưng. Liên hệ VinaMec nếu đau dữ dội hoặc chảy máu kéo dài.',
      en: 'Extraction is indicated when: tooth is severely decayed and unrepairable, wisdom tooth causes complications, or as part of orthodontic treatment. After extraction: (1) Bite gauze 30-60 min, (2) Avoid hot food for 24h, (3) No vigorous rinsing, (4) Take prescribed medications, (5) Apply ice to reduce swelling. Contact VinaMec if severe pain or prolonged bleeding.',
    },
  },
  // EMERGENCY / KHẨN CẤP
  {
    keywords: ['emergency', 'khẩn cấp', 'cấp cứu', 'chảy máu', 'sưng', 'phù', 'gãy răng', 'break tooth', 'swollen', 'swelling'],
    answer: {
      vi: '⚠️ Tình huống cấp cứu cần đến phòng khám NGAY: Chảy máu không cầm được sau nhổ răng | Sưng mặt/khớp hàm (có thể nhiễm trùng lan rộng) | Gãy răng do chấn thương | Đau dữ dội không giảm sau khi uống thuốc. VinaMec có dịch vụ cấp cứu nha khoa. Gọi hotline hoặc đến trực tiếp trong giờ hành chính.',
      en: '⚠️ Emergency situations requiring immediate dental care: Uncontrolled bleeding after extraction | Facial/jaw swelling (possible spreading infection) | Broken tooth from trauma | Severe pain not relieved by medication. VinaMec has emergency dental services. Call hotline or visit during office hours.',
    },
  },
  // REGULAR CHECKUP / KIEM TRA DINH KY
  {
    keywords: ['checkup', 'check-up', 'khám định kỳ', 'răng miệng', 'tổng quát', 'examination', 'răng', 'dental', 'health'],
    answer: {
      vi: 'Bạn nên khám nha khoa định kỳ mỗi 6 tháng để: Phát hiện sớm sâu răng, bệnh nướu | Lấy cao răng (nên 6-12 tháng/lần) | Kiểm tra và đánh giá sức khỏe răng miệng tổng thể | Tư vấn chăm sóc răng cá nhân hóa. Khám định kỳ giúp tiết kiệm chi phí vì phát hiện sớm các vấn đề nhỏ trước khi trở nặng. Đặt lịch tại VinaMec ngay hôm nay!',
      en: 'You should have dental check-ups every 6 months to: Early detect cavities and gum disease | Get professional cleaning (every 6-12 months) | Overall oral health evaluation | Personalized oral care advice. Regular check-ups save money by catching small problems early. Book at VinaMec today!',
    },
  },
  // FOOD / THUC AN
  {
    keywords: ['food', 'eat', 'eating', 'thực phẩm', 'đồ ăn', 'ăn', 'uống', 'drink', 'diet', 'sugar', 'đường', 'bánh', 'kẹo', 'nước ngọt'],
    answer: {
      vi: 'Thực phẩm tốt cho răng: 🥛 Sữa, phô mai (cung cấp calcium) | 🥦 Rau xanh (fiber tự nhiên) | 🍎 Táo, cà rốt (làm sạch răng tự nhiên) | 🍵 Trà xanh (kháng khuẩn) | 🐟 Cá (phosphorus). Thực phẩm cần hạn chế: 🍬 Đồ ngọt, kẹo dẻo | 🥤 Nước có gas | ☕ Cà phê, trà đặc (gây ố răng). Sau khi ăn đồ ngọt, hãy đánh răng hoặc súc miệng bằng nước.',
      en: 'Good foods for teeth: 🥛 Milk, cheese (calcium) | 🥦 Leafy greens (natural fiber) | 🍎 Apples, carrots (natural cleaners) | 🍵 Green tea (antibacterial) | 🐟 Fish (phosphorus). Limit: 🍬 Candy, sticky sweets | 🥤 Soda | ☕ Coffee, dark tea (stains teeth). After sweets, brush or rinse with water.',
    },
  },
];

// Contextual responses based on conversation history
const CONTEXT_RESPONSES = {
  follow_up: {
    vi: 'Bạn có muốn tìm hiểu thêm về vấn đề này không? Hoặc tôi có thể giúp bạn đặt lịch khám tại VinaMec nếu bạn cần được bác sĩ khám trực tiếp.',
    en: 'Would you like to know more about this topic? I can also help you book an appointment at VinaMec if you need to see a dentist in person.',
  },
  appointment_prompt: {
    vi: 'Nếu bạn cần được khám và điều trị, hãy đặt lịch hẹn tại VinaMec. Chúng tôi có đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại.',
    en: 'If you need examination and treatment, book an appointment at VinaMec. We have experienced doctors and modern equipment.',
  },
};

function ruleBasedResponse(userMessage) {
  const lower = userMessage.toLowerCase().trim();
  const lang = detectLanguage(lower);

  // Check for greetings
  const greetingKeywords = ['xin chào', 'chào', 'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'tốt', 'tết', 'nam môi', 'chao'];
  for (const kw of greetingKeywords) {
    if (lower === kw || lower.startsWith(kw + ' ') || lower.startsWith(kw + ',')) {
      const greetings = lang === 'vi' ? GREETING_FAQ.vi : GREETING_FAQ.en;
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  }

  // Search FAQ database
  let bestMatch = null;
  let maxScore = 0;

  for (const faq of DENTAL_FAQ) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (lower.includes(kw)) {
        // Exact match scores higher
        score += kw.length;
        // Exact word match scores even higher
        const wordBoundaryRegex = new RegExp(`\\b${kw}\\b`, 'i');
        if (wordBoundaryRegex.test(lower)) {
          score += kw.length * 2;
        }
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && maxScore > 0) {
    const answer = bestMatch.answer[lang] || bestMatch.answer.en;
    // Add follow-up context if this is a real concern (not just casual question)
    const seriousKeywords = lang === 'vi'
      ? ['đau', 'sưng', 'chảy máu', 'khốn', 'nghiêm trọng', 'bệnh']
      : ['pain', 'swollen', 'bleeding', 'severe', 'emergency', 'disease'];
    const isConcern = seriousKeywords.some(k => lower.includes(k));
    if (isConcern) {
      return answer + '\n\n' + CONTEXT_RESPONSES.appointment_prompt[lang];
    }
    return answer + '\n\n' + CONTEXT_RESPONSES.follow_up[lang];
  }

  // No match - provide a helpful fallback
  const fallbacks = {
    vi: [
      `Cảm ơn bạn đã hỏi về "${userMessage}". Là trợ lý nha khoa AI, tôi chuyên tư vấn về: sức khỏe răng miệng, các dịch vụ nha khoa, và chăm sóc răng hàng ngày. Để được tư vấn chính xác nhất, bạn có thể hỏi cụ thể hơn về một vấn đề răng miệng, hoặc đặt lịch khám tại VinaMec để bác sĩ thăm khám trực tiếp.`,
      `Tôi hiểu bạn đang quan tâm đến "${userMessage}". Nếu đây là vấn đề liên quan đến răng miệng, hãy cho tôi biết thêm chi tiết. Nếu bạn cần được khám trực tiếp, VinaMec Dental Clinic luôn sẵn sàng hỗ trợ bạn!`,
    ],
    en: [
      `Thank you for your question about "${userMessage}". As a dental AI assistant, I specialize in: oral health, dental services, and daily dental care. For the most accurate advice, please ask a more specific question about a dental concern, or book an appointment at VinaMec to see a dentist in person.`,
      `I understand you're asking about "${userMessage}". If this is dental-related, please provide more details. If you need an in-person examination, VinaMec Dental Clinic is here to help!`,
    ],
  };

  const options = fallbacks[lang];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Public chatbot – no user context
 */
const publicChat = async (message, conversationHistory = []) => {
  const messages = [
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];
  const reply = await callAI(messages, DENTAL_SYSTEM_PROMPT);
  return reply;
};

/**
 * Private chatbot – with user/patient context
 */
const privateChat = async (message, conversationHistory = [], userContext = {}) => {
  const contextStr = buildContextString(userContext);
  const systemWithContext = PRIVATE_SYSTEM_PROMPT + (contextStr ? `\n\nPatient Context:\n${contextStr}` : '');

  const messages = [
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const reply = await callAI(messages, systemWithContext);
  return reply;
};

function buildContextString(context) {
  const parts = [];
  if (context.name) parts.push(`Patient Name: ${context.name}`);
  if (context.role) parts.push(`User Role: ${context.role}`);
  if (context.dentalScore) parts.push(`Dental Score: ${JSON.stringify(context.dentalScore)}`);
  if (context.recentDiagnosis) parts.push(`Recent Diagnosis: ${context.recentDiagnosis}`);
  return parts.join('\n');
}

/**
 * Basic image prediction (mock – integrate real ML model here)
 */
const predictImage = async (imagePath, imageType) => {
  // In production, integrate with a real ML API (Google Vision, custom model, etc.)
  const findings = [];
  const conditions = [
    'Possible cavity detected in upper molar region',
    'Mild tartar buildup visible',
    'Gum recession noted in lower front teeth',
    'Enamel erosion pattern detected',
    'Tooth appears healthy – no significant issues',
    'Crown integrity appears intact',
  ];

  const count = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < count; i++) {
    findings.push(conditions[Math.floor(Math.random() * conditions.length)]);
  }

  return {
    processed: true,
    findings: [...new Set(findings)],
    confidence: Math.round((0.6 + Math.random() * 0.35) * 100) / 100,
    processedAt: new Date(),
    recommendation: 'Please consult your dentist for a professional evaluation of these findings.',
  };
};

module.exports = { publicChat, privateChat, predictImage };