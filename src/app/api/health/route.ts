import { NextResponse } from 'next/server';
import packageJson from '../../../../package.json';

export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    version: packageJson.version,
  });
}
