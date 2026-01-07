import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Question } from '../../../../model/question';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import * as docx from 'docx';
import { ChatAIService } from '../../../../service/chat-ai/chat-ai.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css'],
})
export class AddQuestionComponent implements OnInit {
  form: FormGroup;
  selectedTab = 0;

  // File upload
  selectedFile: File | null = null;
  isDragOver = false;
  previewQuestions: Question[] = [];
  extractedText: string = '';
  isProcessing = false;
  supportedFileTypes = '.docx,.doc,.xlsx,.xls';

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddQuestionComponent>,
    private chatAIService: ChatAIService
  ) {
    this.form = this.fb.group({
      content: ['', Validators.required],
      a: ['', Validators.required],
      b: ['', Validators.required],
      c: ['', Validators.required],
      d: ['', Validators.required],
      answer: ['A', Validators.required],
      explanation: [''],
      imageUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
    });
  }

  ngOnInit(): void { }

  // ... (previous tab 1 methods)

  // ... (previous downloadTemplate methods)

  // ... (previous drag and drop methods)

  removeFile() {
    this.selectedFile = null;
    this.previewQuestions = [];
    this.extractedText = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  clearPreview() {
    this.previewQuestions = [];
    this.selectedFile = null;
    this.extractedText = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }



  // ===== TAB 1: Manual Input =====
  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.selectedTab === 0) {
      // Tab 1: Manual input
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
      const value: Question = this.form.value;
      this.dialogRef.close(value);
    } else {
      // Tab 2: File upload
      if (this.previewQuestions.length === 0) {
        return;
      }
      this.dialogRef.close(this.previewQuestions);
    }
  }

  // ===== TAB 2: File Upload =====

  downloadTemplate() {
    // Tạo cả 2 loại template: Word và Excel
    this.showTemplateOptions();
  }

  showTemplateOptions() {
    Swal.fire({
      title: 'Chọn loại file mẫu',
      text: 'Bạn muốn tải file mẫu định dạng nào?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'File Excel (.xlsx)',
      denyButtonText: 'File Word (.doc)',
      cancelButtonText: 'Thoát',
      confirmButtonColor: '#1d6f42', // Excel green
      denyButtonColor: '#2b579a', // Word blue
      didOpen: () => {
        // Fix z-index issue ensuring alert is on top of material dialog
        const container = document.querySelector('.swal2-container') as HTMLElement;
        if (container) {
          container.style.zIndex = '100000';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadExcelTemplate();
      } else if (result.isDenied) {
        this.downloadWordTemplate();
      }
    });
  }

  downloadWordTemplate() {
    // Generate valid .docx file using docx library
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "CAU HOI TRAC NGHIEM TIENG TRUNG - MAU FILE WORD",
              heading: HeadingLevel.HEADING_1,
              alignment: docx.AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "1. Phien am cua tu abc la gi:",
                  bold: true,
                }),
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({ text: "A. dap an a" }),
            new Paragraph({ text: "B. dap an b" }),
            new Paragraph({ text: "C. dap an c" }),
            new Paragraph({ text: "D. dap an d" }),
            new Paragraph({ text: "" }), // Empty line

            new Paragraph({
              children: [
                new TextRun({
                  text: "2. Cau hoi thu 2:",
                  bold: true,
                }),
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({ text: "A. A" }),
            new Paragraph({ text: "B. B" }),
            new Paragraph({ text: "C. C" }),
            new Paragraph({ text: "D. D" }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_cau_hoi_tieng_trung.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  downloadExcelTemplate() {
    // Tạo dữ liệu mẫu cho Excel
    const sampleData = [
      {
        'Nội dung câu hỏi': 'Phiên âm của từ 你好 là gì？',
        'Đáp án A': 'nihao',
        'Đáp án B': 'nǐhao',
        'Đáp án C': 'nǐhǎo',
        'Đáp án D': 'níhǎo',
        'Đáp án đúng': 'C',
        'Giải thích': '你好 có phiên âm là nǐhǎo (thanh 3 + thanh 3)',
        'Hình ảnh (URL)': '',
      },
      {
        'Nội dung câu hỏi': 'Từ này sử dụng những thanh nào 学校（xuéxiào）？',
        'Đáp án A': 'Thanh 1 và thanh 2',
        'Đáp án B': 'Thanh 2 và thanh 4',
        'Đáp án C': 'Thanh 3 và thanh 1',
        'Đáp án D': 'Thanh 4 và thanh 1',
        'Đáp án đúng': 'B',
        'Giải thích': '学校 (xuéxiào) có thanh 2 và thanh 4',
        'Hình ảnh (URL)': '',
      },
      {
        'Nội dung câu hỏi': 'Nghĩa của từ 谢谢 là gì？',
        'Đáp án A': 'Xin chào',
        'Đáp án B': 'Cảm ơn',
        'Đáp án C': 'Tạm biệt',
        'Đáp án D': 'Xin lỗi',
        'Đáp án đúng': 'B',
        'Giải thích': '谢谢 có nghĩa là cảm ơn',
        'Hình ảnh (URL)': '',
      },
    ];

    // Tạo worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(sampleData, {
      header: [
        'Nội dung câu hỏi',
        'Đáp án A',
        'Đáp án B',
        'Đáp án C',
        'Đáp án D',
        'Đáp án đúng',
        'Giải thích',
        'Hình ảnh (URL)',
      ],
    });

    // Tạo workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Câu hỏi mẫu');

    // Thêm sheet hướng dẫn
    const guideData = [
      ['HƯỚNG DẪN SỬ DỤNG TEMPLATE EXCEL'],
      [''],
      ['1. Cột bắt buộc:'],
      ['- Nội dung câu hỏi: Nội dung chính của câu hỏi'],
      ['- Đáp án A, B, C, D: 4 lựa chọn'],
      ['- Đáp án đúng: Nhập A, B, C hoặc D(viết thường cùng được'],
      [''],
      ['2. Cột tùy chọn:'],
      ['- Giải thích: Giải thích tại sao đáp án đúng'],
      ['- Hình ảnh (URL): Link ảnh (bắt đầu bằng http:// hoặc https://)'],
      [''],
      ['3. Lưu ý:'],
      ['- Không xóa hoặc thay đổi tên cột'],
      ['- Đảm bảo đáp án đúng là A, B, C hoặc D'],
      ['- Có thể thêm nhiều dòng để thêm câu hỏi'],
    ];

    const wsGuide: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(guideData);
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Hướng dẫn');

    // Xuất file Excel
    XLSX.writeFile(wb, 'cau_hoi_tieng_trung_mau.xlsx');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  async handleFile(file: File) {
    // Kiểm tra định dạng file
    const fileExt = file.name.toLowerCase();
    const isWordFile = fileExt.endsWith('.docx') || fileExt.endsWith('.doc');
    const isExcelFile = fileExt.endsWith('.xlsx') || fileExt.endsWith('.xls');

    if (!isWordFile && !isExcelFile) {
      alert('Vui lòng chọn file Word (.docx/.doc) hoặc Excel (.xlsx/.xls)');
      return;
    }

    this.selectedFile = file;
    this.isProcessing = true;
    this.previewQuestions = [];
    this.extractedText = '';

    try {
      if (isWordFile) {
        await this.processWordFile(file);
      } else if (isExcelFile) {
        await this.processExcelFile(file);
      }
    } catch (error) {
      console.error('Lỗi xử lý file:', error);
      alert('Lỗi khi xử lý file');
    } finally {
      this.isProcessing = false;
    }
  }

  private async processWordFile(file: File) {
    // Đọc file Word bằng mammoth
    const arrayBuffer = await this.readFileAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer });
    const textContent = result.value;
    this.extractedText = textContent;

    // Gọi AI để phân tích text Word
    await this.processWithAI();
  }

  private async processExcelFile(file: File) {
    const arrayBuffer = await this.readFileAsArrayBuffer(file);

    // Đọc file Excel bằng XLSX
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Lấy sheet đầu tiên
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Chuyển đổi sang JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (data.length <= 1) {
      alert('File Excel không có dữ liệu hoặc chỉ có tiêu đề');
      return;
    }

    // Lấy header (dòng đầu tiên)
    const headers = data[0].map((h: any) => String(h).trim().toLowerCase());

    // Tìm index của các cột cần thiết
    const contentIndex = this.findColumnIndex(headers, [
      'nội dung',
      'câu hỏi',
      'content',
      'question',
    ]);
    const aIndex = this.findColumnIndex(headers, ['đáp án a', 'a', 'answer a']);
    const bIndex = this.findColumnIndex(headers, ['đáp án b', 'b', 'answer b']);
    const cIndex = this.findColumnIndex(headers, ['đáp án c', 'c', 'answer c']);
    const dIndex = this.findColumnIndex(headers, ['đáp án d', 'd', 'answer d']);
    const answerIndex = this.findColumnIndex(headers, [
      'đáp án đúng',
      'correct',
      'answer',
    ]);
    const explanationIndex = this.findColumnIndex(headers, [
      'giải thích',
      'explanation',
    ]);
    const imageUrlIndex = this.findColumnIndex(headers, [
      'hình ảnh',
      'image',
      'url',
    ]);

    // Kiểm tra các cột bắt buộc
    if (
      contentIndex === -1 ||
      aIndex === -1 ||
      bIndex === -1 ||
      cIndex === -1 ||
      dIndex === -1 ||
      answerIndex === -1
    ) {
      alert('File Excel thiếu các cột bắt buộc. Vui lòng sử dụng file mẫu.');
      return;
    }

    // Xử lý từng dòng dữ liệu (bắt đầu từ dòng 1, bỏ qua header)
    const questions: Question[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      // console.log('Dòng dữ liệu:', row);

      // Lấy giá trị từ các cột
      const content = row[0] ? String(row[0]).trim() : '';
      const answerA = row[1] ? String(row[1]).trim() : '';
      const answerB = row[2] ? String(row[2]).trim() : '';
      const answerC = row[3] ? String(row[3]).trim() : '';
      const answerD = row[4] ? String(row[4]).trim() : '';
      const correctAnswer = row[5] ? String(row[5]).trim().toUpperCase() : '';
      const explanation =
        explanationIndex !== -1 && row[6] ? String(row[6]).trim() : '';
      const imageUrl =
        imageUrlIndex !== -1 && row[7] ? String(row[7]).trim() : '';

      // Kiểm tra dữ liệu hợp lệ
      if (
        !content ||
        !answerA ||
        !answerB ||
        !answerC ||
        !answerD ||
        !correctAnswer
      ) {
        console.warn(`Dòng ${i + 1} thiếu dữ liệu bắt buộc, bỏ qua`);
        continue;
      }

      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        console.warn(
          `Dòng ${i + 1}: Đáp án đúng không hợp lệ: ${correctAnswer}`
        );
        continue;
      }

      // Tạo đối tượng Question
      const question: Question = {
        content,
        a: answerA,
        b: answerB,
        c: answerC,
        d: answerD,
        answer: correctAnswer,
        explanation: explanation || undefined,
        image_url: imageUrl || undefined,
        quizId: 0, // Sẽ được set sau
      };

      questions.push(question);
    }

    this.previewQuestions = questions;

    // Hiển thị kết quả
    if (questions.length <= 0) {
      alert('Không tìm thấy câu hỏi hợp lệ trong file Excel');
    }
  }

  private findColumnIndex(headers: string[], searchTerms: string[]): number {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      for (const term of searchTerms) {
        if (header.includes(term)) {
          return i;
        }
      }
    }
    return -1;
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async processWithAI() {
    if (!this.selectedFile || !this.extractedText) {
      alert('Vui lòng chọn file Word trước!');
      return;
    }

    this.isProcessing = true;

    try {
      // Gọi API ChatAI để phân tích
      const result = await this.chatAIService.processWordFile(
        this.extractedText
      );

      this.previewQuestions = result;
    } catch (error) {
      console.error('Lỗi xử lý AI:', error);
      alert('Lỗi khi xử lý với AI');
    } finally {
      this.isProcessing = false;
    }
  }



  removePreviewItem(index: number) {
    this.previewQuestions.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
