const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const handler = async (event) => {
  console.log('Scraping website...');
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      message: 'Scraped website',
    }),
  };
};

module.exports = { handler };
