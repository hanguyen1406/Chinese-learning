// deepseek.service.ts - SỬA ĐỔI
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from '../const';
const API_URL = `${API_PATH}/deepseek`;
@Injectable({
  providedIn: 'root'
})
export class DeepSeekService {

  constructor(private http: HttpClient) { }

  // Phương thức chính để xử lý file Word
  async processWordFile(text: string): Promise<any> {
    try {
      const textContent = text;
      // console.log('Nội dung đã trích xuất:', textContent);

      // 2. Tạo prompt như yêu cầu
      const prompt = this.createPromptForQuiz(textContent);
      // console.log('Prompt gửi đi:', prompt);

      // 3. Gửi lên DeepSeek API
      const response = await this.sendToDeepSeek(prompt).toPromise();
      
      // 4. Parse kết quả
      const result = this.parseApiResponse(response);
      // console.log('Kết quả trả về từ API:', result);
      
      return result;
      
    } catch (error) {
      console.error('Lỗi xử lý file:', error);
      throw error;
    }
  }

  // Tạo prompt như anh đã cung cấp
  private createPromptForQuiz(textContent: string): string {
    return `Tôi có nội dung bài tập trắc nghiệm tiếng Trung từ file Word. 
    Hãy phân tích và trả về JSON với mảng các câu hỏi có định dạng:

    [
      {
        "content": "Nội dung câu hỏi",
        "a": "Đáp án A",
        "b": "Đáp án B", 
        "c": "Đáp án C",
        "d": "Đáp án D",
        "answer": "a/b/c/d",
        "explanation": "Giải thích chi tiết đáp án"
      }
    ]

    YÊU CẦU QUAN TRỌNG:
    1. Chỉ trả về duy nhất JSON, không thêm bất kỳ text nào khác
    2. JSON phải đúng cú pháp, nếu từ tiếng trung sai thì sửa làm sao phải ra được JSON
    3. Đảm bảo answer chỉ là 'a', 'b', 'c', hoặc 'd'
    4. Explanation phải chi tiết, giải thích rõ tại sao đáp án đó đúng

    Nội dung file Word:

    ${textContent}

    Hãy phân tích và trả về JSON theo đúng định dạng trên.`;
  }

  // Gửi request lên DeepSeek API
  private sendToDeepSeek(prompt: string): Observable<any> {

    const payload = {
      message: prompt
    };

    // console.log('Gửi request đến DeepSeek API với payload:', payload);
    
    return this.http.post(`${API_URL}/chat`, payload);
  }

  // Parse response từ API
  private parseApiResponse(response: any): any {
    try {
      // console.log('Raw API response:', response);
      
      // Lấy content từ response
      const content = response.message;
      
      if (!content) {
        throw new Error('API không trả về content');
      }

      // console.log('API content:', content);

      // Cố gắng parse JSON
      // Có thể API trả về text chứa JSON, cần extract
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Thử parse toàn bộ content
        return JSON.parse(content);
      }
      
    } catch (error) {
      console.error('Lỗi parse API response:', error);
      // console.log('Raw content để debug:', response.choices[0]?.message?.content);
      
      // Fallback: Trả về mảng rỗng
      return [];
    }
  }

}