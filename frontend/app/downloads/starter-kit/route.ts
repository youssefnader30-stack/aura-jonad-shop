import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect('https://aura-jonad.com/downloads/starter-kit.zip', 302);
}
