'use server';


export async function checkOpenAIKey(): Promise<{
  connected: boolean;
  message: string;
  source: 'env' | 'missing';
}> {
  // 1. Check Env
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey && envKey.startsWith('sk-')) {
     return {
         connected: true,
         message: 'Key detected in environment (Server-Side)',
         source: 'env'
     };
  }

  // 2. (Optional) Check cookie (We don't strictly support cookie keys for BYOK in production for safety, but if debugging...)
  // Skip cookie check to enforce env var preference.
  
  return {
    connected: false,
    message: 'No valid OPENAI_API_KEY found in environment variables',
    source: 'missing'
  };
}
