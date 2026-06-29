const CPANEL_HOSTNAME = process.env.CPANEL_HOSTNAME;
const CPANEL_USERNAME = process.env.CPANEL_USERNAME;
const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;

// Bypass strict SSL verification for cPanel API (fixes 'fetch failed' due to self-signed certs)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function cpanelApi(module: string, func: string, params: Record<string, string>) {
  if (!CPANEL_HOSTNAME || !CPANEL_USERNAME || !CPANEL_API_TOKEN) {
    throw new Error('Missing cPanel credentials');
  }

  const url = new URL(`https://${CPANEL_HOSTNAME}:2083/execute/${module}/${func}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN}`
    },
    // We disable cache to ensure we get fresh data from cPanel
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error(`cPanel API HTTP error: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.errors && data.errors.length > 0) {
    throw new Error(`cPanel API error: ${data.errors.join(', ')}`);
  }
  
  return data;
}

export async function addRedirect(domain: string, src: string, dest: string) {
  return cpanelApi('Mime', 'add_redirect', {
    domain,
    src: src.startsWith('/') ? src : `/${src}`,
    redirect: dest,
    type: 'permanent',
    matchwww: '2', // 2 = All (www and non-www)
  });
}

export async function deleteRedirect(domain: string, src: string) {
  return cpanelApi('Mime', 'delete_redirect', {
    domain,
    src: src.startsWith('/') ? src : `/${src}`,
    matchwww: '2',
  });
}

export async function listRedirects() {
  return cpanelApi('Mime', 'list_redirects', {});
}
