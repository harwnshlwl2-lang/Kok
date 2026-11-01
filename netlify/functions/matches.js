// netlify/functions/matches.js — وسيط يحمل المفتاح من متغير بيئة، فلا يظهر للزوار
exports.handler = async (event) => {
  const today = new Date().toISOString().slice(0, 10);
  const date = (event.queryStringParameters && event.queryStringParameters.date) || today;
  const json = { "Content-Type": "application/json" };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { statusCode: 400, headers: json, body: JSON.stringify({ error: "صيغة التاريخ يجب أن تكون YYYY-MM-DD" }) };
  }
  if (!process.env.OPENFOOT_API_KEY) {
    return { statusCode: 500, headers: json, body: JSON.stringify({ error: "المتغير OPENFOOT_API_KEY غير مضبوط في Netlify" }) };
  }

  try {
    const upstream = await fetch(`https://openfootapi.com/v1/matches?date=${date}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.OPENFOOT_API_KEY}`,
      },
    });
    const body = await upstream.text();
    return {
      statusCode: upstream.status,
      // تخزين مؤقت قصير لتوفير حصتك الشهرية
      headers: { ...json, "Cache-Control": "public, max-age=30" },
      body,
    };
  } catch (err) {
    return { statusCode: 502, headers: json, body: JSON.stringify({ error: "تعذر الاتصال بـ OpenFootAPI" }) };
  }
};
