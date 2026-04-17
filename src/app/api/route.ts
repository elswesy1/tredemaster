export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from "next/server";


export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}