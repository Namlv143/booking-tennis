import { executeFullBookingProcess } from '@/lib/booking-service';
import { NextResponse } from 'next/server';

// Define runtime configuration for Edge Function
export const runtime = 'edge';

export async function POST(request: any) {
  console.log("request", request);
  const { currentToken } = await request.json();


  try {
    // 2. Gọi hàm dịch vụ (không cần truyền tham số nào khác ngoài headers)
    const finalConfirmation = await executeFullBookingProcess(currentToken);
    
    // 3. Trả về kết quả thành công cho client
    return NextResponse.json(finalConfirmation);

  } catch (error: any) {
    // 4. Bắt lỗi và trả về phản hồi lỗi
    console.error('[API_ROUTE_ERROR] Quy trình hardcoded thất bại:', error.message);
    return NextResponse.json(
      { message: 'Không thể hoàn tất quy trình đặt chỗ.', error: error },
      { status: 500 }
    );
  }
}