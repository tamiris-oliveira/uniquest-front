const API_URL = process.env.NEXT_PUBLIC_API_URL

export const fetchData = async (endpoint) => {
  const res = await fetch(`${API_URL}/${endpoint}`);
  const data = await res.json();
  return data;
};

export const postData = async (endpoint, body) => {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data;
};
