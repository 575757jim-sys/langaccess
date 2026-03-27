exports.handler = async function(event) {
  try {
    const { ref_code } = JSON.parse(event.body);

    const url = `${process.env.SUPABASE_URL}/rest/v1/ambassadors?ref_code=eq.${ref_code.toUpperCase()}&select=*&limit=1`;

    const response = await fetch(url, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ found: false })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ found: true, ambassador: data[0] })
    };

  } catch(e) {
    return {
      statusCode: 200,
      body: JSON.stringify({ found: false, error: e.message })
    };
  }
}
