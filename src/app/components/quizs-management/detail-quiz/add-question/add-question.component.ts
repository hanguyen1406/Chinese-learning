import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Question } from '../../../../model/question';
import * as mammoth from 'mammoth';
import { DeepSeekService } from '../../../../service/deepseek/deep-seek.service';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css'],
})
export class AddQuestionComponent implements OnInit {
  form: FormGroup;
  selectedTab = 0;

  // Word upload
  selectedFile: File | null = null;
  isDragOver = false;
  previewQuestions: Question[] = [];
  extractedText: string = '';
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddQuestionComponent>,
    private deepSeekService: DeepSeekService
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

  ngOnInit(): void {}

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
      // Tab 2: Word upload
      if (this.previewQuestions.length === 0) {
        return;
      }
      this.dialogRef.close(this.previewQuestions);
    }
  }

  // ===== TAB 2: Word Upload =====

  downloadTemplate() {
    const templateContent = `CÂU HỎI TRẮC NGHIỆM TIẾNG TRUNG - MẪU FILE WORD

Hãy nhập câu hỏi theo định dạng sau:

1. Phiên âm của từ 你好 là gì：
A．nihao
B．nǐhao
C．nǐhǎo
D．níhǎo

2. Từ này sử dụng những thanh nào 学校（xuéxiào）：
A．Thanh 1 và thanh 2
B．Thanh 2 và thanh 4
C．Thanh 3 và thanh 1
D．Thanh 4 và thanh 1 
`;

    // Tạo file Word ảo và tải xuống
    const blob = new Blob([templateContent], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cau_hoi_tieng_trung_mau.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      alert('Vui lòng chọn file Word (.docx hoặc .doc)');
      return;
    }

    this.selectedFile = file;
    this.isProcessing = true;
    this.previewQuestions = [];
    this.extractedText = '';

    try {
      // 1. Đọc file Word bằng mammoth
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const result = await mammoth.extractRawText({ arrayBuffer });
      const textContent = result.value;
      this.extractedText = textContent;

      // console.log('Text đã trích xuất:', textContent);
      // 2. Gọi service DeepSeek để phân tích
      const analysisResult = await this.processWithAI();
     
    } catch (error) {
      console.error('Lỗi xử lý file Word:', error);
      alert('Lỗi khi xử lý file Word');
    } finally {
      this.isProcessing = false;
    }
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
      // Gọi API DeepSeek để phân tích
      // TODO: Gọi service DeepSeek ở đây
      const result = await this.deepSeekService.processWordFile(this.extractedText);

      // Tạm thời hiển thị thông báo
      alert(
        'Tính năng AI đang được phát triển. Hiện tại đang sử dụng phân tích cơ bản.'
      );
    } catch (error) {
      console.error('Lỗi xử lý AI:', error);
      alert('Lỗi khi xử lý với AI');
    } finally {
      this.isProcessing = false;
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.previewQuestions = [];
    this.extractedText = '';
  }

  clearPreview() {
    this.previewQuestions = [];
    this.selectedFile = null;
    this.extractedText = '';
  }

  removePreviewItem(index: number) {
    this.previewQuestions.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Hiển thị text đã trích xuất
  showExtractedText() {
    if (this.extractedText) {
      alert(
        `Nội dung đã trích xuất:\n\n${this.extractedText.substring(0, 1000)}${
          this.extractedText.length > 1000 ? '...' : ''
        }`
      );
    }
  }
}
