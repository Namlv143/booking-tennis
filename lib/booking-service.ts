const VHR_API_BASE_URL = 'https://vh.vinhomes.vn/api/vhr/utility/v0/utility';

// Pre-calculate timestamps when module loads
const BOOKING_TIME = getTomorrowAt830AM();
const FROM_TIME = generateFromTime(18, 1);

/**
 * Lấy timestamp cho ngày mai lúc 8:30 sáng theo múi giờ Việt Nam (UTC+7)
 * @returns {string} Timestamp cho 8:30 sáng ngày tiếp theo ở múi giờ Việt Nam
 */
function getTomorrowAt830AM(): string {
  // Tạo đối tượng date hiện tại
  const now = new Date();
  
  // Tính toán ngày mai
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Đặt thời gian là 8:30 sáng
  tomorrow.setHours(8, 30, 0, 0);
  
  // Trả về timestamp dưới dạng chuỗi
  return tomorrow.getTime().toString();
}

/**
 * Tạo timestamp cho một ngày cụ thể với giờ đề ra
 * @param {number} hour - Giờ trong ngày (0-23)
 * @param {number} daysToAdd - Số ngày thêm vào ngày hiện tại
 * @returns {number} Timestamp dưới dạng số
 */
function generateFromTime(hour: number, daysToAdd: number): number {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  targetDate.setHours(hour, 0, 0, 0);
  return targetDate.getTime();
}

/**
 * Hàm trợ giúp để gọi API và xử lý lỗi.
 */
async function apiFetch(url: any, options: any, stepName: any): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Lỗi tại bước [${stepName}] với status ${response.status}: ${errorBody}`);
    throw new Error(`Bước '${stepName}' thất bại.`);
  }
  return response.json();
}

// --- Các hàm API với tham số được hardcode bên trong ---

async function fetchBookingTimes(headers: any) {
  const bookingDate = BOOKING_TIME;
  const url = `${VHR_API_BASE_URL}/75/booking-time?bookingDate=${bookingDate}`;
  console.log(`[1/5] Đang lấy khung giờ...`);
  return apiFetch(url, { headers }, 'fetchBookingTimes');
}

async function fetchClassifies(headers: any) {
  const timeConstraintId = '575';
  const fromTime = FROM_TIME; // Using pre-calculated value
  const url = `${VHR_API_BASE_URL}/75/classifies?timeConstraintId=${timeConstraintId}&monthlyTicket=false&fromTime=${fromTime}`;
  console.log(`[2/5] Đang lấy loại sân...`);
  return apiFetch(url, { headers }, 'fetchClassifies');
}

async function fetchPlaces(headers: any) {
  const classifyId = '118';
  const timeConstraintId = '575';
  const fromTime = FROM_TIME; // Using pre-calculated value
  const url = `${VHR_API_BASE_URL}/75/places?classifyId=${classifyId}&timeConstraintId=${timeConstraintId}&monthlyTicket=false&fromTime=${fromTime}`;
  console.log(`[3/5] Đang lấy sân...`);
  return apiFetch(url, { headers }, 'fetchPlaces');
}

async function fetchTicketInfo(headers: any) {
  const bookingDate = BOOKING_TIME;
  const placeUtilityId = '626';
  const timeConstraintId = '575';
  const url = `${VHR_API_BASE_URL}/ticket-info?bookingDate=${bookingDate}&placeUtilityId=${placeUtilityId}&timeConstraintId=${timeConstraintId}`;
  console.log(`[4/5] Đang lấy thông tin vé...`);
  return apiFetch(url, { headers }, 'fetchTicketInfo');
}

async function confirmBooking(headers: any) {
  // Giả sử đây là endpoint cuối cùng để xác nhận (POST)
  const url = `https://vh.vinhomes.vn/api/vhr/utility/v0/customer-utility/booking`; 
   // Ensure POST request has the appropriate accept-encoding header
   headers = {...headers, "accept-encoding": "gzip deflate br", conection: "keep-alive"}
  // Payload được tạo từ các giá trị hardcoded
  const hardcodedPayload : any = {
    bookingRequests: [{
      bookingDate: BOOKING_TIME,
      placeId: 801,
      timeConstraintId: 575,
      utilityId: 75,
      residentTicket: 4,
      residentChildTicket: null, guestTicket: null, guestChildTicket: null,
    }],
    paymentMethod: null, vinClubPoint: null, deviceType: "ANDROID",
  }
  const generateChecksum = async (payload: any) => {
    const booking = payload.bookingRequests[0];
    const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId;
    const interpolatedString = `${numericSum}tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@`;
    const encoder = new TextEncoder();
    const data = encoder.encode(interpolatedString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  hardcodedPayload.cs = await generateChecksum(hardcodedPayload);
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(hardcodedPayload),
    cache: 'no-store',
    credentials: 'omit',
    mode: 'cors',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  };
  
  console.log(`[5/5] Đang gửi yêu cầu xác nhận đặt chỗ...`);
  return apiFetch(new URL('/api/vhr/utility/v0/customer-utility/booking', 'https://vh.vinhomes.vn'), options, 'confirmBooking');
}


// --- Hàm điều phối chính (không có tham số) ---

/**
 * Tạo headers chuẩn cho API request
 * @param {string} jwtToken - Token xác thực của người dùng
 * @param {boolean} isPost - Có phải là POST request không
 * @returns {object} Headers cho API request
 */
function createHeaders(jwtToken: string, isPost: boolean = false) {
  return {
    "user-agent": "Dart/3.7 (dart:io)",
    "app-version-name": "1.5.5",
    "device-inf": "PHY110 OPPO 35",
    "accept-language": "vi",
    "x-vinhome-token": jwtToken,
    "device-id": "51a9e0d3fcb8574c",
    "host": "vh.vinhomes.vn",
    "content-type": "application/json; charset=UTF-8",
    "accept-encoding": isPost ? "gzip deflate br" : "gzip",
  };
}

/**
 * Thực thi toàn bộ quy trình 5 bước với các giá trị hardcoded.
 * @param {string} jwtToken - Token xác thực của người dùng.
 * @returns {Promise<any>} Kết quả xác nhận từ bước cuối cùng.
 */
export async function executeFullBookingProcess(jwtToken: string) {
  console.log('Bắt đầu quy trình 5 bước hardcoded trên server...');
  
  const headers = createHeaders(jwtToken, false);

  // Tuần tự gọi các API GET
  await fetchBookingTimes(headers);
  await fetchClassifies(headers);
  await fetchPlaces(headers);
  await fetchTicketInfo(headers);

  // Gọi API POST cuối cùng và trả về kết quả
  const finalConfirmation = await confirmBooking(headers);

  console.log('✅ Hoàn tất quy trình hardcoded!');
  return finalConfirmation;
}