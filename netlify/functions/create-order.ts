import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const body = JSON.parse(event.body || '{}');

  console.log('ORDER RECEIVED:', body);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
