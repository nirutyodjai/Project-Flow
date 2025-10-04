/**
 * ทดสอบ Multi-Edit กับ Fetch Code
 * มี fetch ซ้ำกัน 10 ครั้ง
 */

// Fetch 1
export async function fetchNewData1() {
  const newUrl = 'https://new-api.example.com/data1';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 2
export async function fetchNewData2() {
  const newUrl = 'https://new-api.example.com/data2';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 3
export async function fetchNewData3() {
  const newUrl = 'https://new-api.example.com/data3';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 4
export async function fetchNewData4() {
  const newUrl = 'https://new-api.example.com/data4';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 5
export async function fetchNewData5() {
  const newUrl = 'https://new-api.example.com/data5';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 6
export async function fetchNewData6() {
  const newUrl = 'https://new-api.example.com/data6';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 7
export async function fetchNewData7() {
  const newUrl = 'https://new-api.example.com/data7';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 8
export async function fetchNewData8() {
  const newUrl = 'https://new-api.example.com/data8';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 9
export async function fetchNewData9() {
  const newUrl = 'https://new-api.example.com/data9';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Fetch 10
export async function fetchNewData10() {
  const newUrl = 'https://new-api.example.com/data10';
  const newTimeout = 10000;
  const newMethod = 'GET';
  
  const response = await fetch(newUrl, {
    method: newMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer new-token-xyz-789',
    },
    signal: AbortSignal.timeout(newTimeout),
  });
  
  return response.json();
}

// Constants
const NEW_BASE_URL = 'https://new-api.example.com';
const NEW_API_VERSION = 'v2';
const NEW_AUTH_TOKEN = 'new-token-xyz-789';
const NEW_TIMEOUT_MS = 10000;
const NEW_RETRY_COUNT = 3;
const NEW_CACHE_TIME = 7200;
const NEW_MAX_RESULTS = 10;
const NEW_PAGE_SIZE = 20;
const NEW_SORT_ORDER = 'desc';
const NEW_FILTER_TYPE = 'all';

console.log('NEW_BASE_URL:', NEW_BASE_URL);
console.log('NEW_API_VERSION:', NEW_API_VERSION);
console.log('NEW_AUTH_TOKEN:', NEW_AUTH_TOKEN);
