import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file-service.service';
import { UserService } from '../../services/user-service.service';
import { AuthService } from '../../services/auth-service.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { FileDocument } from '../../services/models';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {
  isLoggedIn: boolean = false;
  files: FileDocument[] = [];
  filteredFiles: FileDocument[] = [];
  loading = true;
  errorMessage = '';

  searchKeyword: string = '';
  selectedFileType: string = '';
  searchAuthor: string = '';
  searchRanking: string = '';

  isModalOpen: boolean = false;
  selectedFile: File | null = null;
  affiliationsInput: string = '';
  authorsInput: string = '';
  keywordsInput: string = '';
  fileTypeOptions: string[] = [];
  customFileType: string = '';

  newFile: Partial<FileDocument> = {
    id: '',
    title: '',
    authors: [],
    affiliations: [],
    keywords: [],
    publicationDate: new Date().toISOString().split('T')[0],
    abstractText: '',
    doi: '',
    fileType: '',
    ranking: '' // Added for classification
  };

  constructor(
    private fileService: FileService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchFiles();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadFileTypes();
  }

  loadFileTypes(): void {
    this.fileService.getFileTypes().subscribe({
      next: (types) => {
        this.fileTypeOptions = types;
      },
      error: (err) => {
        console.error('Failed to load file types:', err);
        this.fileTypeOptions = ['dataset', 'certification', 'research paper', 'report'];
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
  }

  fetchFiles(): void {
    this.loading = true;
    this.errorMessage = '';
    this.fileService.getAllFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.filteredFiles = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load files:', err);
        this.errorMessage = err.status === 0
          ? 'Unable to connect to the server. Please check if the backend is running.'
          : `Failed to load files: ${err.message}`;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loading = true;
    this.errorMessage = '';

    const searchByKeyword$ = this.searchKeyword
      ? this.fileService.findByKeyword(this.searchKeyword)
      : of(this.files);

    const searchByType$ = this.selectedFileType
      ? this.fileService.findByType(this.selectedFileType)
      : of(this.files);

    const searchByAuthor$ = this.searchAuthor
      ? this.fileService.findByAuthor(this.searchAuthor)
      : of(this.files);

    const searchByRank$ = this.searchRanking
      ? this.fileService.findByRank(this.searchRanking)
      : of(this.files);

    forkJoin([searchByKeyword$, searchByType$, searchByAuthor$, searchByRank$])
      .pipe(
        catchError(err => {
          this.errorMessage = 'Search failed.';
          this.loading = false;
          return of([[], [], [], []]);
        })
      )
      .subscribe(([keywordFiles, typeFiles, authorFiles, rankFiles]) => {
        let finalFiles = this.files;

        if (this.searchKeyword) {
          finalFiles = finalFiles.filter(file => keywordFiles.some(f => f.id === file.id));
        }
        if (this.selectedFileType) {
          finalFiles = finalFiles.filter(file => typeFiles.some(f => f.id === file.id));
        }
        if (this.searchAuthor) {
          finalFiles = finalFiles.filter(file => authorFiles.some(f => f.id === file.id));
        }
        if (this.searchRanking) {
          finalFiles = finalFiles.filter(file => rankFiles.some(f => f.id === file.id));
        }

        this.filteredFiles = finalFiles;
        this.loading = false;

        if (this.filteredFiles.length === 0) {
          this.errorMessage = 'No files found matching your criteria.';
        } else {
          this.errorMessage = '';
        }
      });

    if (!this.searchKeyword && !this.selectedFileType && !this.searchAuthor && !this.searchRanking) {
      this.filteredFiles = this.files;
      this.errorMessage = '';
      this.loading = false;
    }
  }

  openModal(): void {
    if (!this.isLoggedIn) {
      this.errorMessage = 'Please log in to upload a file.';
      return;
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedFile = null;
    this.affiliationsInput = '';
    this.authorsInput = '';
    this.keywordsInput = '';
    this.selectedFileType = '';
    this.customFileType = '';
    this.newFile = {
      id: '',
      title: '',
      authors: [],
      affiliations: [],
      keywords: [],
      publicationDate: new Date().toISOString().split('T')[0],
      abstractText: '',
      doi: '',
      fileType: '',
      ranking: '' // Reset classification
    };
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file to upload.';
      return;
    }

    const user = this.userService.getCurrentUser();
    if (!user?.email) {
      this.errorMessage = 'User email not found. Please log in.';
      return;
    }

    const fileType = this.selectedFileType === 'custom' ? this.customFileType : this.selectedFileType;
    if (!fileType) {
      this.errorMessage = 'Please select or enter a file type.';
      return;
    }

    const fileToSubmit: Partial<FileDocument> = {
      title: this.newFile.title,
      authors: this.authorsInput ? this.authorsInput.split(',').map(a => a.trim()).filter(a => a) : [],
      affiliations: this.affiliationsInput ? this.affiliationsInput.split(',').map(a => a.trim()).filter(a => a) : [],
      keywords: this.keywordsInput ? this.keywordsInput.split(',').map(k => k.trim()).filter(k => k) : [],
      publicationDate: this.newFile.publicationDate,
      abstractText: this.newFile.abstractText,
      doi: this.newFile.doi,
      fileType: fileType,
      ranking: this.newFile.ranking // Include classification
    };

    this.fileService.uploadFile(user.email, this.selectedFile, fileToSubmit).subscribe({
      next: (updatedUser) => {
        const newFile = updatedUser.uploads[updatedUser.uploads.length - 1];
        if (newFile) {
          this.files.push(newFile);
          this.filteredFiles.push(newFile);
          if (this.selectedFileType === 'custom' && this.customFileType) {
            this.loadFileTypes();
          }
        }
        this.closeModal();
        this.fetchFiles();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to upload file:', err);
        if (err.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check if the backend is running and CORS is configured.';
        } else if (err.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        } else if (err.status === 404) {
          this.errorMessage = 'The file upload endpoint was not found. Please check the backend configuration.';
        } else {
          this.errorMessage = `Failed to upload file: ${err.message}`;
        }
      }
    });
  }

  fileAction(action: string, id: string | undefined): void {
    if (action === 'Download' && id) {
      this.fileService.getFileById(id).subscribe({
        next: (file) => {
          console.log('FileDocument:', file);
          if (!file.filename) {
            // Fallback: Generate filename from title and fileType
            if (file.title && file.fileType) {
              file.filename = `${file.title.replace(/[^a-zA-Z0-9]/g, '_')}.${file.fileType.toLowerCase()}`;
              console.warn('Generated fallback filename:', file.filename);
            } else {
              this.errorMessage = 'File name and type are missing. Cannot download.';
              console.error('FileDocument missing filename and title/fileType:', file);
              return;
            }
          }
          const url = this.userService.getFileUrl(file.filename!);
          this.userService.downloadFile(url).subscribe({
            next: (blob) => {
              const downloadUrl = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = file.title ?? file.filename ?? 'downloaded_file';
              a.click();
              window.URL.revokeObjectURL(downloadUrl);
            },
            error: (err: HttpErrorResponse) => {
              console.error('Failed to download file:', err);
              if (err.status === 400) {
                this.errorMessage = 'Invalid file name provided.';
              } else if (err.status === 404) {
                this.errorMessage = 'File not found on the server.';
              } else if (err.status === 500) {
                this.errorMessage = 'Server error while downloading file. Please check the backend logs.';
              } else {
                this.errorMessage = `Failed to download file: ${err.message}`;
              }
            }
          });
        },
        error: (err) => {
          console.error('Failed to get file details:', err);
          if (err.message.includes('File with ID')) {
            this.errorMessage = `File not found. It may belong to another user or have been deleted.`;
          } else if (err.message.includes('User email not found')) {
            this.errorMessage = 'Please log in to download files.';
          } else {
            this.errorMessage = `Failed to get file details: ${err.message}`;
          }
        }
      });
    }
  }
}