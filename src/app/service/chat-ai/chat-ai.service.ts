// chat-ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from '../const';

const API_URL = `${API_PATH}/deepseek`;

@Injectable({
  providedIn: 'root',
})
export class ChatAIService {
  constructor(private http: HttpClient) { }

  // Phương thức chính để xử lý file Word
  async processWordFile(text: string): Promise<any> {
    try {
      const textContent = text;
      const prompt = this.createPromptForQuiz(textContent);
      const response = await this.sendToAI(prompt).toPromise();
      console.log('FULL API RESPONSE:', response); // Debug Log

      const result = this.parseApiResponse(response);
      console.log('Kết quả sau parse:', result);

      return result;
    } catch (error) {
      console.error('Lỗi xử lý file:', error);
      throw error;
    }
  }

  // Tạo prompt yêu cầu định dạng pipe-delimited đơn giản
  private createPromptForQuiz(textContent: string): string {
    return `
    Bạn là một CHUYÊN GIA TẠO CÂU HỎI TRẮC NGHIỆM (Quiz Generator).
    NHIỆM VỤ: Dựa vào văn bản bên dưới, hãy tạo ra danh sách câu hỏi trắc nghiệm hoàn chỉnh.

    NỘI DUNG VĂN BẢN ĐẦU VÀO:
    """
    ${textContent}
    """

    YÊU CẦU QUAN TRỌNG (BẮT BUỘC):
    1. Trả về mỗi câu hỏi trên MỘT DÒNG DUY NHẤT.
    2. Các trường ngăn cách nhau bởi dấu gạch đứng (|).
    3. Định dạng:
       Content | nội dung đáp án A | nội dung đáp án B | nội dung đáp án C | nội dung đáp án D | Answer | Explanation

    QUY TẮC VÀNG (PHẢI TUÂN THỦ):
    - TỰ ĐỘNG TẠO ĐÁP ÁN NHIỄU: Nếu văn bản không cung cấp đủ 4 đáp án A/B/C/D, bạn PHẢI TỰ NGHĨ RA các đáp án sai (distractors) hợp lý để điền vào cho đủ 4 phương án.
    - KHÔNG ĐƯỢC ĐỂ TRỐNG bất kỳ cột nào (đặc biệt là cột A, B, C, D và Answer).
    - Cột 'Answer' CHỈ ĐƯỢC nhận giá trị: A, B, C, hoặc D.
    - Cột 'Explanation': Giải thích ngắn gọn tại sao đáp án đó đúng. Nếu không có thông tin, hãy tự giải thích theo kiến thức của bạn.
    - Nếu nội dung câu hỏi có xuống dòng, hãy thay thế bằng khoảng trắng.

    VÍ DỤ MẪU:
    1 + 1 bằng mấy? | 1 | 2 | 3 | 4 | B | Vì 1 cộng 1 bằng 2
    Từ "Xin chào" tiếng Trung là gì? | Ni Hao | Xie Xie | Zai Jian | Bu Ke Qi | A | "Ni Hao" nghĩa là Xin chào

    BẮT ĐẦU NGAY:
    `;
  }

  private sendToAI(prompt: string): Observable<any> {
    const payload = { message: prompt };
    return this.http.post(`${API_URL}/chat`, payload);
  }

  private parseApiResponse(response: any): any[] {
    try {
      let content = response.message || '';
      if (!content) throw new Error('API không trả về content');

      // 1. Clean up markdown code blocks if present
      content = content.replace(/```(?:text)?|```/g, '').trim();

      // 2. Split lines
      const lines = content.split(/\r?\n/);
      const questions = [];

      for (const line of lines) {
        let trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // --- RESCUE LOGIC START ---
        // Xử lý trường hợp AI quên dấu | và dính các đáp án vào nhau
        // Ví dụ: "péng yòuC. bǎng yǒuD. péng yǔ" -> "péng yòu | C. bǎng yǒu | D. péng yǔ"

        // 1. Thêm | trước A., B., C., D. nếu chưa có (và không phải ở đầu câu)
        // Regex: Tìm ký tự (không phải |) liền kề với [A-D].
        trimmedLine = trimmedLine.replace(/([^|])\s*([A-D]\.)/g, '$1 | $2');

        // --- RESCUE LOGIC END ---

        // 3. Split by delimiter (|)
        const parts = trimmedLine.split('|').map(p => {
          let val = p.trim();
          // Remove prefixes like "A.", "B.", "C." if present (do AI tự thêm vào)
          val = val.replace(/^[A-D]\.\s*/, '');
          return val;
        });

        // Kiểm tra đủ 7 phần (Content + 4 đáp án + 1 đúng + 1 giải thích)
        // Đôi khi giải thích có thể rỗng, nên châm chước >= 6 phần
        if (parts.length >= 6) {
          // Xóa số thứ tự ở đầu câu hỏi (ví dụ: "1. Hỏi..." -> "Hỏi...")
          let cleanContent = parts[0].replace(/^\d+[\.\)\s]+\s*/, '');

          const question = {
            content: cleanContent,
            a: parts[1],
            b: parts[2],
            c: parts[3],
            d: parts[4],
            answer: this.normalizeAnswer(parts[5]),
            explanation: parts[6] || ''
          };
          questions.push(question);
        } else {
          console.warn('Dòng không đúng định dạng (bỏ qua):', trimmedLine);
        }
      }

      if (questions.length === 0) {
        console.warn('Không trích xuất được câu hỏi nào từ:', content);
      }

      return questions;

    } catch (error) {
      console.error('Lỗi parse API response:', error);
      return [];
    }
  }

  private normalizeAnswer(ans: string): string {
    // Chỉ lấy A, B, C, D
    const match = ans.match(/[A-D]/i);
    return match ? match[0].toUpperCase() : '';
  }
}
