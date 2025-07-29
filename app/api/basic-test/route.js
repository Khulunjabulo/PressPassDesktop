// import { NextResponse } from 'next/server';

// export async function GET() {
//   console.log('📨 Basic test endpoint called');
//   return NextResponse.json({
//     success: true,
//     message: 'Basic endpoint working',
//     timestamp: new Date().toISOString(),
//   });
// }

// export async function POST(req) {
//   console.log('📨 Basic POST test endpoint called');
//   try {
//     const body = await req.json();
//     console.log('📥 Request body:', body);
    
//     return NextResponse.json({
//       success: true,
//       message: 'Basic POST endpoint working',
//       receivedData: body,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error('❌ Error in basic test:', error);
//     return NextResponse.json({
//       success: false,
//       error: error.message,
//     }, { status: 500 });
//   }
// }